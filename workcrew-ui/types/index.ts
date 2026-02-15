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