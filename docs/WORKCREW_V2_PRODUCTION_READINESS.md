# WorkCrew.ai V2 — Production Readiness

**Audit date:** 2026-08-12
**Verdict:** 🟡 **NOT YET PRODUCTION READY — FIX REQUIRED** (close; blockers are configuration + a few verification gaps, not missing architecture).

The application is architecturally substantial (86 API routes, 61 pages, Prisma/Postgres, NextAuth JWT, Sentry, Typesense, Stripe, Resend, background scripts). During this audit it did **not** boot until three P0 defects were fixed. With those fixed, the core loops work. Remaining risk is concentrated in **configuration, migration history hygiene, and untested payment/AI/assessment paths**.

---

## Infrastructure

| Area | Status | Notes |
|---|---|---|
| Production env vars | ⚠️ | `.env.example` documents them (AUTH_SECRET, DATABASE_URL, Stripe, Resend, Sentry, Typesense, OpenAI). Local `.env` was **missing AUTH_SECRET** and had a **wrong DATABASE_URL scheme** — both fixed. Verify all are set in prod. |
| Database | ✅ (local) | Migrated SQLite→Postgres this session; runtime on `@prisma/adapter-pg`. Needs a stable Postgres in prod (local uses ephemeral `prisma dev` port). |
| Migrations | ⚠️ | History was **straddled SQLite/Postgres and unrunnable**; squashed to a single Postgres baseline this audit. **Other environments that ran the old migrations must be baselined** (`migrate resolve --applied 20260812150000_init`). |
| Docker | 🔵 | `Dockerfile` + `Dockerfile.sandbox` present; not built/tested this audit. |
| Typesense | 🔵 | `docker-compose.typesense.yml` + sync script; not running in test. |
| Storage (blob) | 🔵 | Resume upload references blob storage; token not set locally. |
| Email | 🔵 | Resend (`EMAIL_API_KEY`); no-ops with a log when unset (graceful). |
| Background workers | 🟡 | Websocket server (`scripts/start-websocket-server.ts`), rank/alert/feedback scripts, cron in `vercel.json`. Run separately; not orchestrated in one deploy artifact. |
| Cron jobs | 🔵 | `vercel.json` crons (job alerts) — Vercel-specific; won't run under Docker/self-host without a scheduler. |

## Reliability

| Area | Status | Notes |
|---|---|---|
| Error handling | 🟡 | API routes generally return typed errors; fire-and-forget `.catch(()=>null)` used for notifications/email (good). Some routes assume happy path. |
| Graceful degradation | ✅ | Email and OpenAI paths have no-op/regex/template fallbacks when keys are absent. |
| Health check | ✅ | `/api/health` returns `{status:ok, uptime}` — verified 200. |
| Monitoring / error tracking | ✅ | Sentry wired (`sentry.server.config.ts`, `@sentry/nextjs`). Needs DSN in prod. |
| Logging | 🟡 | `console.*` throughout; no structured logging. |
| Retry / timeouts | 🟡 | Not systematically implemented for external calls (OpenAI, email). |
| Backups / DR | ⚪ | Not addressed in-repo (infra concern). |

## Security

| Area | Status | Notes |
|---|---|---|
| Authentication | ✅ | NextAuth JWT + scrypt; timing-safe compare + dummy-hash anti-enumeration. Verified login both roles. |
| Authorization / RBAC | ✅ | `lib/capabilities.ts` capability gates on mutating employer routes; candidate→employer = 401, candidate→admin = 403 (verified). |
| Tenant isolation | ✅ PROVEN | Two-org live probe (rival@ vs test-org, 2026-08-13): Org B → Org A pipeline/job-edit/assign-assessment/candidate all 404, application PATCH & messages 403, analytics scoped to own org; own-org control 200. Codified in `__tests__/tenant-isolation.test.ts` (CI-guarded). |
| Middleware gating | ⚠️ | Auth-only, not role-aware; `/employer` and `/admin` not in protected prefixes (rely on API/page checks — which do reject). |
| Secrets | ⚠️ | No secrets committed; `.env` gitignored. Ensure prod secrets set. |
| Rate limiting | 🟡 | `lib/rateLimiter` used on signup/forgot-password; in-memory (won't span instances). |
| Password handling | ✅ | scrypt with per-user salt; never logged. |
| Security headers / CSP | ✅ | Added in `next.config.mjs` `headers()`: CSP, HSTS, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, DNS-prefetch. CSP verified against landing / find-jobs / realtime-interviewer (jsdelivr MediaPipe allowed) — no violations. `connect-src` includes `wss:` for the interview socket. Weak spot: `'unsafe-inline'` script-src (nonce upgrade path noted in config). |

## Deployment

| Area | Status | Notes |
|---|---|---|
| CI/CD | ⚪ | **No `.github/workflows`** — no CI, no automated test/build gate. |
| Build process | 🔵 | `next build` not run to completion this audit (dev server verified). **Run a full prod build before launch.** |
| Tests in pipeline | 🔴 | `npm test` **exits non-zero** — two `assert`-style files (`seats.test.ts`, `capabilities.test.ts`) aren't vitest suites. Would fail CI. |
| Migration process | ⚠️ | `migrate deploy` now works (post-fix); baseline other envs first. |
| Rollback / zero-downtime | ⚪ | Not addressed. |

## Observability

| Area | Status | Notes |
|---|---|---|
| App logs | 🟡 | console-based. |
| Error tracking | ✅ | Sentry. |
| Perf / API / DB monitoring | ⚪ | None beyond Sentry defaults. |
| Background-job monitoring | ⚪ | None. |

---

## Go-live checklist (minimum)
1. Set all prod env vars (AUTH_SECRET, DATABASE_URL=standard `postgres://`, Stripe, Resend, Sentry DSN, OpenAI, Typesense). **[blocker]**
2. Point runtime at a **stable** Postgres (not the ephemeral `prisma dev` port). **[blocker]**
3. Baseline any pre-existing environment against the new squashed migration. **[blocker]**
4. Run a full `next build` and fix any build-time errors. **[blocker]**
5. Fix `npm test` exit code (convert or rename the two assert scripts) and add a CI workflow. **[high]**
6. ~~Add security headers / CSP.~~ ✅ DONE — `next.config.mjs` `headers()` (CSP + HSTS + 5 more), verified no violations on core flows.
7. E2E-verify: assessment take/submit, Stripe checkout, AI interview, email delivery. **[high]**
8. ~~Confirm cross-org isolation with a two-org test.~~ ✅ DONE — live two-org probe + `__tests__/tenant-isolation.test.ts` (CI-guarded).
9. Replace in-memory rate limiter with a shared store if running >1 instance. **[medium]**
