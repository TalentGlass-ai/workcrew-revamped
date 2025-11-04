
import { api } from "./api";

/* ---------- AUTH ---------- */
export const AuthAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  signup: (data: any) => api.post("/auth/signup", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

/* ---------- JOBS / APPLY ---------- */
export const JobsAPI = {
  list: (params?: { q?: string; page?: number }) =>
    api.get("/jobpost", { params }),                   // adjust if route differs
  detail: (id: string) => api.get(`/jobpost/${id}`),
  apply: (data: any) => api.post("/jobapply", data),
};

/* ---------- CANDIDATE ---------- */
export const CandidateAPI = {
  profile: () => api.get("/candidate/profile"),
  update: (data: any) => api.patch("/candidate/profile", data),
};

/* ---------- RECRUITER / COMPANY ---------- */
export const RecruiterAPI = {
  dashboard: () => api.get("/recruiter/dashboard"),
};
export const CompanyAPI = {
  mine: () => api.get("/company"),
  update: (data: any) => api.patch("/company", data),
};

/* ---------- EXTERNAL INTEGRATIONS ---------- */
export const ExternalAPI = {
  github: (username: string) => api.get(`/github/${username}`),
  leetcode: (handle: string) => api.get(`/leetcode/${handle}`),
  hackerrank: (handle: string) => api.get(`/hackerrank/${handle}`),
  stackoverflow: (userId: string) => api.get(`/stackoverflow/${userId}`),
  twitter: (handle: string) => api.get(`/twitter/${handle}`),
  quora: (profile: string) => api.get(`/quora/${profile}`),
};

/* ---------- ADMIN ---------- */
export const AdminAPI = {
  stats: () => api.get("/admin/stats"),
};

/* ---------- PASSWORD / CONTACT / NOTIFY ---------- */
export const MiscAPI = {
  forgotPassword: (email: string) =>
    api.post("/password/forgot", { email }),
  resetPassword: (token: string, password: string) =>
    api.post(`/password/reset/${token}`, { password }),
  contactUs: (payload: any) => api.post("/contactus", payload),
  notifications: () => api.get("/notification"),
};

/* ---------- FLASK BRIDGE / TEST ---------- */
export const FlaskAPI = {
  post: (payload: any) => api.post("/flask", payload),
};
export const TestAPI = {
  ping: () => api.get("/testRoute"),
};
