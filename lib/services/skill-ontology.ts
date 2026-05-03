import { getPrisma } from '../prisma';
import { getGraphSyncService } from './graph/graph-sync-service';
import type { Skill } from '@/lib/types/prisma';

// Core skill ontology data
const SKILL_ONTOLOGY = {
  // Programming Languages
  "JavaScript": {
    category: "Programming Languages",
    weight: 0.95,
    aliases: ["js", "javascript", "es6", "es2015", "es2016", "es2017", "es2018", "es2019", "es2020", "ecmascript"],
    parents: [],
    children: ["React", "Vue.js", "Angular", "Node.js", "Express", "Next.js", "Nuxt.js"],
    related: ["TypeScript", "CoffeeScript"]
  },
  "TypeScript": {
    category: "Programming Languages",
    weight: 0.90,
    aliases: ["ts"],
    parents: [],
    children: ["NestJS", "Angular"],
    related: ["JavaScript", "Node.js"]
  },
  "Python": {
    category: "Programming Languages",
    weight: 0.95,
    aliases: ["py", "python3"],
    parents: [],
    children: ["Django", "Flask", "FastAPI", "TensorFlow", "PyTorch", "Pandas", "NumPy"],
    related: ["R", "Julia"]
  },
  "Java": {
    category: "Programming Languages",
    weight: 0.95,
    aliases: ["java se", "java ee"],
    parents: [],
    children: ["Spring Boot", "Spring Framework", "Hibernate", "Maven", "Gradle"],
    related: ["Kotlin", "Scala"]
  },
  "C++": {
    category: "Programming Languages",
    weight: 0.85,
    aliases: ["cpp", "c plus plus"],
    parents: [],
    children: ["Qt", "Boost"],
    related: ["C", "C#"]
  },
  "C#": {
    category: "Programming Languages",
    weight: 0.85,
    aliases: ["csharp", "c sharp"],
    parents: [],
    children: [".NET", "ASP.NET", "Entity Framework"],
    related: ["Java", "C++"]
  },
  "Go": {
    category: "Programming Languages",
    weight: 0.80,
    aliases: ["golang"],
    parents: [],
    children: ["Gin", "Echo"],
    related: ["Rust", "C"]
  },
  "Rust": {
    category: "Programming Languages",
    weight: 0.75,
    aliases: [],
    parents: [],
    children: ["Tokio", "Rocket"],
    related: ["C++", "Go"]
  },

  // Frameworks
  "React": {
    category: "Frameworks",
    weight: 0.90,
    aliases: ["reactjs", "react.js"],
    parents: ["JavaScript"],
    children: ["Next.js", "Gatsby", "React Native"],
    related: ["Vue.js", "Angular", "Svelte"]
  },
  "Vue.js": {
    category: "Frameworks",
    weight: 0.80,
    aliases: ["vue", "vuejs"],
    parents: ["JavaScript"],
    children: ["Nuxt.js", "Quasar"],
    related: ["React", "Angular"]
  },
  "Angular": {
    category: "Frameworks",
    weight: 0.85,
    aliases: ["angularjs"],
    parents: ["TypeScript", "JavaScript"],
    children: ["Angular Material", "Ionic"],
    related: ["React", "Vue.js"]
  },
  "Node.js": {
    category: "Frameworks",
    weight: 0.85,
    aliases: ["nodejs", "node js", "node"],
    parents: ["JavaScript"],
    children: ["Express", "NestJS", "Fastify", "Koa"],
    related: ["Deno", "Bun"]
  },
  "Django": {
    category: "Frameworks",
    weight: 0.80,
    aliases: ["django rest framework"],
    parents: ["Python"],
    children: ["Django REST Framework"],
    related: ["Flask", "FastAPI"]
  },
  "Spring Boot": {
    category: "Frameworks",
    weight: 0.85,
    aliases: ["springboot", "spring-boot"],
    parents: ["Java"],
    children: ["Spring Security", "Spring Data", "Spring Cloud"],
    related: ["Quarkus", "Micronaut"]
  },

  // Databases
  "PostgreSQL": {
    category: "Databases",
    weight: 0.85,
    aliases: ["postgres", "psql"],
    parents: [],
    children: ["PostGIS", "TimescaleDB"],
    related: ["MySQL", "SQLite"]
  },
  "MongoDB": {
    category: "Databases",
    weight: 0.80,
    aliases: ["mongo"],
    parents: [],
    children: ["Mongoose"],
    related: ["CouchDB", "Cassandra"]
  },
  "Redis": {
    category: "Databases",
    weight: 0.75,
    aliases: [],
    parents: [],
    children: [],
    related: ["Memcached", "Elasticsearch"]
  },

  // Cloud & DevOps
  "AWS": {
    category: "Cloud & DevOps",
    weight: 0.90,
    aliases: ["amazon web services", "ec2", "s3", "lambda"],
    parents: [],
    children: ["EC2", "S3", "Lambda", "RDS", "CloudFormation"],
    related: ["Azure", "Google Cloud"]
  },
  "Docker": {
    category: "Cloud & DevOps",
    weight: 0.85,
    aliases: ["containerization", "docker compose"],
    parents: [],
    children: ["Kubernetes", "Docker Swarm"],
    related: ["Podman", "LXC"]
  },
  "Kubernetes": {
    category: "Cloud & DevOps",
    weight: 0.85,
    aliases: ["k8s", "k8", "kube"],
    parents: ["Docker"],
    children: ["Helm", "Istio", "Prometheus"],
    related: ["Docker Swarm", "Nomad"]
  },
  "Terraform": {
    category: "Cloud & DevOps",
    weight: 0.75,
    aliases: ["infrastructure as code"],
    parents: [],
    children: [],
    related: ["CloudFormation", "Pulumi"]
  },

  // Data & AI
  "Machine Learning": {
    category: "Data & AI",
    weight: 0.85,
    aliases: ["ml", "ai", "artificial intelligence"],
    parents: [],
    children: ["TensorFlow", "PyTorch", "Scikit-learn"],
    related: ["Deep Learning", "NLP"]
  },
  "TensorFlow": {
    category: "Data & AI",
    weight: 0.80,
    aliases: [],
    parents: ["Machine Learning", "Python"],
    children: ["Keras"],
    related: ["PyTorch", "MXNet"]
  },
  "PyTorch": {
    category: "Data & AI",
    weight: 0.80,
    aliases: [],
    parents: ["Machine Learning", "Python"],
    children: ["TorchVision", "TorchText"],
    related: ["TensorFlow", "JAX"]
  },

  // Tools
  "Git": {
    category: "Tools",
    weight: 0.70,
    aliases: ["version control", "github", "gitlab"],
    parents: [],
    children: ["GitHub", "GitLab", "Bitbucket"],
    related: ["SVN", "Mercurial"]
  },
  "Linux": {
    category: "Tools",
    weight: 0.75,
    aliases: ["ubuntu", "centos", "redhat", "debian"],
    parents: [],
    children: ["Bash", "Systemd"],
    related: ["macOS", "Windows"]
  }
};

export interface SkillOntology {
  name: string;
  category: string;
  weight: number;
  aliases: string[];
  parents: string[];
  children: string[];
  related: string[];
}

export interface SkillMatch {
  skill: string;
  matchType: 'exact' | 'parent' | 'child' | 'related' | 'alias';
  confidence: number;
  canonicalName: string;
}

export class SkillOntologyService {
  private skillCache: Map<string, SkillOntology> = new Map();
  private aliasMap: Map<string, string> = new Map();

  async initialize(): Promise<void> {
    const prisma = await getPrisma();
    if (!prisma) return;

    // Load existing skills into cache
    const skills = await prisma.skill.findMany({
      include: {
        fromRelations: {
          include: { toSkill: true }
        },
        toRelations: {
          include: { fromSkill: true }
        }
      }
    });

    skills.forEach((skill: Skill) => {
      const ontology: SkillOntology = {
        name: skill.name,
        category: skill.category,
        weight: skill.weight,
        aliases: (skill.aliases as string[]) || [],
        parents: [],
        children: [],
        related: []
      };

      // Build relationships from database
      skill.fromRelations?.forEach(rel => {
        switch (rel.type) {
          case 'PARENT':
            if (rel.toSkill?.name) {
              ontology.children.push(rel.toSkill.name)
            }
            break;
          case 'CHILD':
            if (rel.toSkill?.name) {
              ontology.parents.push(rel.toSkill.name)
            }
            break;
          case 'RELATED':
            if (rel.toSkill?.name) {
              ontology.related.push(rel.toSkill.name)
            }
            break;
        }
      });

      skill.toRelations?.forEach(rel => {
        switch (rel.type) {
          case 'PARENT':
            if (rel.fromSkill?.name) {
              ontology.parents.push(rel.fromSkill.name)
            }
            break;
          case 'CHILD':
            if (rel.fromSkill?.name) {
              ontology.children.push(rel.fromSkill.name)
            }
            break;
          case 'RELATED':
            if (rel.fromSkill?.name) {
              ontology.related.push(rel.fromSkill.name)
            }
            break;
        }
      });

      this.skillCache.set(skill.name.toLowerCase(), ontology);

      // Build alias map
      ontology.aliases.forEach(alias => {
        this.aliasMap.set(alias.toLowerCase(), skill.name);
      });
    });
  }

  async seedOntology(): Promise<void> {
    const prisma = await getPrisma();
    if (!prisma) return;

    console.log('Seeding skill ontology...');

    for (const [skillName, data] of Object.entries(SKILL_ONTOLOGY)) {
      // Create or update skill
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {
          category: data.category,
          weight: data.weight,
          aliases: data.aliases
        },
        create: {
          name: skillName,
          category: data.category,
          weight: data.weight,
          aliases: data.aliases
        }
      });

      // Create relationships
      await this.createRelationships(prisma, skill.id, skillName, data);
    }

    console.log('Skill ontology seeded successfully');
  }

  private async createRelationships(
    prisma: any,
    skillId: string,
    skillName: string,
    data: any
  ): Promise<void> {
    // Parents
    for (const parentName of data.parents) {
      const parentSkill = await prisma.skill.findUnique({
        where: { name: parentName }
      });
      if (parentSkill) {
        await prisma.skillRelation.upsert({
          where: {
            fromSkillId_toSkillId_type: {
              fromSkillId: skillId,
              toSkillId: parentSkill.id,
              type: 'CHILD'
            }
          },
          update: { weight: 0.8 },
          create: {
            fromSkillId: skillId,
            toSkillId: parentSkill.id,
            type: 'CHILD',
            weight: 0.8
          }
        });
      }
    }

    // Children
    for (const childName of data.children) {
      const childSkill = await prisma.skill.findUnique({
        where: { name: childName }
      });
      if (childSkill) {
        await prisma.skillRelation.upsert({
          where: {
            fromSkillId_toSkillId_type: {
              fromSkillId: skillId,
              toSkillId: childSkill.id,
              type: 'PARENT'
            }
          },
          update: { weight: 0.8 },
          create: {
            fromSkillId: skillId,
            toSkillId: childSkill.id,
            type: 'PARENT',
            weight: 0.8
          }
        });
      }
    }

    // Related
    for (const relatedName of data.related) {
      const relatedSkill = await prisma.skill.findUnique({
        where: { name: relatedName }
      });
      if (relatedSkill) {
        await prisma.skillRelation.upsert({
          where: {
            fromSkillId_toSkillId_type: {
              fromSkillId: skillId,
              toSkillId: relatedSkill.id,
              type: 'RELATED'
            }
          },
          update: { weight: 0.6 },
          create: {
            fromSkillId: skillId,
            toSkillId: relatedSkill.id,
            type: 'RELATED',
            weight: 0.6
          }
        });
      }
    }
  }

  normalizeSkill(input: string): SkillMatch | null {
    const normalized = input.toLowerCase().trim();

    // Direct match
    if (this.skillCache.has(normalized)) {
      const skill = this.skillCache.get(normalized)!;
      return {
        skill: input,
        matchType: 'exact',
        confidence: 1.0,
        canonicalName: skill.name
      };
    }

    // Alias match
    if (this.aliasMap.has(normalized)) {
      const canonicalName = this.aliasMap.get(normalized)!;
      const skill = this.skillCache.get(canonicalName.toLowerCase())!;
      return {
        skill: input,
        matchType: 'alias',
        confidence: 0.9,
        canonicalName: skill.name
      };
    }

    // Fuzzy matching
    for (const [key, skill] of this.skillCache.entries()) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return {
          skill: input,
          matchType: 'exact',
          confidence: 0.7,
          canonicalName: skill.name
        };
      }
    }

    return null;
  }

  normalizeSkills(inputs: string[]): SkillMatch[] {
    return inputs
      .map(input => this.normalizeSkill(input))
      .filter((match): match is SkillMatch => match !== null);
  }

  getSkillOntology(skillName: string): SkillOntology | null {
    return this.skillCache.get(skillName.toLowerCase()) || null;
  }

  calculateSkillMatch(jobSkill: string, candidateSkills: string[]): number {
    const jobNormalized = this.normalizeSkill(jobSkill);
    if (!jobNormalized) return 0;

    const jobOntology = this.getSkillOntology(jobNormalized.canonicalName);
    if (!jobOntology) return 0;

    // Exact match
    if (candidateSkills.some(s => {
      const normalized = this.normalizeSkill(s);
      return normalized?.canonicalName === jobNormalized.canonicalName;
    })) {
      return jobOntology.weight;
    }

    // Parent match (candidate has parent, job requires child)
    for (const candidateSkill of candidateSkills) {
      const candidateNormalized = this.normalizeSkill(candidateSkill);
      if (!candidateNormalized) continue;

      if (jobOntology.parents.includes(candidateNormalized.canonicalName)) {
        return jobOntology.weight * 0.8; // Parent implies some knowledge
      }
    }

    // Child match (candidate has child, job requires parent)
    for (const candidateSkill of candidateSkills) {
      const candidateNormalized = this.normalizeSkill(candidateSkill);
      if (!candidateNormalized) continue;

      if (jobOntology.children.includes(candidateNormalized.canonicalName)) {
        return jobOntology.weight * 0.7; // Child implies parent knowledge
      }
    }

    // Related match
    for (const candidateSkill of candidateSkills) {
      const candidateNormalized = this.normalizeSkill(candidateSkill);
      if (!candidateNormalized) continue;

      if (jobOntology.related.includes(candidateNormalized.canonicalName)) {
        return jobOntology.weight * 0.5; // Related skills count less
      }
    }

    return 0;
  }

  expandSkill(skillName: string): string[] {
    const ontology = this.getSkillOntology(skillName);
    if (!ontology) return [skillName];

    const expanded = new Set([skillName]);

    // Add children (specializations)
    ontology.children.forEach(child => expanded.add(child));

    // Add related skills
    ontology.related.forEach(related => expanded.add(related));

    return Array.from(expanded);
  }

  getSkillWeight(skillName: string): number {
    const ontology = this.getSkillOntology(skillName);
    return ontology?.weight || 0.5;
  }

  // New methods for AI Ranking Engine

  getChildSkills(skillName: string): string[] {
    const ontology = this.getSkillOntology(skillName);
    return ontology?.children || [];
  }

  getParentSkills(skillName: string): string[] {
    const ontology = this.getSkillOntology(skillName);
    return ontology?.parents || [];
  }

  getRelatedSkills(skillName: string): string[] {
    const ontology = this.getSkillOntology(skillName);
    return ontology?.related || [];
  }

  async getOntologyStats(): Promise<{
    totalSkills: number;
    categories: Record<string, number>;
    avgWeight: number;
  }> {
    const prisma = await getPrisma();
    if (!prisma) return { totalSkills: 0, categories: {}, avgWeight: 0 };

    const skills = await prisma.skill.findMany({
      select: { category: true, weight: true }
    });

    const categories: Record<string, number> = {};
    let totalWeight = 0;

    skills.forEach((skill: Skill) => {
      categories[skill.category] = (categories[skill.category] || 0) + 1;
      totalWeight += skill.weight;
    });

    return {
      totalSkills: skills.length,
      categories,
      avgWeight: skills.length > 0 ? totalWeight / skills.length : 0
    };
  }

  async syncToGraph(): Promise<void> {
    const graphSync = getGraphSyncService();
    if (!graphSync) return;

    const prisma = await getPrisma();
    if (!prisma) return;

    const skills = await prisma.skill.findMany({
      include: {
        fromRelations: {
          include: { toSkill: true }
        }
      }
    });

    for (const skill of skills) {
      await graphSync.syncSkill(skill.name, {
        category: skill.category,
        weight: skill.weight,
        aliases: skill.aliases as string[]
      });

      // Sync relationships
      for (const relation of skill.fromRelations ?? []) {
        if (!relation.toSkill?.name) continue
        await graphSync.syncSkillRelation(
          skill.name,
          relation.toSkill.name,
          relation.type,
          relation.weight
        );
      }
    }
  }
}

// Singleton instance
let ontologyServiceInstance: SkillOntologyService | null = null;

export function getSkillOntologyService(): SkillOntologyService {
  if (!ontologyServiceInstance) {
    ontologyServiceInstance = new SkillOntologyService();
  }
  return ontologyServiceInstance;
}

// Utility functions
export function normalizeSkillName(input: string): string {
  const match = getSkillOntologyService().normalizeSkill(input);
  return match?.canonicalName || input;
}

export function calculateSkillSimilarity(skill1: string, skill2: string): number {
  return getSkillOntologyService().calculateSkillMatch(skill1, [skill2]);
}