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
  isValidated?: boolean; // true when confirmed by an assessment or AI interview
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

// Assessment and Auto-Grading Types
export interface InlineComment {
  line: number;
  severity: 'info' | 'warning' | 'critical';
  comment: string;
  suggestion?: string;
}

export interface CodeReview {
  score: number;
  issues: string[];
  strengths: string[];
  suggestions: string[];
  inlineComments: InlineComment[];
  code?: string;
  language?: string;
}

export interface SkillBreakdown {
  skill: string;
  score: number; // 0-100
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
}

export interface BehaviorSignal {
  type: 'tab_switch' | 'copy_paste' | 'typing_pattern' | 'time_spent' | 'focus_loss';
  count: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ProctoringResult {
  suspicionScore: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high';
  signals: BehaviorSignal[];
  summary: string;
}

export interface AssessmentReport {
  candidateId: string;
  candidateName: string;
  role: string;
  overallScore: number; // 0-100
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  recommendation: 'recommended' | 'conditional' | 'not_recommended';
  summary: string;
  skillBreakdown: SkillBreakdown[];
  codeReview: CodeReview;
  proctoringResult: ProctoringResult;
  confidence: 'low' | 'medium' | 'high';
  suggestedLevel: string;
  timestamp: Date;
}