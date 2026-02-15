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
  salaryRange?: string;
  tags?: string[];
  category?: string;
  requirements?: string[];
  benefits?: string[];
  postedDate?: string;
  applicationDeadline?: string;
  isActive?: boolean;
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