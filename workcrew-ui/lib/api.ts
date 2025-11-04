// workcrew-ui/lib/api.ts
import axios from "axios";

// Allow either "http://localhost:5000" or "http://localhost:5000"
const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const baseURL = envBase.endsWith("/api") ? envBase : `${envBase}/api`;

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  // If your backend uses cookie auth, enable both below AND set CORS credentials on the server.
  // withCredentials: true,
});

export default api;
