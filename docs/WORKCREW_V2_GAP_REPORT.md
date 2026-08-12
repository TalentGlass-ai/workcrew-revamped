# WorkCrew.ai V2 — Gap Report

**Audit date:** 2026-08-12
**Auditor role:** product + QA + security + production engineer
**Method:** static review + **live E2E testing** on a running instance (seeded recruiter, candidate, published job).

---

## Executive Summary

WorkCrew.ai V2 is a **large, feature-rich application** (86 API routes, 61 pages) covering the full two-sided hiring lifecycle. However, **as found, the application did not run** — it returned HTTP 500 on every route, and even once booting, the **entire candidate API surface returned 401**. Both were fixed during this audit, along with a broken dev seed and a broken migration history. After the fixes, the **core candidate and recruiter loops work end-to-end**.

The gap between "code exists" and "works" is wide here: the majority of features are **code-complete but were unreachable or untested** because the app couldn't authenticate candidates. Much of the remaining risk is **configuration and unverified paid/AI/assessment paths**, not missing functionality.

| Dimension | Status | Note |
|---|---|---|
| Overall V2 completion | **~75% built, ~20% verified working** | Breadth is high; verification is low |
| Candidate experience | 🟡 Core loop ✅ (post-fix) | Was 🔴 (all APIs 401) before fix |
| Recruiter experience | 🟡 Dashboard ✅, ATS depth untested | Job→candidate visibility verified |
| Admin | 🔴 Thin | Stats + resume tooling only; no super-admin/mgmt |
| AI functionality | 🔵 Code-complete, unverified | Needs OPENAI/Typesense keys |
| Assessment | 🔵 Code-complete, unverified | Take/submit/proctoring not exercised |
| Security | 🟡 Solid primitives, gaps | RBAC ✅, isolation likely ✅, no CSP, in-mem rate limit |
| Production readiness | 🟡 Not yet | Config + build + CI + verification gaps |

---

## Feature Matrix (high-level)

| Area | Feature | Status | Severity | Evidence | Action |
|---|---|---|---|---|---|
| Platform | App boots at all | ✅ (fixed) | P0 | Was 500 everywhere (Edge/pg) | Fixed & committed |
| Auth | Candidate API access | ✅ (fixed) | P0 | `session.user.id` was unset → all 401 | Fixed & committed |
| Dev | Seed script | ✅ (fixed) | P2 | Wrong import/adapter/enums | Fixed & committed |
| DB | Migration history | ✅ (fixed) | P1 | SQLite/Postgres straddle, unrunnable | Squashed baseline |
| Auth | Login/logout/redirect | ✅ | — | Both roles verified | — |
| Candidate | Apply + track | ✅ | — | 201, persists, list 200 | — |
| Recruiter | Dashboard + job visibility | ✅ | — | Job shows in `/find-jobs` | — |
| Security | RBAC / cross-role | ✅ | — | 401/403 verified | — |
| Assessment | Take/submit/proctor | 🔵 | P1 | Code only | E2E test before launch |
| Billing | Stripe checkout | 🔵 | P1 | Code only, keys absent | E2E test before launch |
| AI | Interview/parse/match | 🔵 | P2 | Code only | Verify with keys |
| Admin | Platform management | ⚪ | P2 | Absent | Build if in V2 scope |
| Deploy | CI/CD | ⚪ | P1 | No workflows | Add pipeline |
| Deploy | `npm test` green | 🔴 | P1 | Exits non-zero | Fix test files |
| Security | CSP/headers | ⚪ | P2 | None | Add |

---

## Critical Issues (P0/P1)

### P0-1 — App returns 500 on every route (Edge runtime + pg)
```
User affected:    Everyone (all pages/APIs)
How to reproduce: Boot app, request any route → 500
Expected:         Pages render
Actual:           "The edge runtime does not support Node.js 'crypto' module" (pg via middleware)
Root cause:       middleware.ts imported auth from auth.ts → lib/prisma → @prisma/adapter-pg (pg → node:crypto) bundled into Edge runtime
Recommended fix:  Split edge-safe auth.config.ts (JWT, no DB) for middleware; keep Prisma provider in auth.ts (Node)
Status:           FIXED & committed (auth.config.ts, middleware.ts, auth.ts)
```

### P0-2 — Entire candidate experience broken (all candidate APIs 401)
```
User affected:    All candidates
How to reproduce: Log in as candidate → any data fetch (/api/candidates/me, /api/applications, apply) → 401
Expected:         200 / data
Actual:           401 Unauthorized; session.user.id === undefined (session had only name/email/role)
Root cause:       NextAuth session callback set role but never id; candidate routes authorize on session.user.id
Recommended fix:  Set token.id in jwt() and session.user.id in session()
Status:           FIXED & committed; verified /api/candidates/me, /api/applications, apply all 200/201 after re-login
```

### P1-1 — Migration history unrunnable (SQLite/Postgres straddle)
```
User affected:    Anyone provisioning the DB
How to reproduce: prisma migrate deploy → P3018 "type datetime does not exist"
Root cause:       8 of 23 migrations used SQLite syntax (DATETIME); provider lock said sqlite
Recommended fix:  Squash to a single Postgres baseline generated from schema
Status:           FIXED & committed (single 20260812150000_init); other envs must be baselined
```

### P1-2 — Runtime could not reach the database
```
Root cause:       Runtime client used the SQLite driver adapter against a Postgres DB; and DATABASE_URL used the
                  prisma+postgres:// protocol which @prisma/adapter-pg cannot consume
Recommended fix:  Switch to @prisma/adapter-pg; set DATABASE_URL to a standard postgres:// URL
Status:           Adapter FIXED & committed; DATABASE_URL fixed in local .env (prod must set a standard postgres:// URL)
```

### P1-3 — `npm test` exits non-zero (CI would fail)
```
User affected:    CI/CD, release gating
Root cause:       lib/seats.test.ts and lib/capabilities.test.ts are assert-based scripts, not vitest suites;
                  vitest reports "No test suite found" and fails the run (20 real tests do pass)
Recommended fix:  Convert to vitest it() blocks, or rename so vitest ignores them
Status:           OPEN (documented)
```

### P1-4 — No CI/CD
```
Root cause:       No .github/workflows; no automated build/test/migrate gate
Recommended fix:  Add a workflow: install → typecheck → test → build → (migrate deploy on release)
Status:           OPEN
```

### P1-5 — Assessment & Stripe billing unverified end-to-end
```
Root cause:       Not exercised (no assigned assessment in test; Stripe keys absent)
Risk:             Core monetization + a headline candidate feature are unproven
Recommended fix:  E2E test assessment take/submit/results and a full Stripe checkout before launch
Status:           OPEN
```

---

## UX Issues

**Candidate**
- ⚠️ Salary currency inconsistent: `/find-jobs` shows "1–2 LPA" (Indian lakhs) for a job stored as `$120k–$160k`; job detail shows `$`. Pick one currency/locale and apply consistently.
- ⚠️ New jobs have `seoSlug = null` → job links fall back to raw id; SEO-friendly slugs never generated on create.
- README is default create-next-app boilerplate → no real onboarding for a candidate/dev.

**Recruiter**
- Middleware doesn't role-gate `/employer`; a logged-in candidate hitting `/employer` pages is not redirected server-side (APIs still reject). Confusing rather than dangerous.

**Admin**
- Effectively absent beyond a stats page — no cross-org/user management.

**Mobile / Accessibility**
- Not audited at breakpoints this pass (time-boxed). Recommend a dedicated responsive + a11y pass (focus states, labels, contrast) before launch.

---

## Technical Issues

**Frontend** — Landing/dashboards render without console errors observed. A `DevBuildBadge` renders in dev only (fine).
**Backend** — Typed error responses; fire-and-forget notifications. In-memory rate limiter won't span instances.
**Database** — Now clean Postgres baseline; adapter correct. Confirm indexes/constraints under load.
**Infrastructure** — Docker present but unbuilt; Vercel-cron won't run under self-host; websocket + rank/alert scripts run out-of-band.
**Security** — Strong auth primitives + RBAC verified; **no CSP/security headers**; cross-org isolation not exhaustively proven (single-org test).
**Performance** — Not load-tested; watch N+1 in pipeline/analytics aggregations (currently in-JS reductions over `findMany`).
**AI/Integrations** — All gated behind keys with graceful fallbacks; none verified live.

---

## Missing / Incomplete (clearly distinguished)

**Not implemented (⚪)**
- Super-admin; platform-level org/user/recruiter management; moderation; feature-flag admin UI; CSP/security headers; CI/CD; backups/DR.

**Partially implemented (🟡)**
- Admin (stats + resume tooling only); usage metering (models exist, only seats enforced); structured logging.

**Implemented but broken (🔴 — all FIXED this audit)**
- App boot (Edge/pg); candidate APIs (`session.user.id`); dev seed; migration history; runtime DB adapter/URL.

**Implemented but not tested (🔵)**
- Assessment take/submit/proctoring; Stripe billing; AI interview/parse/match/rank; Typesense search; email delivery; realtime interview; websocket messaging; onboarding wizard; resume parse; job alerts.

---

## Final Verdict

# 🟡 NOT YET PRODUCTION READY — FIX REQUIRED

**Rationale:** The product is architecturally complete and, after this audit's fixes, its core loops work. But it shipped in a state where it **could not boot or authenticate candidates**, its **migration history was unrunnable**, it has **no CI**, `npm test` **fails**, monetization (Stripe) and a headline feature (assessments) are **unverified**, and there's **no CSP**. These are addressable without architectural change — hence "not yet," not "not ready." Do not launch until the go-live checklist in PRODUCTION_READINESS.md is cleared and cross-org isolation is proven.
