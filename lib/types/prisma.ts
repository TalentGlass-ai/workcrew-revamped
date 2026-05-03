export class PrismaClient {
  [key: string]: any

  constructor() {}

  async $connect() {}

  async $disconnect() {}
}

export enum ActionType {
  VIEWED = 'VIEWED',
  IGNORED = 'IGNORED',
  REJECTED = 'REJECTED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWED = 'INTERVIEWED',
  HIRED = 'HIRED',
}

export type CandidateSkill = {
  skillName: string
  score?: number
  confidenceScore?: number
  isValidated?: boolean
  validatedAt?: Date
  validationSource?: string
  lastVerifiedAt?: Date
}

export type InferredSkill = {
  skillName: string
  confidence: number
  reason?: string
}

export type Candidate = {
  id: string
  candidateId?: string
  skills?: CandidateSkill[]
  inferredSkills?: InferredSkill[]
  [key: string]: any
}

export type Job = {
  id: string
  organizationId?: string
  requiredSkills?: string[]
  preferredSkills?: string[]
  expandedSkills?: string[]
  title: string
  experienceRequired: string
  candidateId?: string
  [key: string]: any
}

export type CandidateAction = any
export type AssessmentAttempt = any
export type InterviewInsight = any
export type Plan = any

export type SkillRelation = {
  type: string
  toSkill?: { name: string }
  fromSkill?: { name: string }
}

export type Skill = {
  name: string
  category: string
  weight: number
  fromRelations?: SkillRelation[]
  toRelations?: SkillRelation[]
  aliases?: string[]
  [key: string]: any
}

export type JobCandidateMatch = any
export type RecommendationType = 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'NOT_RECOMMENDED'
export type Prisma = any
