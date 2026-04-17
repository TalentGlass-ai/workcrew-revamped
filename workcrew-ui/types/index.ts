// Shared TypeScript types for the WorkCrew application

export interface Company {
  _id?: string;
  companyName: string;
  description?: string;
  logo?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
}

export interface Job {
  _id?: string;
  id?: string;
  title?: string;
  company?: Company | string | null;
  description?: string;
  location?: string;
  type?: string;
  salary?: string;
  salaryRange?: string;
  skills?: string[];
  tags?: string[];
  category?: string;
  experienceLevel?: string;
  companySize?: string | number;
  requirements?: string[];
  benefits?: string[];
  postedDate?: string;
  applicationDeadline?: string;
  isActive?: boolean;
}

export type JobsEnvelope =
  | Job[]
  | {
      data?: Job[];
      jobs?: Job[];
      jobposts?: Job[];
      result?: Job[];
      total?: number;
      count?: number;
      page?: number;
      limit?: number;
    };

export interface Option {
  label: string;
  value: string;
}

export interface JobSearchParams {
  query?: string;
  location?: string;
  type?: string;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface JobsApiResponse {
  message: string;
  jobposts: Job[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
}

// AI Matching Dashboard Types
export interface CandidateRecommendation {
  id: string;
  name: string;
  email: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillMatchRatio: number;
  topSkills: string[];
  experience?: string;
  location?: string;
  resume?: string;
  bio?: string;
}

export interface JobRecommendation {
  id: string;
  title: string;
  company: Company | string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  location?: string;
  salary?: string;
  skills?: string[];
  description?: string;
}

export interface SkillMatch {
  skill: string;
  candidate: number; // 1-10 proficiency level
  job: number; // 1-10 required level
  average?: number; // Average level of top candidates
  evidence?: string[]; // Links to GitHub, tests, projects, etc.
  description?: string; // AI-generated description of proficiency
}

export interface SkillInsight {
  skill: string;
  strength: 'excellent' | 'good' | 'adequate' | 'needs_improvement' | 'gap';
  insight: string;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ComparisonData {
  candidate: SkillMatch[];
  job?: SkillMatch[];
  average?: SkillMatch[];
  topPerformer?: SkillMatch[];
}

export type ComparisonMode = 'overlay' | 'side-by-side' | 'candidate-only' | 'job-only';

export interface MatchReason {
  type: 'skill_match' | 'skill_gap' | 'experience_match' | 'location_match' | 'salary_match';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  value?: string;
}

export interface SkillSuggestion {
  skill: string;
  currentMatch: number;
  potentialMatch: number;
  improvement: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserInteraction {
  candidateId?: string;
  jobId?: string;
  action: 'view' | 'apply' | 'save' | 'unsave' | 'share' | 'contact' | 'recommend';
  metadata?: Record<string, any>;
  timestamp?: Date;
}

// AI Match Explanation Engine Types
export interface CandidateProfile {
  name: string;
  experience: string;
  topSkills: string[];
  education?: string;
  location?: string;
}

export interface JobDetails {
  title: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experience: string;
  location?: string;
}