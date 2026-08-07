import { getPrisma } from '../prisma';

// Skill normalization data
const SKILL_CATEGORIES = {
  'Programming Languages': [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby',
    'scala', 'kotlin', 'swift', 'r', 'matlab', 'perl', 'lua', 'dart', 'elixir', 'clojure'
  ],
  'Frameworks': [
    'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'express', 'fastapi', 'django',
    'flask', 'spring boot', 'asp.net', 'laravel', 'rails', 'symfony', 'nestjs', 'meteor'
  ],
  'Data & AI': [
    'machine learning', 'deep learning', 'artificial intelligence', 'nlp', 'computer vision',
    'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'keras', 'opencv', 'spacy',
    'hugging face', 'data science', 'big data', 'apache spark', 'hadoop'
  ],
  'Cloud & DevOps': [
    'aws', 'amazon web services', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes',
    'terraform', 'ansible', 'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci',
    'linux', 'bash', 'shell scripting', 'nginx', 'apache', 'prometheus', 'grafana'
  ],
  'Databases': [
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
    'oracle', 'sql server', 'sqlite', 'couchdb', 'neo4j', 'influxdb', 'timescaledb'
  ],
  'Tools': [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'discord',
    'postman', 'swagger', 'figma', 'sketch', 'photoshop', 'illustrator', 'vscode',
    'intellij', 'pycharm', 'webstorm'
  ],
  'Methodologies': [
    'agile', 'scrum', 'kanban', 'waterfall', 'tdd', 'bdd', 'ci/cd', 'devops', 'microservices',
    'serverless', 'test driven development', 'behavior driven development'
  ]
};

const SKILL_SYNONYMS: Record<string, string[]> = {
  'javascript': ['js', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'node'],
  'typescript': ['ts'],
  'python': ['py'],
  'java': ['java se', 'java ee'],
  'c++': ['cpp', 'c plus plus'],
  'c#': ['csharp', 'c sharp'],
  'go': ['golang'],
  'react': ['reactjs', 'react.js'],
  'angular': ['angularjs', 'angular.js'],
  'vue': ['vuejs', 'vue.js'],
  'next.js': ['nextjs', 'next'],
  'express': ['expressjs', 'express.js'],
  'django': ['django rest framework'],
  'spring boot': ['springboot', 'spring-boot'],
  'aws': ['amazon web services', 'ec2', 's3', 'lambda'],
  'azure': ['microsoft azure'],
  'google cloud': ['gcp', 'google cloud platform'],
  'docker': ['containerization', 'docker compose'],
  'kubernetes': ['k8s', 'k8', 'kube'],
  'terraform': ['infrastructure as code'],
  'git': ['version control', 'github', 'gitlab'],
  'linux': ['ubuntu', 'centos', 'redhat', 'debian'],
  'machine learning': ['ml', 'ai', 'artificial intelligence'],
  'data science': ['data analysis', 'data engineering'],
  'postgresql': ['postgres', 'psql'],
  'mongodb': ['mongo'],
  'ci/cd': ['continuous integration', 'continuous deployment']
};

export class SkillNormalizationService {
  private skillCache: Map<string, { name: string; category: string }> = new Map();

  async initialize(): Promise<void> {
    const prisma = await getPrisma();
    if (!prisma) return;

    // Load existing skills into cache
    const skills = await prisma.skill.findMany();
    skills.forEach((skill: any) => {
      this.skillCache.set(skill.name.toLowerCase(), {
        name: skill.name,
        category: skill.category
      });

      // Also cache synonyms
      skill.synonyms.forEach((synonym: any) => {
        this.skillCache.set(synonym.toLowerCase(), {
          name: skill.name,
          category: skill.category
        });
      });
    });
  }

  async seedSkills(): Promise<void> {
    const prisma = await getPrisma();
    if (!prisma) return;

    console.log('Seeding skill normalization data...');

    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
      for (const skillName of skills) {
        const synonyms = SKILL_SYNONYMS[skillName] || [];

        await prisma.skill.upsert({
          where: { name: skillName },
          update: {
            category,
            synonyms
          },
          create: {
            name: skillName,
            category,
            synonyms
          }
        });
      }
    }

    console.log('Skill normalization data seeded successfully');
  }

  normalizeSkill(skillName: string): { name: string; category: string } {
    const normalized = skillName.toLowerCase().trim();

    // Check cache first
    if (this.skillCache.has(normalized)) {
      return this.skillCache.get(normalized)!;
    }

    // Find best match
    for (const [canonicalName, synonyms] of Object.entries(SKILL_SYNONYMS)) {
      if (canonicalName === normalized || synonyms.includes(normalized)) {
        const category = this.findCategoryForSkill(canonicalName);
        const result = { name: canonicalName, category };
        this.skillCache.set(normalized, result);
        return result;
      }
    }

    // Check if it's a direct match in categories
    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
      if (skills.includes(normalized)) {
        const result = { name: normalized, category };
        this.skillCache.set(normalized, result);
        return result;
      }
    }

    // Fuzzy matching for partial matches
    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
      for (const skill of skills) {
        if (normalized.includes(skill) || skill.includes(normalized)) {
          const result = { name: skill, category };
          this.skillCache.set(normalized, result);
          return result;
        }
      }
    }

    // Default to Other category
    return { name: skillName, category: 'Other' };
  }

  private findCategoryForSkill(skillName: string): string {
    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
      if (skills.includes(skillName)) {
        return category;
      }
    }
    return 'Other';
  }

  getAllCategories(): string[] {
    return Object.keys(SKILL_CATEGORIES);
  }

  getSkillsInCategory(category: string): string[] {
    return SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES] || [];
  }

  async getSkillStats(): Promise<{ total: number; byCategory: Record<string, number> }> {
    const prisma = await getPrisma();
    if (!prisma) return { total: 0, byCategory: {} };

    const skills = await prisma.skill.findMany({
      select: { category: true }
    });

    const byCategory: Record<string, number> = {};
    skills.forEach((skill: any) => {
      byCategory[skill.category] = (byCategory[skill.category] || 0) + 1;
    });

    return {
      total: skills.length,
      byCategory
    };
  }
}

// Singleton instance
let skillServiceInstance: SkillNormalizationService | null = null;

export function getSkillService(): SkillNormalizationService {
  if (!skillServiceInstance) {
    skillServiceInstance = new SkillNormalizationService();
  }
  return skillServiceInstance;
}
