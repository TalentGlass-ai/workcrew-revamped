export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type Any = Record<string, any>;
export type Job = {
  _id?: string;
  id?: string;
  title?: string;
  company?: { companyName?: string } | string | null;
  description?: string;
  location?: string;
  type?: string;
  salaryRange?: string;
  tags?: string[];
  category?: string;
};

const qs = (params: Any = {}) => {
  const pairs = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  return pairs.length ? `?${new URLSearchParams(pairs as any).toString()}` : "";
};

export async function getJobsV2(params: Any = {}) {
  const res = await fetch(`${API_BASE}/api/v2/jobs${qs(params)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/v2/jobs ${res.status}`);
  return res.json() as Promise<{ message: string; jobposts: Job[] }>;
}

export async function getJobById(id: string) {
  const res = await fetch(`${API_BASE}/api/jobpost/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/jobpost/${id} ${res.status}`);
  return res.json() as Promise<Job>;
}

export function companyName(c: Job["company"]) {
  if (!c) return "";
  if (typeof c === "string") return c;
  return c.companyName ?? "";
}
