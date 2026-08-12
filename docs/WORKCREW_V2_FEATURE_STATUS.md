# WorkCrew.ai V2 — Feature & Functionality Status

**Audit date:** 2026-08-12
**Method:** Static review + live end-to-end testing against a locally running instance (Next.js dev server, fresh Prisma Postgres DB seeded with a recruiter, candidate, and published job).
**Scale:** 86 API routes, 61 pages.

## How to read this
- ✅ Complete — built and verified working end-to-end
- 🔵 Implemented but Not Tested — code exists and looks complete; not exercised E2E this audit (often blocked by a missing external key/service)
- 🟡 Partially Complete — works in part; gaps remain
- ⚠️ Needs Improvement — works but has UX/quality/consistency issues
- 🔴 Broken — code exists but does not function
- ⚪ Not Implemented

**Statuses reflect testing, not the mere existence of code.** Items marked 🔵 are explicitly *not* claimed to work.

> **Testing was only possible after fixing three P0 blockers found during this audit** (see GAP_REPORT): the app returned HTTP 500 on every route (Edge/pg), the entire candidate API surface returned 401 (`session.user.id` unset), and the dev seed crashed. All three are now fixed and committed.

---

## Candidate

| Feature | Status | Evidence | UI | Backend | E2E Tested | Issues |
|---|---|---|---|---|---|---|
| Registration / signup | 🔵 | `app/api/auth/signup`, scrypt hashing, zod validation | ✅ | ✅ | No (login tested, signup not) | — |
| Login / logout | ✅ | Logged in as seeded candidate → `/dashboard`; logout via `/api/auth/signout` | ✅ | ✅ | Yes | Required AUTH_SECRET (was unset locally) |
| Role-based redirect | ✅ | candidate→`/dashboard`, recruiter→`/employer` | ✅ | ✅ | Yes | — |
| Candidate dashboard | ✅ | Renders greeting, quick links, data fetches 200 after fix | ✅ | ✅ | Yes | — |
| Profile view/edit (CTC, notice) | ✅ | `/api/candidates/me` GET/PATCH → 200 | ✅ | ✅ | Yes (API) | — |
| Skills | 🔵 | `/api/skills`, `/dashboard/skills` | ✅ | ✅ | No | — |
| Skill radar / visualization | 🔵 | skill-intelligence fields, graph snapshot | ✅ | ✅ | No | — |
| Resume upload + AI parse | 🔵 | `lib/parseResume.ts`, `/api/candidates/parse-resume` | ✅ | ✅ | No | Needs blob storage + OPENAI key |
| Onboarding wizard | 🔵 | `/onboarding/*` multi-step, `onboarded` flag | ✅ | ✅ | No | — |
| Job discovery / search | ✅ | `/find-jobs` shows seeded job, filters render | ✅ | ✅ | Yes | Salary shows "LPA" vs "$" elsewhere (⚠️) |
| Job detail page | 🔵 | `/jobs/[slug]`, JSON-LD, OG | ✅ | ✅ | Partial (API) | seoSlug null on new jobs → falls back to id |
| Apply to job | ✅ | POST `/api/applications` → 201, persists `active` + cover letter | ✅ | ✅ | Yes | — |
| Duplicate-apply prevention | ✅ | Second apply returns 409 (code) | ✅ | ✅ | Partial | — |
| Cover letter generator | 🔵 | `/api/candidates/cover-letter` (gpt-4o-mini + template fallback) | ✅ | ✅ | No | Needs OPENAI key for AI path |
| Application tracking | ✅ | `/api/applications` GET → 200, list populated | ✅ | ✅ | Yes | — |
| Assessment: list/instructions | 🔵 | `/assessments`, login-gated (307) | ✅ | ✅ | No | — |
| Assessment: take (code editor) | 🔵 | `/assessments/[id]/take` | ✅ | ✅ | No | Not exercised; timer/autosave unverified |
| Assessment: submission/results | 🔵 | `/assessments/[id]/results`, `/api/assessments/[id]` | ✅ | ✅ | No | — |
| Proctoring / anti-cheat | 🔵 | `/dashboard/proctoring`, `FraudSignal`, mediapipe face detection dep | ✅ | ✅ | No | Camera/visibility tracking unverified |
| AI technical interview (take) | 🔵 | `/ai-interviewer`, invite flow wired this session | ✅ | ✅ | No | Needs OPENAI key |
| Interview scheduling (confirm slot) | 🔵 | `/dashboard/applications/[id]/schedule`, `.ics` download | ✅ | ✅ | No | — |
| Notifications (bell + pages) | 🔵 | `/api/notifications`, `NotificationBell`, `/dashboard/notifications` | ✅ | ✅ | No | — |
| Messaging (candidate↔recruiter) | 🔵 | `/api/applications/[id]/messages`, `/dashboard/messages`, 10s poll | ✅ | ✅ | No | Real-time = polling; websocket server separate |
| Saved jobs | 🔵 | `/api/saved-jobs`, `/dashboard/saved` | ✅ | ✅ | No | — |
| Job alerts (email digest) | 🔵 | `lib/jobAlerts.ts`, Vercel cron in `vercel.json` | ✅ | ✅ | No | Needs EMAIL_API_KEY + cron |
| Settings | 🔵 | `/settings`, `/api/settings` | ✅ | ✅ | No | — |

## Recruiter / Employer

| Feature | Status | Evidence | UI | Backend | E2E Tested | Issues |
|---|---|---|---|---|---|---|
| Login → employer dashboard | ✅ | Seeded recruiter → `/employer`, shows job + stats | ✅ | ✅ | Yes | — |
| Org creation (on signup) | 🔵 | signup transaction creates org for `recruiter` | ✅ | ✅ | No | — |
| Job create/edit/publish | 🔵 | `/api/employer/jobs` POST (managePipeline gated), pipeline edit | ✅ | ✅ | Partial (job visible to candidates ✓) | — |
| Job management (status) | 🔵 | draft/publish/close/archive controls | ✅ | ✅ | No | — |
| Candidate pipeline (ATS) | 🔵 | `/employer/jobs/[id]`, stage columns, drag-less advance | ✅ | ✅ | No | — |
| Candidate search | 🔵 | `/employer/candidate-search`, `/api/employer/candidate-search` | ✅ | ✅ | No | — |
| AI/Typesense search | 🔵 | `/api/jobs/search-typesense`, `sync:typesense` | ✅ | ✅ | No | Needs Typesense running (docker-compose provided) |
| Candidate matching + AI explanation | 🔵 | ranking engine, `lib/services`, match scores | ✅ | ✅ | No | Needs OPENAI/rank job |
| Recommended candidates per job | 🔵 | `/api/employer/jobs/[id]/recommended-candidates` | ✅ | ✅ | No | — |
| Shortlist / save candidate | 🔵 | `/api/employer/saved-candidates` | ✅ | ✅ | No | — |
| Assessment assign/manage/results | 🔵 | `/api/employer/jobs/[id]/assign-assessment` (gated) | ✅ | ✅ | No | — |
| Interview scheduling (propose) | 🔵 | `/api/employer/applications/[id]/interview` (manageInterviews) | ✅ | ✅ | No | — |
| AI interview request (per-job) | 🔵 | `/api/employer/jobs/[id]/request-ai-interview` | ✅ | ✅ | No | Built this session |
| Candidate messaging | 🔵 | `/employer/messages` | ✅ | ✅ | No | — |
| Analytics (funnel, weeks, avg-days-to-hire) | 🔵 | `/employer/analytics`, `/api/employer/analytics` | ✅ | ✅ | No | Auth-gated 401 for non-org (✓ verified) |
| Team invites + roles | 🔵 | `/employer/team`, `OrgInvite`, accept flow | ✅ | ✅ | No | Built this session |
| Seat limits per plan | 🔵 | `lib/seats.ts`, enforced on invite | ✅ | ✅ | Unit-tested | Downgrade reconciliation out of scope |
| RBAC (recruiter/hiring_manager/interviewer) | ✅ | `lib/capabilities.ts`, API gates; candidate→employer = 401 verified | ✅ | ✅ | Partial | Middleware does NOT gate `/employer` by role (relies on API) |
| Notifications | 🔵 | shared `NotificationBell`, `/employer/notifications` | ✅ | ✅ | No | — |

## Platform / Admin

| Feature | Status | Evidence | UI | Backend | E2E Tested | Issues |
|---|---|---|---|---|---|---|
| Admin dashboard | 🟡 | `/admin/page.tsx` + `/api/admin/stats` only | ✅ | ✅ | No | Minimal; candidate→admin = 403 (✓) |
| Admin: resume uploader / create-profile | 🔵 | `/admin/resume-uploader`, `/api/admin/create-profile` | ✅ | ✅ | No | — |
| Super-admin | ⚪ | No distinct super-admin surface found | ⚪ | ⚪ | — | Only `admin` role referenced |
| Org management (platform-level) | ⚪ | No cross-org admin UI | ⚪ | ⚪ | — | Missing |
| User management (platform-level) | ⚪ | None found | ⚪ | ⚪ | — | Missing |
| Moderation | ⚪ | None found | ⚪ | ⚪ | — | Missing |
| Feature flags / controls | ⚪ | `OrganizationSettings` JSON exists, no admin UI | 🟡 | 🟡 | — | Data model only |
| Billing (platform view) | 🔵 | `/billing`, Stripe routes, `Plan`/`Subscription` models | ✅ | ✅ | No | Needs Stripe keys |
| Usage metering | 🟡 | `Usage`, `UsageAlert` models; seats enforced | 🟡 | ✅ | No | Only seats actively enforced |

## AI Features

| Feature | Status | Evidence | Tested | Issues |
|---|---|---|---|---|
| Resume parsing (structured extract) | 🔵 | `parseWithAI` gpt-4o-mini + regex fallback | No | Fallback works without key |
| Cover letter generation | 🔵 | gpt-4o-mini + template fallback | No | — |
| AI technical interview (adaptive Q&A) | 🔵 | `workcrew-ui/lib/aiInterviewer`, code analysis→questions→scoring | No | Needs OPENAI key |
| Realtime interview | 🔵 | `/api/realtime-interview`, `/realtime-interviewer` | No | Unverified |
| Candidate↔job match scoring + explanation | 🔵 | ranking engine, `/api/jobs/rank`, `batch-rank-jobs` | No | — |
| Skill inference / ontology | 🔵 | `InferredSkill`, seed scripts, skill-updater service | No | — |
| Semantic/Typesense search | 🔵 | `search-typesense` | No | Needs Typesense |

---

## Summary counts
- **✅ Verified working:** 9 (auth+redirect+logout, dashboards both roles, job discovery, apply, application tracking, profile API, API authz isolation, health)
- **🔵 Implemented, not E2E-tested this audit:** ~45 (majority — many blocked only by missing external keys)
- **🟡 Partial:** admin, usage metering, feature flags
- **⚪ Not implemented:** super-admin, platform org/user management, moderation
- **🔴 Broken (now fixed):** app boot (Edge/pg), candidate APIs (`session.user.id`), dev seed — **all fixed & committed this audit**
