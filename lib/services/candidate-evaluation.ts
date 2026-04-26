import { Candidate, Job, CandidateSkill } from '@prisma/client';

export interface SkillIntelligence {
  name: string;
  strength_score: number;
  years_experience: number;
  usage_type: 'PRIMARY' | 'SECONDARY' | 'EXPOSURE';
  category: string;
}

export interface SkillMatchAnalysis {
  matched_skills: string[];
  missing_skills: string[];
  partial_match_skills: string[];
}

export interface SpiderChartData {
  dimension: string;
  score: number;
}

export interface GraphNode {
  name: string;
  strength?: number;
}

export interface GraphEdge {
  type: string;
  skill?: string;
  strength?: number;
  cluster?: string;
}

export interface GraphEnrichment {
  nodes: {
    skills: GraphNode[];
    skill_clusters: string[];
    tools: string[];
  };
  edges: GraphEdge[];
  metadata: {
    primary_domain: string;
    seniority_level: string;
    skill_depth_level: 'SHALLOW' | 'MODERATE' | 'DEEP';
  };
}

export interface EvaluationResult {
  candidate_id: string;
  fit_score: number;
  recommendation: 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'NOT_RECOMMENDED';
  skill_intelligence: {
    primary_skills: SkillIntelligence[];
    secondary_skills: SkillIntelligence[];
    emerging_skills: SkillIntelligence[];
  };
  skill_clusters: string[];
  skill_match_analysis: SkillMatchAnalysis;
  score_breakdown: {
    skill_fit: number;
    experience_fit: number;
    stability: number;
    career_growth: number;
  };
  spider_chart: SpiderChartData[];
  insights: {
    strongest_skills: string[];
    skill_gaps: string[];
    upskilling_suggestions: string[];
    risk_flags: string[];
  };
  graph_enrichment: GraphEnrichment;
}

export class SkillIntelligenceEngine {
  // Skill normalization categories
  private static readonly SKILL_CATEGORIES = {
    'Programming Languages': ['java', 'python', 'javascript', 'typescript', 'go', 'rust', 'c++', 'c#', 'php', 'ruby', 'scala', 'kotlin'],
    'Frameworks': ['react', 'angular', 'vue', 'spring boot', 'django', 'flask', 'express', 'fastapi', 'next.js', 'nuxt', 'svelte'],
    'Data & AI': ['machine learning', 'deep learning', 'nlp', 'computer vision', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'data science'],
    'Cloud & DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'github actions', 'ci/cd'],
    'Databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra'],
    'Tools': ['git', 'kafka', 'rabbitmq', 'nginx', 'apache', 'linux', 'bash', 'postman', 'swagger']
  };

  // Scoring weights
  private static readonly WEIGHTS = {
    skill_fit: 0.50,
    experience_fit: 0.25,
    stability: 0.15,
    career_growth: 0.10
  };

  evaluate(input: { candidate: Candidate & { skills: CandidateSkill[] }; job: Job }): EvaluationResult {
    const { candidate, job } = input;

    // Step 1: Extract and normalize skills
    const skillIntelligence = this.extractSkillIntelligence(candidate.skills);

    // Step 2: Identify skill clusters
    const skillClusters = this.identifySkillClusters(skillIntelligence.primary_skills);

    // Step 3: Analyze job match
    const requiredSkills = this.parseJsonArray(job.requiredSkills);
    const preferredSkills = this.parseJsonArray(job.preferredSkills);
    const skillMatchAnalysis = this.analyzeSkillMatch(skillIntelligence, requiredSkills, preferredSkills);

    // Step 4: Calculate scores
    const scoreBreakdown = this.calculateScoreBreakdown(skillIntelligence, candidate, job, skillMatchAnalysis);

    // Step 5: Calculate final fit score
    const fitScore = Math.round(
      scoreBreakdown.skill_fit * SkillIntelligenceEngine.WEIGHTS.skill_fit +
      scoreBreakdown.experience_fit * SkillIntelligenceEngine.WEIGHTS.experience_fit +
      scoreBreakdown.stability * SkillIntelligenceEngine.WEIGHTS.stability +
      scoreBreakdown.career_growth * SkillIntelligenceEngine.WEIGHTS.career_growth
    );

    // Step 6: Generate recommendation
    const recommendation = this.generateRecommendation(fitScore, skillMatchAnalysis);

    // Step 7: Generate spider chart
    const spiderChart = this.generateSpiderChart(scoreBreakdown);

    // Step 8: Generate insights
    const insights = this.generateInsights(skillIntelligence, skillMatchAnalysis, candidate);

    // Step 9: Generate graph enrichment
    const graphEnrichment = this.generateGraphEnrichment(skillIntelligence, skillClusters, skillMatchAnalysis);

    return {
      candidate_id: candidate.id,
      fit_score: fitScore,
      recommendation,
      skill_intelligence: skillIntelligence,
      skill_clusters: skillClusters,
      skill_match_analysis: skillMatchAnalysis,
      score_breakdown: scoreBreakdown,
      spider_chart: spiderChart,
      insights,
      graph_enrichment: graphEnrichment
    };
  }

  private extractSkillIntelligence(candidateSkills: CandidateSkill[]): {
    primary_skills: SkillIntelligence[];
    secondary_skills: SkillIntelligence[];
    emerging_skills: SkillIntelligence[];
  } {
    const normalizedSkills = candidateSkills.map(skill => ({
      name: this.normalizeSkillName(skill.skillName),
      category: this.categorizeSkill(skill.skillName),
      strength_score: Math.min(100, (skill.score || 0) + (skill.confidenceScore || 0)),
      years_experience: this.estimateYearsExperience(skill),
      usage_type: this.determineUsageType(skill) as 'PRIMARY' | 'SECONDARY' | 'EXPOSURE'
    }));

    // Sort by strength and categorize
    const sortedSkills = normalizedSkills.sort((a, b) => b.strength_score - a.strength_score);

    return {
      primary_skills: sortedSkills.filter(s => s.usage_type === 'PRIMARY').slice(0, 5),
      secondary_skills: sortedSkills.filter(s => s.usage_type === 'SECONDARY').slice(0, 5),
      emerging_skills: sortedSkills.filter(s => s.usage_type === 'EXPOSURE').slice(0, 3)
    };
  }

  private normalizeSkillName(skillName: string): string {
    const normalized = skillName.toLowerCase().trim();

    // Common normalizations
    const normalizations: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'ml': 'machine learning',
      'ai': 'artificial intelligence',
      'k8s': 'kubernetes',
      'ci/cd': 'ci/cd',
      'github actions': 'github actions'
    };

    return normalizations[normalized] || normalized;
  }

  private categorizeSkill(skillName: string): string {
    const normalized = this.normalizeSkillName(skillName);

    for (const [category, skills] of Object.entries(SkillIntelligenceEngine.SKILL_CATEGORIES)) {
      if (skills.some(skill => normalized.includes(skill) || skill.includes(normalized))) {
        return category;
      }
    }

    return 'Other';
  }

  private estimateYearsExperience(skill: CandidateSkill): number {
    // Estimate based on score and source
    const baseYears = skill.score ? skill.score / 20 : 1; // Rough estimation
    const recencyBonus = skill.lastVerifiedAt ? 0.5 : 0; // Recent usage bonus

    return Math.min(15, Math.max(0.5, baseYears + recencyBonus));
  }

  private determineUsageType(skill: CandidateSkill): string {
    const score = skill.score || 0;

    if (score >= 80) return 'PRIMARY';
    if (score >= 60) return 'SECONDARY';
    return 'EXPOSURE';
  }

  private identifySkillClusters(primarySkills: SkillIntelligence[]): string[] {
    const clusters: string[] = [];
    const skillNames = primarySkills.map(s => s.name.toLowerCase());

    // Backend clusters
    if (skillNames.some(s => ['java', 'python', 'go', 'scala'].includes(s))) {
      if (skillNames.includes('spring boot') || skillNames.includes('django')) {
        clusters.push('Backend Web Developer');
      } else {
        clusters.push('Backend Engineer');
      }
    }

    // Frontend clusters
    if (skillNames.some(s => ['javascript', 'typescript', 'react', 'angular', 'vue'].includes(s))) {
      clusters.push('Frontend Developer');
    }

    // Fullstack
    if (clusters.includes('Backend Web Developer') && clusters.includes('Frontend Developer')) {
      clusters.push('Fullstack Developer');
    }

    // Data Science / ML
    if (skillNames.some(s => ['machine learning', 'tensorflow', 'pytorch', 'data science'].includes(s))) {
      clusters.push('Data Scientist / ML Engineer');
    }

    // DevOps / Cloud
    if (skillNames.some(s => ['aws', 'docker', 'kubernetes', 'terraform'].includes(s))) {
      clusters.push('DevOps / Cloud Engineer');
    }

    // Default fallback
    if (clusters.length === 0) {
      clusters.push('Software Developer');
    }

    return clusters.slice(0, 3); // Limit to top 3
  }

  private analyzeSkillMatch(
    skillIntelligence: any,
    requiredSkills: string[],
    preferredSkills: string[]
  ): SkillMatchAnalysis {
    const candidateSkills = [
      ...skillIntelligence.primary_skills,
      ...skillIntelligence.secondary_skills
    ].map(s => s.name.toLowerCase());

    const matched: string[] = [];
    const missing: string[] = [];
    const partial: string[] = [];

    // Check required skills
    requiredSkills.forEach(skill => {
      const normalizedSkill = this.normalizeSkillName(skill);
      if (candidateSkills.includes(normalizedSkill)) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    // Check preferred skills
    preferredSkills.forEach(skill => {
      const normalizedSkill = this.normalizeSkillName(skill);
      if (candidateSkills.includes(normalizedSkill)) {
        matched.push(skill);
      } else {
        partial.push(skill);
      }
    });

    return {
      matched_skills: matched,
      missing_skills: missing,
      partial_match_skills: partial
    };
  }

  private calculateScoreBreakdown(
    skillIntelligence: any,
    candidate: Candidate,
    job: Job,
    skillMatch: SkillMatchAnalysis
  ): { skill_fit: number; experience_fit: number; stability: number; career_growth: number } {
    // Skill fit score
    const totalRequired = skillMatch.matched_skills.length + skillMatch.missing_skills.length;
    const skillFit = totalRequired > 0 ? (skillMatch.matched_skills.length / totalRequired) * 100 : 50;

    // Experience fit
    const candidateExp = candidate.totalExperience || 0;
    const jobExp = this.parseExperienceLevel(job.experienceRequired || '');
    const experienceFit = jobExp > 0 ? Math.min(100, (candidateExp / jobExp) * 100) : 70;

    // Stability score (based on skill depth and consistency)
    const primarySkillDepth = skillIntelligence.primary_skills.reduce((sum: number, skill: SkillIntelligence) =>
      sum + skill.strength_score, 0) / Math.max(1, skillIntelligence.primary_skills.length);
    const stability = Math.min(100, primarySkillDepth * 0.8 + experienceFit * 0.2);

    // Career growth (based on emerging skills and adaptability)
    const emergingSkillCount = skillIntelligence.emerging_skills.length;
    const careerGrowth = Math.min(100, emergingSkillCount * 20 + primarySkillDepth * 0.3);

    return {
      skill_fit: Math.round(skillFit),
      experience_fit: Math.round(experienceFit),
      stability: Math.round(stability),
      career_growth: Math.round(careerGrowth)
    };
  }

  private generateRecommendation(
    fitScore: number,
    skillMatch: SkillMatchAnalysis
  ): 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'NOT_RECOMMENDED' {
    const missingCritical = skillMatch.missing_skills.length;
    const matchRatio = skillMatch.matched_skills.length /
      Math.max(1, skillMatch.matched_skills.length + skillMatch.missing_skills.length);

    if (fitScore >= 80 && missingCritical === 0 && matchRatio >= 0.8) {
      return 'STRONGLY_RECOMMENDED';
    }
    if (fitScore >= 60 && missingCritical <= 2 && matchRatio >= 0.6) {
      return 'RECOMMENDED';
    }
    return 'NOT_RECOMMENDED';
  }

  private generateSpiderChart(scoreBreakdown: any): SpiderChartData[] {
    return [
      { dimension: 'Skill Depth', score: scoreBreakdown.skill_fit },
      { dimension: 'Skill Match', score: scoreBreakdown.skill_fit },
      { dimension: 'Experience', score: scoreBreakdown.experience_fit },
      { dimension: 'Stability', score: scoreBreakdown.stability },
      { dimension: 'Growth', score: scoreBreakdown.career_growth }
    ];
  }

  private generateInsights(
    skillIntelligence: any,
    skillMatch: SkillMatchAnalysis,
    candidate: Candidate
  ): {
    strongest_skills: string[];
    skill_gaps: string[];
    upskilling_suggestions: string[];
    risk_flags: string[];
  } {
    const strongestSkills = skillIntelligence.primary_skills
      .slice(0, 3)
      .map((s: SkillIntelligence) => s.name);

    const skillGaps = skillMatch.missing_skills.slice(0, 3);

    const upskillingSuggestions = skillMatch.partial_match_skills
      .slice(0, 2)
      .map((skill: string) => `Deepen knowledge in ${skill}`);

    const riskFlags: string[] = [];
    if (skillMatch.missing_skills.length > 2) {
      riskFlags.push('Multiple critical skill gaps');
    }
    if (skillIntelligence.primary_skills.length < 2) {
      riskFlags.push('Limited primary skill set');
    }
    if ((candidate.totalExperience || 0) < 2) {
      riskFlags.push('Limited professional experience');
    }

    return {
      strongest_skills: strongestSkills,
      skill_gaps: skillGaps,
      upskilling_suggestions: upskillingSuggestions,
      risk_flags: riskFlags
    };
  }

  private generateGraphEnrichment(
    skillIntelligence: any,
    skillClusters: string[],
    skillMatch: SkillMatchAnalysis
  ): GraphEnrichment {
    const skills: GraphNode[] = [
      ...skillIntelligence.primary_skills.map((s: SkillIntelligence) => ({
        name: s.name,
        strength: s.strength_score
      })),
      ...skillIntelligence.secondary_skills.map((s: SkillIntelligence) => ({
        name: s.name,
        strength: s.strength_score
      }))
    ];

    const edges: GraphEdge[] = [
      ...skillIntelligence.primary_skills.map((s: SkillIntelligence) => ({
        type: 'HAS_SKILL',
        skill: s.name,
        strength: s.strength_score
      })),
      ...skillMatch.missing_skills.map((skill: string) => ({
        type: 'MISSING_SKILL',
        skill: skill
      })),
      ...skillClusters.map((cluster: string) => ({
        type: 'BELONGS_TO_CLUSTER',
        cluster: cluster
      }))
    ];

    const primaryDomain = skillClusters[0] || 'Software Developer';
    const seniorityLevel = this.determineSeniorityLevel(skillIntelligence.primary_skills);
    const skillDepthLevel = this.determineSkillDepthLevel(skillIntelligence);

    return {
      nodes: {
        skills,
        skill_clusters: skillClusters,
        tools: skillIntelligence.secondary_skills.map((s: SkillIntelligence) => s.name)
      },
      edges,
      metadata: {
        primary_domain: primaryDomain,
        seniority_level: seniorityLevel,
        skill_depth_level: skillDepthLevel
      }
    };
  }

  private determineSeniorityLevel(primarySkills: SkillIntelligence[]): string {
    const avgStrength = primarySkills.reduce((sum, skill) => sum + skill.strength_score, 0) /
      Math.max(1, primarySkills.length);
    const avgExperience = primarySkills.reduce((sum, skill) => sum + skill.years_experience, 0) /
      Math.max(1, primarySkills.length);

    if (avgStrength >= 85 && avgExperience >= 5) return 'Senior';
    if (avgStrength >= 70 && avgExperience >= 3) return 'Mid-level';
    return 'Junior';
  }

  private determineSkillDepthLevel(skillIntelligence: any): 'SHALLOW' | 'MODERATE' | 'DEEP' {
    const primaryCount = skillIntelligence.primary_skills.length;
    const avgStrength = skillIntelligence.primary_skills.reduce((sum: number, skill: SkillIntelligence) =>
      sum + skill.strength_score, 0) / Math.max(1, primaryCount);

    if (primaryCount >= 4 && avgStrength >= 80) return 'DEEP';
    if (primaryCount >= 2 && avgStrength >= 60) return 'MODERATE';
    return 'SHALLOW';
  }

  private parseJsonArray(jsonValue: any): string[] {
    if (!jsonValue) return [];
    if (Array.isArray(jsonValue)) return jsonValue.map(item => String(item));
    if (typeof jsonValue === 'string') {
      try {
        const parsed = JSON.parse(jsonValue);
        return Array.isArray(parsed) ? parsed.map(item => String(item)) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private parseExperienceLevel(level: string): number {
    const levelMap: Record<string, number> = {
      'entry': 0,
      'junior': 1,
      'mid': 3,
      'senior': 5,
      'lead': 7,
      'principal': 10,
      'executive': 15,
    };

    const lowerLevel = level.toLowerCase();
    for (const [key, years] of Object.entries(levelMap)) {
      if (lowerLevel.includes(key)) return years;
    }

    // Try to extract numbers
    const match = level.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}

export function evaluateCandidate(input: { candidate: Candidate & { skills: CandidateSkill[] }; job: Job }): EvaluationResult {
  const engine = new SkillIntelligenceEngine();
  return engine.evaluate(input);
}