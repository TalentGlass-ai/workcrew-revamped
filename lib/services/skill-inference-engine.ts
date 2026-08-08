import { getPrisma } from '../prisma';
import { getSkillOntologyService } from './skill-ontology';

export interface InferredSkill {
  skillName: string;
  confidence: number;
  reason: string;
  inferenceType: 'CO_OCCURRENCE' | 'HIERARCHICAL' | 'ROLE_BASED' | 'GRAPH_BASED';
}

export interface SkillInferenceResult {
  inferredSkills: InferredSkill[];
  totalInferred: number;
  highConfidenceCount: number;
}

export class SkillInferenceEngine {
  private ontologyService = getSkillOntologyService();

  /**
   * Main inference method - combines all inference types
   */
  async inferSkillsForCandidate(candidateId: string): Promise<SkillInferenceResult> {
    const prisma = await getPrisma();
    if (!prisma) {
      throw new Error('Database connection not available');
    }

    // Get candidate with skills
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        skills: true,
        inferredSkills: true
      }
    });

    if (!candidate) {
      throw new Error(`Candidate ${candidateId} not found`);
    }

    const explicitSkills = candidate.skills.map((s: any) => s.skillName);
    const existingInferred = candidate.inferredSkills.map((s: any) => s.skillName);

    // Combine all inference methods
    const inferences = await Promise.all([
      this.inferFromCoOccurrence(explicitSkills, existingInferred),
      this.inferFromHierarchy(explicitSkills, existingInferred),
      this.inferFromRole(candidate, existingInferred),
      this.inferFromGraph(candidateId, existingInferred)
    ]);

    // Merge and deduplicate
    const allInferred = this.mergeInferences(inferences.flat());

    // Filter by confidence threshold
    const highConfidence = allInferred.filter(inf => inf.confidence >= 0.6);
    const finalInferred = allInferred.slice(0, 10); // Max 10 inferred skills

    // Store in database
    await this.storeInferredSkills(candidateId, finalInferred);

    return {
      inferredSkills: finalInferred,
      totalInferred: finalInferred.length,
      highConfidenceCount: highConfidence.length
    };
  }

  /**
   * Co-occurrence inference: skills that frequently appear together
   */
  private async inferFromCoOccurrence(
    explicitSkills: string[],
    existingInferred: string[]
  ): Promise<InferredSkill[]> {
    const inferences: InferredSkill[] = [];

    // Define common skill co-occurrence patterns
    const coOccurrencePatterns = {
      'Node.js': ['Express', 'MongoDB', 'npm', 'REST APIs'],
      'React': ['JavaScript', 'TypeScript', 'Redux', 'Next.js', 'CSS', 'HTML'],
      'Python': ['Django', 'Flask', 'FastAPI', 'pandas', 'NumPy', 'Jupyter'],
      'Java': ['Spring Boot', 'Hibernate', 'Maven', 'JUnit', 'Microservices'],
      'AWS': ['EC2', 'S3', 'Lambda', 'RDS', 'CloudFormation'],
      'Docker': ['Kubernetes', 'Docker Compose', 'Containerization'],
      'PostgreSQL': ['SQL', 'Database Design', 'Indexing', 'Transactions'],
      'MongoDB': ['NoSQL', 'Document Database', 'Aggregation', 'Indexing']
    };

    for (const explicitSkill of explicitSkills) {
      const patterns = coOccurrencePatterns[explicitSkill as keyof typeof coOccurrencePatterns];
      if (patterns) {
        for (const inferredSkill of patterns) {
          if (!explicitSkills.includes(inferredSkill) && !existingInferred.includes(inferredSkill)) {
            const confidence = this.calculateCoOccurrenceConfidence(explicitSkill, inferredSkill);
            if (confidence >= 0.5) {
              inferences.push({
                skillName: inferredSkill,
                confidence,
                reason: `Frequently used with ${explicitSkill}`,
                inferenceType: 'CO_OCCURRENCE'
              });
            }
          }
        }
      }
    }

    return inferences;
  }

  /**
   * Hierarchical inference: from ontology parent/child relationships
   */
  private async inferFromHierarchy(
    explicitSkills: string[],
    existingInferred: string[]
  ): Promise<InferredSkill[]> {
    const inferences: InferredSkill[] = [];

    for (const skill of explicitSkills) {
      // Get ontology relationships
      const ontology = this.ontologyService.getSkillOntology(skill);
      if (ontology) {
        // Infer parent skills (broader categories)
        if (ontology.parents && ontology.parents.length > 0) {
          for (const parent of ontology.parents) {
            if (!explicitSkills.includes(parent) && !existingInferred.includes(parent)) {
              inferences.push({
                skillName: parent,
                confidence: 0.4, // Lower confidence for hierarchical inference
                reason: `Broader category of ${skill}`,
                inferenceType: 'HIERARCHICAL'
              });
            }
          }
        }

        // Infer complementary skills
        if (ontology.related && ontology.related.length > 0) {
          for (const comp of ontology.related) {
            if (!explicitSkills.includes(comp) && !existingInferred.includes(comp)) {
              inferences.push({
                skillName: comp,
                confidence: 0.6,
                reason: `Related to ${skill}`,
                inferenceType: 'HIERARCHICAL'
              });
            }
          }
        }
      }
    }

    return inferences;
  }

  /**
   * Role-based inference: typical tech stacks for job roles
   */
  private async inferFromRole(
    candidate: any,
    existingInferred: string[]
  ): Promise<InferredSkill[]> {
    const inferences: InferredSkill[] = [];

    const role = candidate.currentRole?.toLowerCase() || '';
    const experience = candidate.totalExperience || 0;

    // Define role-based skill patterns
    const rolePatterns = {
      'backend': {
        skills: ['REST APIs', 'Database Design', 'Server Architecture', 'Caching'],
        confidence: 0.5
      },
      'frontend': {
        skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design', 'Browser APIs'],
        confidence: 0.6
      },
      'fullstack': {
        skills: ['REST APIs', 'Database Design', 'HTML', 'CSS', 'Deployment'],
        confidence: 0.5
      },
      'devops': {
        skills: ['CI/CD', 'Infrastructure as Code', 'Monitoring', 'Logging'],
        confidence: 0.7
      },
      'data': {
        skills: ['SQL', 'Data Analysis', 'ETL', 'Data Visualization'],
        confidence: 0.6
      },
      'mobile': {
        skills: ['Mobile UI/UX', 'App Store Deployment', 'Push Notifications'],
        confidence: 0.5
      }
    };

    for (const [roleKey, pattern] of Object.entries(rolePatterns)) {
      if (role.includes(roleKey)) {
        for (const skill of pattern.skills) {
          if (!candidate.primarySkills?.includes(skill) && !existingInferred.includes(skill)) {
            const confidence = Math.min(pattern.confidence, pattern.confidence * (experience / 5)); // Scale by experience
            inferences.push({
              skillName: skill,
              confidence,
              reason: `Typical for ${roleKey} role`,
              inferenceType: 'ROLE_BASED'
            });
          }
        }
      }
    }

    return inferences;
  }

  /**
   * Graph-based inference: BFS through skill ontology children (2 hops)
   * ponytail: uses in-memory SKILL_ONTOLOGY instead of Neo4j; swap driver when Neo4j is available
   */
  private async inferFromGraph(
    candidateId: string,
    existingInferred: string[]
  ): Promise<InferredSkill[]> {
    try {
      const prisma = await getPrisma();
      if (!prisma) return [];

      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: { skills: true },
      });

      const explicitSkills = new Set<string>(candidate?.skills?.map((s: any) => s.skillName) ?? []);
      const excluded = new Set<string>([...explicitSkills, ...existingInferred]);
      const inferences: InferredSkill[] = [];
      const seen = new Set<string>();

      // Hop 1: direct children of explicit skills
      const hop1: string[] = [];
      for (const skill of explicitSkills) {
        const ontology = this.ontologyService.getSkillOntology(skill);
        for (const child of ontology?.children ?? []) {
          if (!excluded.has(child) && !seen.has(child)) {
            seen.add(child);
            hop1.push(child);
            inferences.push({
              skillName: child,
              confidence: 0.55,
              reason: `Specialization of ${skill}`,
              inferenceType: 'GRAPH_BASED',
            });
          }
        }
      }

      // Hop 2: children of children
      for (const skill of hop1) {
        const ontology = this.ontologyService.getSkillOntology(skill);
        for (const child of ontology?.children ?? []) {
          if (!excluded.has(child) && !seen.has(child)) {
            seen.add(child);
            inferences.push({
              skillName: child,
              confidence: 0.4,
              reason: `Extended specialization via ${skill}`,
              inferenceType: 'GRAPH_BASED',
            });
          }
        }
      }

      return inferences;
    } catch (error) {
      console.warn('Graph-based inference not available:', error);
      return [];
    }
  }

  /**
   * Calculate confidence for co-occurrence patterns
   */
  private calculateCoOccurrenceConfidence(fromSkill: string, toSkill: string): number {
    // Define confidence levels for common co-occurrences
    const confidenceMap: Record<string, Record<string, number>> = {
      'Node.js': { 'Express': 0.8, 'MongoDB': 0.7, 'npm': 0.9, 'REST APIs': 0.6 },
      'React': { 'JavaScript': 0.9, 'TypeScript': 0.7, 'Redux': 0.6, 'Next.js': 0.5 },
      'Python': { 'Django': 0.7, 'Flask': 0.6, 'pandas': 0.6, 'NumPy': 0.5 },
      'Java': { 'Spring Boot': 0.8, 'Hibernate': 0.6, 'Maven': 0.7, 'JUnit': 0.6 },
      'AWS': { 'EC2': 0.7, 'S3': 0.8, 'Lambda': 0.6, 'RDS': 0.5 },
      'Docker': { 'Kubernetes': 0.6, 'Docker Compose': 0.7, 'Containerization': 0.8 }
    };

    return confidenceMap[fromSkill]?.[toSkill] || 0.4;
  }

  /**
   * Merge and deduplicate inferences, keeping highest confidence
   */
  private mergeInferences(inferences: InferredSkill[]): InferredSkill[] {
    const skillMap = new Map<string, InferredSkill>();

    for (const inf of inferences) {
      const existing = skillMap.get(inf.skillName);
      if (!existing || inf.confidence > existing.confidence) {
        skillMap.set(inf.skillName, inf);
      }
    }

    return Array.from(skillMap.values())
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Store inferred skills in database
   */
  private async storeInferredSkills(candidateId: string, inferences: InferredSkill[]): Promise<void> {
    const prisma = await getPrisma();
    if (!prisma) return;

    // Clear existing inferences
    await prisma.inferredSkill.deleteMany({
      where: { candidateId }
    });

    // Insert new inferences
    if (inferences.length > 0) {
      await prisma.inferredSkill.createMany({
        data: inferences.map(inf => ({
          candidateId,
          skillName: inf.skillName,
          confidence: inf.confidence,
          reason: inf.reason,
          inferenceType: inf.inferenceType
        }))
      });
    }
  }

  /**
   * Get inferred skills for a candidate (cached)
   */
  async getInferredSkills(candidateId: string): Promise<InferredSkill[]> {
    const prisma = await getPrisma();
    if (!prisma) return [];

    const inferred = await prisma.inferredSkill.findMany({
      where: { candidateId },
      orderBy: { confidence: 'desc' }
    });

    return inferred.map((skill: any) => ({
      skillName: skill.skillName,
      confidence: skill.confidence,
      reason: skill.reason,
      inferenceType: skill.inferenceType as any
    }));
  }
}

// Singleton instance
let inferenceEngine: SkillInferenceEngine | null = null;

export function getSkillInferenceEngine(): SkillInferenceEngine {
  if (!inferenceEngine) {
    inferenceEngine = new SkillInferenceEngine();
  }
  return inferenceEngine;
}