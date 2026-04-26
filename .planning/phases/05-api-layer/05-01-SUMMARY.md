---
phase: 05-api-layer
plan: 01
subsystem: assessment-workflow
tags: ["api", "assessment", "backend", "proctoring"]
dependency_graph:
  requires: ["assessment-engine", "proctoring-system"]
  provides: ["assessment-api"]
  affects: ["frontend-assessment"]
tech_stack: ["nextjs", "prisma", "typescript"]
key_files:
  - src/app/api/assessment/start/route.ts
  - src/app/api/assessment/submit/route.ts
  - src/app/api/assessment/results/route.ts
  - src/app/api/assessment/proctoring/route.ts
  - src/app/api/assessment/candidate/[id]/route.ts
decisions: []
metrics:
  duration: "15 minutes"
  completed_date: "2026-04-26"
---

# Phase 5 Plan 1: API Layer Summary

Complete backend APIs for assessment workflow enabling start, submit, results retrieval, proctoring logging, and candidate history access.

## Implementation

### Task 1: Start and Submit Endpoints
- **POST /api/assessment/start**: Initializes assessment session by creating AssessmentAttempt with startedAt timestamp, returns assessment data and questions
- **POST /api/assessment/submit**: Accepts code solutions, evaluates using evaluator.ts, updates Assessment score/report, marks attempt as completed

### Task 2: Results and Candidate History Endpoints  
- **GET /api/assessment/results**: Retrieves assessment results by ID including score, report, and questions with user answers
- **GET /api/assessment/candidate/[id]**: Returns paginated list of candidate's assessments with scores and completion status

### Task 3: Proctoring Endpoint
- **POST /api/assessment/proctoring**: Logs proctoring events (tab_switch, copy_attempt, etc.) by creating ProctoringEvent records with timestamp and details

## Key Features
- Authentication and authorization checks for all endpoints
- Proper error handling and validation
- Integration with existing Prisma models (Assessment, AssessmentAttempt, Answer, ProctoringEvent)
- Evaluation using existing evaluator.ts library
- Permission-based access for candidate history (owner or recruiter roles)

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
- All files created successfully
- Commits exist: 6986673, 91c3176, c028ae5