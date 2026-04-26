import neo4j, { Driver, Session } from 'neo4j-driver';

// Types for Neo4j operations
export interface GraphNode {
  id?: string;
  name?: string;
  category?: string;
  strength?: number;
  seniority?: string;
  skill_depth_level?: string;
  title?: string;
}

export interface GraphEdge {
  type: string;
  strength?: number;
  years?: number;
  usage?: string;
  importance?: string;
  score?: number;
  recommendation?: string;
  cluster?: string;
  skill?: string;
}

export interface GraphData {
  nodes: {
    skills: GraphNode[];
    skill_clusters: string[];
    tools: string[];
  };
  edges: GraphEdge[];
  metadata: {
    primary_domain: string;
    seniority_level: string;
    skill_depth_level: string;
  };
}

export class Neo4jGraphService {
  private driver: Driver;

  constructor(uri: string, username: string, password: string) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  // Skill Ontology Methods
  async syncSkill(skillName: string, data: { category: string; weight: number; aliases: string[] }): Promise<void> {
    await this.executeQuery(`
      MERGE (s:Skill {name: $name})
      ON CREATE SET s.category = $category, s.weight = $weight, s.aliases = $aliases
      ON MATCH SET s.category = $category, s.weight = $weight, s.aliases = $aliases
    `, {
      name: skillName,
      category: data.category,
      weight: data.weight,
      aliases: data.aliases
    });
  }

  async syncSkillRelation(fromSkill: string, toSkill: string, type: string, weight: number): Promise<void> {
    const relationType = type.toUpperCase();
    await this.executeQuery(`
      MATCH (from:Skill {name: $fromSkill}), (to:Skill {name: $toSkill})
      MERGE (from)-[r:${relationType}]->(to)
      SET r.weight = $weight
    `, {
      fromSkill,
      toSkill,
      weight
    });
  }

  async findSkillsByOntology(query: string): Promise<any[]> {
    // Search skills by name, category, or aliases
    return this.executeQuery(`
      MATCH (s:Skill)
      WHERE s.name CONTAINS $query
         OR s.category CONTAINS $query
         OR ANY(alias IN s.aliases WHERE alias CONTAINS $query)
      RETURN s.name as name, s.category as category, s.weight as weight, s.aliases as aliases
      ORDER BY s.weight DESC
      LIMIT 20
    `, { query });
  }

  async getSkillHierarchy(skillName: string): Promise<any> {
    // Get skill with its parents and children
    const result = await this.executeQuery(`
      MATCH (s:Skill {name: $skillName})
      OPTIONAL MATCH (s)-[:CHILD_OF*1..3]->(parent:Skill)
      OPTIONAL MATCH (s)<-[:CHILD_OF*1..3]-(child:Skill)
      OPTIONAL MATCH (s)-[r:RELATED]-(related:Skill)
      RETURN s.name as skill,
             collect(DISTINCT parent.name) as parents,
             collect(DISTINCT child.name) as children,
             collect(DISTINCT {name: related.name, weight: r.weight}) as related
    `, { skillName });

    return result[0] || null;
  }

  async findRelatedSkills(skillName: string, depth: number = 2): Promise<string[]> {
    const result = await this.executeQuery(`
      MATCH (s:Skill {name: $skillName})
      MATCH (s)-[:RELATED*1..${depth}]-(related:Skill)
      WHERE related.name <> $skillName
      RETURN DISTINCT related.name as skill
      ORDER BY related.weight DESC
      LIMIT 10
    `, { skillName });

    return result.map((record: any) => record.skill);
  }

  async findSkillPath(fromSkill: string, toSkill: string): Promise<any[]> {
    // Find shortest path between skills
    return this.executeQuery(`
      MATCH path = shortestPath(
        (from:Skill {name: $fromSkill})-[*]-(to:Skill {name: $toSkill})
      )
      RETURN path
    `, { fromSkill, toSkill });
  }

  async getSkillClusters(): Promise<any[]> {
    // Find skill clusters based on relationships
    return this.executeQuery(`
      MATCH (s1:Skill)-[r]-(s2:Skill)
      WHERE r.weight > 0.7
      WITH s1, s2, r
      ORDER BY r.weight DESC
      RETURN s1.category as category,
             collect({from: s1.name, to: s2.name, weight: r.weight}) as connections
      LIMIT 10
    `);
  }

  async close(): Promise<void> {
    await this.driver.close();
  }

  private async executeQuery(query: string, params: Record<string, any> = {}): Promise<any> {
    const session: Session = this.driver.session();
    try {
      const result = await session.run(query, params);
      return result.records.map(record => record.toObject());
    } finally {
      await session.close();
    }
  }

  // Candidate operations
  async createOrUpdateCandidate(candidateId: string, candidateData: {
    name: string;
    seniority: string;
    skill_depth_level: string;
  }): Promise<void> {
    const query = `
      MERGE (c:Candidate {id: $id})
      SET c.name = $name,
          c.seniority = $seniority,
          c.skill_depth_level = $skill_depth_level,
          c.updated_at = datetime()
    `;

    await this.executeQuery(query, {
      id: candidateId,
      ...candidateData
    });
  }

  async syncCandidateSkills(candidateId: string, skills: Array<{
    name: string;
    category: string;
    strength: number;
    years: number;
    usage: string;
  }>): Promise<void> {
    // First, remove existing skill relationships
    await this.executeQuery(`
      MATCH (c:Candidate {id: $candidateId})-[r:HAS_SKILL]->(s:Skill)
      DELETE r
    `, { candidateId });

    // Then create new skill relationships
    const query = `
      MATCH (c:Candidate {id: $candidateId})
      UNWIND $skills AS skillData
      MERGE (s:Skill {name: skillData.name})
      ON CREATE SET s.category = skillData.category
      MERGE (c)-[:HAS_SKILL {
        strength: skillData.strength,
        years: skillData.years,
        usage: skillData.usage
      }]->(s)
    `;

    await this.executeQuery(query, { candidateId, skills });
  }

  async syncCandidateClusters(candidateId: string, clusters: string[]): Promise<void> {
    // Remove existing cluster relationships
    await this.executeQuery(`
      MATCH (c:Candidate {id: $candidateId})-[r:BELONGS_TO]->(sc:SkillCluster)
      DELETE r
    `, { candidateId });

    // Create new cluster relationships
    const query = `
      MATCH (c:Candidate {id: $candidateId})
      UNWIND $clusters AS clusterName
      MERGE (sc:SkillCluster {name: clusterName})
      MERGE (c)-[:BELONGS_TO]->(sc)
    `;

    await this.executeQuery(query, { candidateId, clusters });
  }

  async syncMissingSkills(candidateId: string, missingSkills: string[]): Promise<void> {
    // Remove existing missing skill relationships
    await this.executeQuery(`
      MATCH (c:Candidate {id: $candidateId})-[r:MISSING_SKILL]->(s:Skill)
      DELETE r
    `, { candidateId });

    // Create new missing skill relationships
    const query = `
      MATCH (c:Candidate {id: $candidateId})
      UNWIND $missingSkills AS skillName
      MERGE (s:Skill {name: skillName})
      MERGE (c)-[:MISSING_SKILL]->(s)
    `;

    await this.executeQuery(query, { candidateId, missingSkills });
  }

  // Job operations
  async createOrUpdateJob(jobId: string, jobData: {
    title: string;
    requiredSkills: string[];
    preferredSkills: string[];
    skillClusters: string[];
  }): Promise<void> {
    // Create/update job node
    await this.executeQuery(`
      MERGE (j:Job {id: $id})
      SET j.title = $title,
          j.updated_at = datetime()
    `, { id: jobId, title: jobData.title });

    // Sync required skills
    await this.executeQuery(`
      MATCH (j:Job {id: $jobId})
      OPTIONAL MATCH (j)-[r:REQUIRES]->(s:Skill)
      DELETE r
      WITH j
      UNWIND $requiredSkills AS skillName
      MERGE (s:Skill {name: skillName})
      MERGE (j)-[:REQUIRES {importance: "HIGH"}]->(s)
    `, { jobId, requiredSkills: jobData.requiredSkills });

    // Sync preferred skills
    await this.executeQuery(`
      MATCH (j:Job {id: $jobId})
      OPTIONAL MATCH (j)-[r:PREFERS]->(s:Skill)
      DELETE r
      WITH j
      UNWIND $preferredSkills AS skillName
      MERGE (s:Skill {name: skillName})
      MERGE (j)-[:PREFERS {importance: "MEDIUM"}]->(s)
    `, { jobId, preferredSkills: jobData.preferredSkills });

    // Sync skill clusters
    await this.executeQuery(`
      MATCH (j:Job {id: $jobId})
      OPTIONAL MATCH (j)-[r:BELONGS_TO_CLUSTER]->(sc:SkillCluster)
      DELETE r
      WITH j
      UNWIND $skillClusters AS clusterName
      MERGE (sc:SkillCluster {name: clusterName})
      MERGE (j)-[:BELONGS_TO_CLUSTER]->(sc)
    `, { jobId, skillClusters: jobData.skillClusters });
  }

  // Matching operations
  async createCandidateJobMatch(candidateId: string, jobId: string, matchData: {
    score: number;
    recommendation: string;
  }): Promise<void> {
    const query = `
      MATCH (c:Candidate {id: $candidateId}), (j:Job {id: $jobId})
      MERGE (c)-[r:MATCHED_TO]->(j)
      SET r.score = $score,
          r.recommendation = $recommendation,
          r.created_at = datetime()
    `;

    await this.executeQuery(query, {
      candidateId,
      jobId,
      ...matchData
    });
  }

  // Query operations
  async findCandidatesBySkill(skillName: string, minStrength: number = 0): Promise<any[]> {
    const query = `
      MATCH (c:Candidate)-[r:HAS_SKILL]->(s:Skill {name: $skillName})
      WHERE r.strength >= $minStrength
      RETURN c.id as candidateId, c.name as name, r.strength as strength, r.years as years
      ORDER BY r.strength DESC
    `;

    return await this.executeQuery(query, { skillName, minStrength });
  }

  async findBestCandidatesForJob(jobId: string, limit: number = 10): Promise<any[]> {
    const query = `
      MATCH (j:Job {id: $jobId})-[:REQUIRES]->(s:Skill)
      MATCH (c:Candidate)-[r:HAS_SKILL]->(s)
      WITH c, j, count(s) as matchedSkills, avg(r.strength) as avgStrength
      OPTIONAL MATCH (c)-[m:MATCHED_TO]->(j)
      RETURN c.id as candidateId,
             c.name as name,
             matchedSkills,
             avgStrength,
             m.score as existingScore,
             m.recommendation as recommendation
      ORDER BY matchedSkills DESC, avgStrength DESC
      LIMIT $limit
    `;

    return await this.executeQuery(query, { jobId, limit });
  }

  async findSimilarCandidates(candidateId: string, limit: number = 5): Promise<any[]> {
    const query = `
      MATCH (c1:Candidate {id: $candidateId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(c2:Candidate)
      WHERE c1 <> c2
      WITH c2, count(s) as overlap, collect(s.name) as sharedSkills
      RETURN c2.id as candidateId,
             c2.name as name,
             overlap,
             sharedSkills
      ORDER BY overlap DESC
      LIMIT $limit
    `;

    return await this.executeQuery(query, { candidateId, limit });
  }

  async findSkillGapsForCandidate(candidateId: string, jobId: string): Promise<any[]> {
    const query = `
      MATCH (j:Job {id: $jobId})-[:REQUIRES]->(s:Skill)
      WHERE NOT EXISTS {
        MATCH (:Candidate {id: $candidateId})-[:HAS_SKILL]->(s)
      }
      RETURN s.name as skillName, s.category as category
    `;

    return await this.executeQuery(query, { candidateId, jobId });
  }

  async getCandidateSkillProfile(candidateId: string): Promise<any> {
    const query = `
      MATCH (c:Candidate {id: $candidateId})
      OPTIONAL MATCH (c)-[r:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (c)-[:BELONGS_TO]->(sc:SkillCluster)
      RETURN c,
             collect(DISTINCT {
               skill: s.name,
               category: s.category,
               strength: r.strength,
               years: r.years,
               usage: r.usage
             }) as skills,
             collect(DISTINCT sc.name) as clusters
    `;

    const results = await this.executeQuery(query, { candidateId });
    return results[0] || null;
  }

  // Bulk operations for data migration
  async bulkSyncCandidates(candidates: Array<{
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
  }>): Promise<void> {
    for (const candidate of candidates) {
      await this.createOrUpdateCandidate(candidate.id, {
        name: candidate.name,
        seniority: candidate.seniority,
        skill_depth_level: candidate.skill_depth_level
      });

      if (candidate.skills.length > 0) {
        await this.syncCandidateSkills(candidate.id, candidate.skills);
      }

      if (candidate.clusters.length > 0) {
        await this.syncCandidateClusters(candidate.id, candidate.clusters);
      }
    }
  }
}

// Factory function to create graph service
export function createGraphService(): Neo4jGraphService | null {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !username || !password) {
    console.warn('Neo4j credentials not configured, graph operations will be disabled');
    return null;
  }

  return new Neo4jGraphService(uri, username, password);
}