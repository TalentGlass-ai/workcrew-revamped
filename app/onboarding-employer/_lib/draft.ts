export type EmpDraft = {
  // sign-up
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  agreeTos?: boolean;
  marketing?: boolean;

  // company
  companyName?: string;
  companySize?: string;
  industry?: string;
  companyLocation?: string;
  companyLinkedin?: string;
  companySocial?: string;
  companyWebsite?: string;
  startupNoSite?: boolean;
  companyDescription?: string;

  // contact
  contactFirst?: string;
  contactLast?: string;
  contactEmail?: string;
  phoneCountry?: string;
  phone?: string;
  jobTitle?: string;
  contactLocation?: string;
  contactLinkedin?: string;
};

const KEY = "wc_emp_onboard";

export function loadDraft<T = EmpDraft>(): T {
  if (typeof window === "undefined") return {} as T;
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {} as T; }
}
export function saveDraft(patch: Partial<EmpDraft>) {
  if (typeof window === "undefined") return;
  const cur = loadDraft<EmpDraft>();
  localStorage.setItem(KEY, JSON.stringify({ ...cur, ...patch }));
}
export function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
