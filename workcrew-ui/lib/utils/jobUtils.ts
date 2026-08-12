import type { Job } from '@/types/index';

/**
 * Extract company name from Job company field
 */
export function getCompanyName(company: Job['company']): string {
  if (!company) return '—';
  if (typeof company === 'string') return company;
  return company.companyName || '—';
}

/**
 * Format salary string by removing currency symbols
 */
export function formatSalary(salary: string | undefined): string {
  if (!salary) return '—';
  return salary.replace(/^₹\s*/i, '');
}

/**
 * Extract city from location string
 */
export function extractCity(location?: string): string {
  if (!location) return '';
  const [city] = location.split(',').map((x) => x.trim());
  return city || location || '';
}

/**
 * Normalize skills from job (prefer skills over tags)
 */
export function normalizeSkills(job: Job): string[] {
  const base = (job.skills && job.skills.length ? job.skills : job.tags) || [];
  return Array.from(new Set(base.map((s) => s.trim()).filter(Boolean)));
}

/**
 * Categorize salary into buckets
 */
// USD annual buckets (in $k). Parses "$120k–$160k" (the display format) as well
// as raw-dollar strings like "$120,000" (normalised to $k when > 1000).
export function getSalaryBucket(salary?: string): string | null {
  if (!salary) return null;
  const nums = (salary.replace(/,/g, '').match(/\d+/g) || [])
    .map(Number)
    .map((n) => (n > 1000 ? n / 1000 : n)); // raw dollars → $k
  if (nums.length === 0) return null;
  const mid = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0]; // $k
  if (mid < 50) return '0-50';
  if (mid < 100) return '50-100';
  if (mid < 150) return '100-150';
  if (mid < 200) return '150-200';
  return '200+';
}

/**
 * Infer experience level from job title and description
 */
export function inferExperience(title?: string, description?: string): string | null {
  const blob = `${title || ''} ${description || ''}`.toLowerCase();
  if (/\b(intern|internship|fresher|entry[-\s]?level|junior)\b/.test(blob)) return 'fresher';
  if (/\b(1[\s-]?3|1–3|1 to 3|1-3)\b/.test(blob)) return '1-3';
  if (/\b(3[\s-]?5|3–5|3 to 5|3-5)\b/.test(blob)) return '3-5';
  if (/\b(5[\s-]?7|5–7|5 to 7|5-7)\b/.test(blob)) return '5-7';
  if (/\b(7[\s-]?10|7–10|7 to 10|7-10)\b/.test(blob)) return '7-10';
  if (/\b(10\+|10\+ years|senior|lead|principal)\b/.test(blob)) return '10+';
  return null;
}

/**
 * Infer job category from title and skills
 */
export function inferCategory(title?: string, skills: string[] = []): string {
  const blob = `${title || ''} ${skills.join(' ')}`.toLowerCase();
  if (/\b(ui|ux|designer|figma|illustrator|photoshop|product\s*design)\b/.test(blob)) return 'design';
  if (/\b(marketing|seo|sem|content|growth)\b/.test(blob)) return 'marketing';
  if (/\b(sales|bd|business\s*development|account\s*executive)\b/.test(blob)) return 'sales';
  if (/\b(finance|accounting|analyst|fp&a|treasury)\b/.test(blob)) return 'finance';
  if (/\b(ops|operations|supply\s*chain|logistics)\b/.test(blob)) return 'operations';
  return 'tech';
}

/**
 * Normalize company size to standard categories
 */
export function normalizeCompanySize(job: Job): 'startup' | 'mid' | 'big' | null {
  const size = job.companySize ?? (typeof job.company === 'object' ? job.company?.size : undefined);

  if (typeof size === 'string') {
    const s = size.toLowerCase();
    if (/start/.test(s) || /\b(1-50|1–50|<\s*50)\b/.test(s)) return 'startup';
    if (/\b(51-500|51–500|100-1000|100–1000)\b/.test(s)) return 'mid';
    if (/big|enterprise|>\s*1000|1000\+/.test(s)) return 'big';
  } else if (typeof size === 'number') {
    if (size <= 50) return 'startup';
    if (size <= 1000) return 'mid';
    return 'big';
  }

  return null;
}