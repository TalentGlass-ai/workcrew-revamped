#!/usr/bin/env node

import { getPrisma } from '../lib/prisma';

const SKILL_CATEGORIES: Record<string, string[]> = {
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

async function seedSkills() {
  const prisma = await getPrisma();
  if (!prisma) throw new Error('Database not available');

  console.log('Seeding skills...');
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    for (const skillName of skills) {
      await prisma.skill.upsert({
        where: { name: skillName },
        update: { category, synonyms: SKILL_SYNONYMS[skillName] || [] },
        create: { name: skillName, category, synonyms: SKILL_SYNONYMS[skillName] || [] }
      });
    }
  }

  const skills = await prisma.skill.findMany({ select: { category: true } });
  const byCategory: Record<string, number> = {};
  skills.forEach((s: any) => { byCategory[s.category] = (byCategory[s.category] || 0) + 1; });
  console.log('Skill seeding complete:', { total: skills.length, byCategory });

  process.exit(0);
}

seedSkills().catch(error => {
  console.error('Failed to seed skills:', error);
  process.exit(1);
});
