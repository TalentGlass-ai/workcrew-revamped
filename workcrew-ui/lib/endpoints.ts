// PATH: workcrew-ui/lib/endpoints.ts
import { api } from "./api";

/* ========== CANDIDATE AUTH ========== */
export const CandidateAuth = {
  login: (data: { email: string; password: string }) =>
    api.post("/candidate/login", data),

  signup: (data: {
    name: string;
    email: string;
    password: string;
    userType?: "candidate";
  }) => api.post("/candidate", data),

  logout: () => api.get("/candidate/logout"),
  me: () => api.get("/candidate"),

  googleLogin: (payload: any) => api.post("/candidateGoogleLogin", payload),
  googleAuth: (payload: any) => api.post("/google-auth", payload),
};

/* ========== RECRUITER AUTH ========== */
export const RecruiterAuth = {
  login: (data: { email: string; password: string }) =>
    api.post("/recruiter/login", data),

  signup: (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    companyName: string;
    userType?: "recruiter";
  }) => api.post("/recruiter", data),

  me: () => api.get("/recruiter"),

  logout: (recruiterId: string) =>
    api.get(`/recuiterLogout/${recruiterId}`).catch(() => ({ data: {} })),

  googleLogin: (payload: any) => api.post("/recruiterGoogleLogin", payload),
  update: (recruiterId: string, data: any) =>
    api.patch(`/recruiter/${recruiterId}`, data),
  changePassword: (recruiterId: string, data: { password: string }) =>
    api.put(`/recruiter/${recruiterId}/password`, data),
  getById: (recruiterId: string) => api.get(`/recruiter/${recruiterId}`),
};

/* ========== JOBS / APPLY ========== */
export const JobsAPI = {
  list: (params?: { q?: string; page?: number; [k: string]: any }) =>
    api.get("/v2/jobs", { params }),

  detail: (id: string) => api.get(`/jobpost/${id}`),

  apply: (data: { jobId: string | number }) =>
    api.post("/candidate/jobapply", { jobId: String(data.jobId) }),
};

/* ========== CANDIDATE PROFILE / RESUME ========== */
export const CandidateAPI = {
  profile: () => api.get("/candidate"),
  update: (id: string, data: any) => api.patch(`/candidate/${id}`, data),
  completeFromResume: (id: string, data: any) =>
    api.patch(`/candidate/complete/${id}`, data),

  // Auth-protected upload (requires logged-in candidate)
  uploadResume: (formData: FormData) =>
    api.post("/uploadResume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Public upload (no auth) – uses /internal/uploadResume backend route
  uploadResumePublic: (formData: FormData) =>
    api.post("/internal/uploadResume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  uploadAvatar: (candidateId: string, formData: FormData) =>
    api.post(`/candidate/upload/${candidateId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

/* ========== COMPANY (recruiter-protected) ========== */
export const CompanyAPI = {
  getById: (companyId: string) => api.get(`/company/${companyId}`),
  update: (companyId: string, data: any) =>
    api.patch(`/company/${companyId}`, data),
  uploadImage: (companyId: string, formData: FormData) =>
    api.patch(`/company/${companyId}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

/* ========== ADMIN / MISC / EXTERNAL ========== */
export const AdminAPI = { stats: () => api.get("/admin/stats") };

export const MiscAPI = {
  contactUs: (payload: {
    name: string;
    email: string;
    phone: string;
    company: string;
    description: string;
    linkedln?: string;
  }) => api.post("/contactUs", payload),
  notifications: () => api.get("/notification"),
};

export const ExternalAPI = {
  github: (u: string) => api.get(`/github/${u}`),
  leetcode: (h: string) => api.get(`/leetcode/${h}`),
  hackerrank: (h: string) => api.get(`/hackerrank/${h}`),
  stackoverflow: (id: string) => api.get(`/stackoverflow/${id}`),
  twitter: (h: string) => api.get(`/twitter/${h}`),
  quora: (p: string) => api.get(`/quora/${p}`),
};

export const TestAPI = { ping: () => api.get("/testRoute") };
