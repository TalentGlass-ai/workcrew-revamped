# WorkCrew.ai V2 — User Journeys

**Audit date:** 2026-08-12. Legend: ✅ works · 🔵 code present, not walked E2E · ⚠️ works with issues · 🔴 broken · ⚪ missing.
All ✅/🔴 marks below reflect **live testing** against a running instance with a seeded recruiter, candidate, and published job.

---

## Candidate journey

| Step | Status | Notes |
|---|---|---|
| Landing page | ✅ | `/` renders (NewNavbar, Hero, reviews, footer). A `DevBuildBadge` shows in dev only. |
| Sign up | 🔵 | `/signup` + `/api/auth/signup` (scrypt, zod). Not walked; login verified instead. |
| Login | ✅ | Credentials login works; redirects candidate → `/dashboard`. **Requires `AUTH_SECRET`** (was unset → MissingSecret). |
| Profile creation/complete | ✅ | `/api/candidates/me` GET/PATCH 200 (after `session.user.id` fix). |
| Add skills | 🔵 | `/dashboard/skills`, `/api/skills`. |
| View skill profile | 🔵 | Skill radar/intelligence present in schema + UI. |
| Discover jobs | ✅ | `/find-jobs` lists the published job, filters render, "1 of 1 jobs". |
| Search / filter | 🔵 | Filter UI present (pay/type/exp/category/size/location/skills); filtering not exercised. |
| Open job | 🔵 | `/jobs/[slug]`; new jobs have `seoSlug=null` so links fall back to id. |
| Apply | ✅ | POST `/api/applications` → 201; persists `active`; cover letter stored. |
| Assessment (if required) | 🔵 | `/assessments/[id]/take` exists; not exercised (no assessment assigned in test). |
| Complete/submit assessment | 🔵 | `/api/assessments/[id]`; timer/autosave/recovery **unverified**. |
| Track application | ✅ | `/api/applications` GET → 200, shows the application. |
| Interview (schedule) | 🔵 | `/dashboard/applications/[id]/schedule`, `.ics` download. |
| Notifications | 🔵 | Bell + `/dashboard/notifications`. |
| Profile / settings | 🔵 | `/settings`. |

**Verdict:** Core candidate loop (land → login → discover → apply → track) is **working end-to-end** after this audit's P0 fixes. Assessment and AI-dependent steps are code-complete but untested here.

---

## Recruiter journey

| Step | Status | Notes |
|---|---|---|
| Landing → login | ✅ | Recruiter login → `/employer` (Employer Dashboard). |
| Org setup | 🔵 | Created during recruiter signup transaction. |
| Dashboard | ✅ | Shows job list, stats (Total/Live/Draft/Applications), nav to Analytics/Team/Messages/Candidates/Assessments. |
| Create job → configure → publish | 🔵 | `/api/employer/jobs` POST (RBAC-gated). Seeded job **is visible to candidates** (verified in `/find-jobs`). |
| Search candidates | 🔵 | `/employer/candidate-search`. |
| AI / Typesense search | 🔵 | Needs Typesense running (docker-compose provided). |
| Open / evaluate candidate | 🔵 | `/employer/candidates/[id]`, match score, skills, resume. |
| AI match explanation | 🔵 | Ranking engine; needs rank job/OPENAI. |
| Shortlist / pipeline stages | 🔵 | `/employer/jobs/[id]` ATS board; stage advance via `/api/applications/[id]` PATCH (managePipeline-gated). |
| Assessment | 🔵 | Assign via `/api/employer/jobs/[id]/assign-assessment`. |
| Interview (propose slots) | 🔵 | `/api/employer/applications/[id]/interview`. |
| AI interview (request per-job) | 🔵 | `/api/employer/jobs/[id]/request-ai-interview` (built this session). |
| Candidate communication | 🔵 | `/employer/messages`. |
| Track pipeline | 🔵 | Pipeline board. |
| Analytics | 🔵 | `/employer/analytics` (funnel, weekly volume, avg days to hire). Correctly 401 for non-org users. |
| Team invites + seats | 🔵 | `/employer/team`; seat limits enforced per plan. |

**Verdict:** Recruiter shell and dashboard **work**; the job→candidate visibility path is **verified**. Deeper ATS actions are code-complete but not walked E2E this audit.

---

## Admin journey

| Step | Status | Notes |
|---|---|---|
| Admin dashboard | 🟡 | `/admin` + `/api/admin/stats` only. Minimal. |
| Resume uploader / create profile | 🔵 | `/admin/resume-uploader`, `/api/admin/create-profile`. |
| Org / user / recruiter management | ⚪ | **No platform-level cross-org admin UI.** |
| Moderation, feature controls, billing admin | ⚪ | Not implemented as admin surfaces. |
| Access control | ✅ | candidate → `/api/admin/stats` returns **403** (verified). |

**Verdict:** Admin is **thin** — effectively a stats page + resume tooling. No super-admin, no cross-tenant management, no moderation.

---

## Cross-cutting findings from journey testing

- **Auth boundaries hold:** candidate → employer endpoints = **401**; candidate → admin = **403** (all verified live).
- **Middleware gates by authentication only, not role**, and `/employer` + `/admin` are **not** in the protected-prefix list — server-side protection for those areas relies entirely on per-page/per-API checks (which do exist and were verified to reject).
- **Session must be re-established after auth changes** — JWTs are long-lived; the `session.user.id` fix required re-login to take effect.
- **Dead ends / rough edges:** salary currency renders inconsistently ("LPA" on `/find-jobs`, "$" on job detail); `seoSlug` is null for newly created jobs.
