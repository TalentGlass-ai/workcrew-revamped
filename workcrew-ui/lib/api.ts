// PATH: workcrew-ui/lib/api.ts
import axios from "axios";

const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const baseURL = envBase.endsWith("/api") ? envBase : `${envBase}/api`;

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const cand = localStorage.getItem("wc_token");
    const rec = localStorage.getItem("wc_r_token");
    const token = cand || rec;

    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
