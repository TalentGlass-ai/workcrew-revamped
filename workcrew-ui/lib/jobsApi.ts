import { config } from './config';
import type { Job, JobSearchParams, JobsApiResponse } from '@/types/index';
import { getCompanyName } from './utils/jobUtils';

const API_BASE = config.api.baseUrl;

const qs = (params: JobSearchParams = {}): string => {
  const pairs: [string, string][] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // For arrays like tags, join with comma or handle as multiple entries
        value.forEach(item => pairs.push([key, String(item)]));
      } else {
        pairs.push([key, String(value)]);
      }
    }
  });
  return pairs.length ? `?${new URLSearchParams(pairs).toString()}` : '';
};

export async function getJobsV2(params: JobSearchParams = {}): Promise<JobsApiResponse> {
  const res = await fetch(`${API_BASE}/api/v2/jobs${qs(params)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET /api/v2/jobs ${res.status}`);
  return res.json() as Promise<JobsApiResponse>;
}

export async function getJobById(id: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/jobpost/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET /api/jobpost/${id} ${res.status}`);
  return res.json() as Promise<Job>;
}

// Export utility for backward compatibility
export { getCompanyName as companyName } from './utils/jobUtils';
