# WorkCrew.ai Backend Architecture Plan

This document outlines the proposed production-grade backend architecture based on the provided technical blueprint. We will create the foundational files for DB schema, multi-tenant services, message queues, and AI microservices logic.

## User Review Required

> [!IMPORTANT]  
> The "Startup CTO recommendation" suggested using **NestJS** for the backend microservices, while also isolating the AI inference in a Python FastAPI backend.
> This would mean transitioning from the monolithic Next.js API routes approach (if one exists beyond next-auth) to a distributed microservices framework.
> Before we write code, please confirm:
> 1. Should we initialize the NestJS monorepo inside a new folder (e.g. `backend/`) within this repository, or keep it strictly Next.js Server Components / API Routes?
> 2. Should we initialize the Prisma schema in the current Next.js app or the new NestJS service?

## Proposed Changes

We will set up the backend structure following Phase 1 & 2 priorities: Auth, Jobs, Candidates, ATS, Notifications, plus the infrastructure glue (Prisma, BullMQ, Kafka/Redis Streams).

### [Prisma ORM & PostgreSQL Database Schema]

Create the foundational normalized multi-tenant schema.

#### [NEW] `prisma/schema.prisma`
- Tenant / Organization tables (`Organization`, `OrganizationSettings`)
- Users + Auth tables (`User` mapped to Clerk/Auth.js role setup)
- Jobs/ATS tables (`Job`, `JobPipelineStage`, `CandidateApplication`)
- Candidate Profile Intelligence tables (`Candidate`, `CandidateSkill`, `CandidateCompetencyRadar`)
- Assessment Engine tables (`Assessment`, `AssessmentQuestion`, `AssessmentAttempt`)
- AI Interview and Fraud Signals tables (`InterviewSession`, `InterviewInsight`, `FraudSignal`)

### [Service Boundaries (NestJS / Modular Architecture)]

If proceeding with the suggested NestJS module pattern, we will create the directory boilerplate for these separated domains:

#### [NEW] `/backend/apps/auth-service/...`
- Handles SSO, RBAC, and user validation middleware.

#### [NEW] `/backend/apps/job-service/...`
- Handles job CRUD, publishing logic, and ATS pipeline changes.

#### [NEW] `/backend/apps/candidate-service/...`
- Handles candidate intelligence ingestion and enrichment triggers.

#### [NEW] `/backend/apps/notification-service/...`
- Handles dispatching notifications via email/SMS.

### [Event Contracts & Queues (Redis BullMQ + Event Bus)]

We will implement the initial events and queue processors for Phase 1.

#### [NEW] `/backend/libs/events/src/...`
Defines standard schemas for events:
- `CandidateApplied`
- `ResumeUploaded`
- `SkillProfileGenerated`

#### [NEW] `/backend/apps/resume-worker/...`
Handles the `resume-processing-queue` utilizing BullMQ.

#### [NEW] `/backend/apps/notification-worker/...`
Handles `notification-queue` for emails, WhatsApp alerts, and reminders.

## Open Questions

> [!WARNING]  
> 1. Will you be using **Auth.js (next-auth)**, **Clerk**, or another identity provider for user sessions? Since `next-auth` is already in `package.json`, we can stick to it, linking the `User` table.
> 2. Are we using a standard **Redis** instance for BullMQ caching and queues, or a hosted service like Upstash?
> 3. Does the team prefer `Kafka` or `RabbitMQ` over `Redis Streams` for the event bus given the early stage? (Redis Pub/Sub or Streams is often easier to launch with).

## Verification Plan

### Automated Tests
- Run `npx prisma generate` and `npx prisma migrate dev` to ensure schema integrity and no circular dependencies.
- Boot up testing queues using an in-memory Redis instance to verify event producing/consuming paths without failure.

### Manual Verification
- Review Prisma Client types to ensure multi-tenancy constraints are natural to query (e.g. `where: { organization_id: currentOrgId }`).
- Send dummy `CandidateApplied` events over the queue and verify worker ingestion.
