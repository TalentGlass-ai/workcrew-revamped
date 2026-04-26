import { getPrisma } from '../../prisma';
import { createGraphService, Neo4jGraphService } from './neo4j-service';
import { EvaluationResult } from '../candidate-evaluation';

// Types for sync operations
export interface CandidateGraphData {
  id: string;
  name: string;
  seniority: string;
  skill_depth_level: string;
  skills: Array<{
    name: string;
    category: string;
    strength: number;
    years: number;
    usage: string;
  }>;
  clusters: string[];
  missingSkills?: string[];
}

export interface JobGraphData {
  id: string;
  title: string;
  requiredSkills: string[];
  preferredSkills: string[];
  skillClusters: string[];
}

export class GraphSyncService {
  private graphService: Neo4jGraphService | null;

  constructor() {
    this.graphService = createGraphService();
  }

  async syncCandidateEvaluation(candidateId: string, evaluationResult: EvaluationResult): Promise<void> {
    if (!this.graphService) {
      console.warn('Graph service not available, skipping sync');
      return;
    }

    try {
      // Extract data from evaluation result
      const candidateData: CandidateGraphData = {
        id: candidateId,
        name: 'Candidate', // TODO: Get from database
        seniority: evaluationResult.graph_enrichment.metadata.seniority_level,
        skill_depth_level: evaluationResult.graph_enrichment.metadata.skill_depth_level,
        skills: [
          ...evaluationResult.skill_intelligence.primary_skills.map(s => ({
            name: s.name,
            category: s.category,
            strength: s.strength_score,
            years: s.years_experience,
            usage: 'PRIMARY'
          })),
          ...evaluationResult.skill_intelligence.secondary_skills.map(s => ({
            name: s.name,
            category: s.category,
            strength: s.strength_score,
            years: s.years_experience,
            usage: 'SECONDARY'
          }))
        ],
        clusters: evaluationResult.skill_clusters,
        missingSkills: evaluationResult.skill_match_analysis.missing_skills
      };

      // Sync to graph
      await this.syncCandidateToGraph(candidateData);

      console.log(`Successfully synced candidate ${candidateId} to graph`);

    } catch (error) {
      console.error('Failed to sync candidate evaluation to graph:', error);
      throw error;
    }
  }

  async syncCandidateToGraph(candidateData: CandidateGraphData): Promise<void> {
    if (!this.graphService) return;

    // Create/update candidate node
    await this.graphService.createOrUpdateCandidate(candidateData.id, {
      name: candidateData.name,
      seniority: candidateData.seniority,
      skill_depth_level: candidateData.skill_depth_level
    });

    // Sync skills
    if (candidateData.skills.length > 0) {
      await this.graphService.syncCandidateSkills(candidateData.id, candidateData.skills);
    }

    // Sync clusters
    if (candidateData.clusters.length > 0) {
      await this.graphService.syncCandidateClusters(candidateData.id, candidateData.clusters);
    }

    // Sync missing skills
    if (candidateData.missingSkills && candidateData.missingSkills.length > 0) {
      await this.graphService.syncMissingSkills(candidateData.id, candidateData.missingSkills);
    }
  }

  async syncJobToGraph(jobData: JobGraphData): Promise<void> {
    if (!this.graphService) return;

    await this.graphService.createOrUpdateJob(jobData.id, {
      title: jobData.title,
      requiredSkills: jobData.requiredSkills,
      preferredSkills: jobData.preferredSkills,
      skillClusters: jobData.skillClusters
    });
  }

  async syncCandidateJobMatch(candidateId: string, jobId: string, evaluationResult: EvaluationResult): Promise<void> {
    if (!this.graphService) return;

    await this.graphService.createCandidateJobMatch(candidateId, jobId, {
      score: evaluationResult.fit_score,
      recommendation: evaluationResult.recommendation
    });
  }

  // Query methods that leverage the graph
  async findBestCandidatesForJob(jobId: string, limit: number = 10): Promise<any[]> {
    if (!this.graphService) {
      // Fallback to basic database query
      return this.fallbackCandidateSearch(jobId, limit);
    }

    return await this.graphService.findBestCandidatesForJob(jobId, limit);
  }

  async findSimilarCandidates(candidateId: string, limit: number = 5): Promise<any[]> {
    if (!this.graphService) {
      return [];
    }

    return await this.graphService.findSimilarCandidates(candidateId, limit);
  }

  async findSkillGapsForCandidate(candidateId: string, jobId: string): Promise<any[]> {
    if (!this.graphService) {
      return [];
    }

    return await this.graphService.findSkillGapsForCandidate(candidateId, jobId);
  }

  async findCandidatesBySkill(skillName: string, minStrength: number = 0): Promise<any[]> {
    if (!this.graphService) {
      return this.fallbackSkillSearch(skillName, minStrength);
    }

    return await this.graphService.findCandidatesBySkill(skillName, minStrength);
  }

  // Fallback methods when Neo4j is not available
  private async fallbackCandidateSearch(jobId: string, limit: number): Promise<any[]> {
    const prisma = await getPrisma();
    if (!prisma) return [];

    // Get job requirements
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { requiredSkills: true, preferredSkills: true }
    });

    if (!job) return [];

    // Simple candidate search based on skills
    const candidates = await prisma.candidate.findMany({
      where: {
        skills: {
          some: {
            skillName: {
              in: [...job.requiredSkills, ...job.preferredSkills]
            }
          }
        }
      },
      select: {
        id: true,
        user: { select: { name: true } },
        skills: {
          where: {
            skillName: {
              in: [...job.requiredSkills, ...job.preferredSkills]
            }
          },
          select: { skillName: true, score: true }
        }
      },
      take: limit
    });

    return candidates.map((c: any) => ({
      candidateId: c.id,
      name: c.user.name,
      matchedSkills: c.skills.length,
      avgStrength: c.skills.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / c.skills.length
    }));
  }

  private async fallbackSkillSearch(skillName: string, minStrength: number): Promise<any[]> {
    const prisma = await getPrisma();
    if (!prisma) return [];

    const candidates = await prisma.candidate.findMany({
      where: {
        skills: {
          some: {
            skillName: skillName,
            score: { gte: minStrength }
          }
        }
      },
      select: {
        id: true,
        user: { select: { name: true } },
        skills: {
          where: { skillName: skillName },
          select: { score: true }
        }
      }
    });

    return candidates.map((c: any) => ({
      candidateId: c.id,
      name: c.user.name,
      strength: c.skills[0]?.score || 0
    }));
  }

  // Data migration utilities
  async migrateExistingCandidates(): Promise<void> {
    if (!this.graphService) return;

    const prisma = await getPrisma();
    if (!prisma) return;

    console.log('Starting candidate migration to Neo4j...');

    const candidates = await prisma.candidate.findMany({
      include: {
        user: { select: { name: true } },
        skills: true
      },
      where: {
        skillIntelligence: { not: null }
      }
    });

    const graphCandidates = candidates
      .filter((c: any) => c.skillIntelligence)
      .map((c: any) => {
        const skillIntel = c.skillIntelligence as any;
        return {
          id: c.id,
          name: c.user.name,
          seniority: skillIntel?.graph_enrichment?.metadata?.seniority_level || 'Junior',
          skill_depth_level: skillIntel?.graph_enrichment?.metadata?.skill_depth_level || 'SHALLOW',
          skills: [
            ...(skillIntel?.skill_intelligence?.primary_skills || []).map((s: any) => ({
              name: s.name,
              category: s.category,
              strength: s.strength_score,
              years: s.years_experience,
              usage: 'PRIMARY'
            })),
            ...(skillIntel?.skill_intelligence?.secondary_skills || []).map((s: any) => ({
              name: s.name,
              category: s.category,
              strength: s.strength_score,
              years: s.years_experience,
              usage: 'SECONDARY'
            }))
          ],
          clusters: skillIntel?.skill_clusters || []
        };
      });

    if (graphCandidates.length > 0) {
      await this.graphService.bulkSyncCandidates(graphCandidates);
      console.log(`Migrated ${graphCandidates.length} candidates to Neo4j`);
    }
  }

  // Skill Ontology Methods
  async syncSkill(skillName: string, data: { category: string; weight: number; aliases: string[] }): Promise<void> {
    if (!this.graphService) return;

    await this.graphService.syncSkill(skillName, data);
  }

  async syncSkillRelation(fromSkill: string, toSkill: string, type: string, weight: number): Promise<void> {
    if (!this.graphService) return;

    await this.graphService.syncSkillRelation(fromSkill, toSkill, type, weight);
  }

  async findSkillsByOntology(query: string): Promise<any[]> {
    if (!this.graphService) return [];

    return this.graphService.findSkillsByOntology(query);
  }

  async getSkillHierarchy(skillName: string): Promise<any> {
    if (!this.graphService) return null;

    return this.graphService.getSkillHierarchy(skillName);
  }

  async findRelatedSkills(skillName: string, depth: number = 2): Promise<string[]> {
    if (!this.graphService) return [];

    return this.graphService.findRelatedSkills(skillName, depth);
  }

  async close(): Promise<void> {
    if (this.graphService) {
      await this.graphService.close();
    }
  }
}

// Singleton instance
let graphSyncInstance: GraphSyncService | null = null;

export function getGraphSyncService(): GraphSyncService {
  if (!graphSyncInstance) {
    graphSyncInstance = new GraphSyncService();
  }
  return graphSyncInstance;
}