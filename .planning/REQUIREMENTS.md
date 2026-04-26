# Requirements: Assessment System

**Defined:** 2026-04-26
**Core Value:** Build cheating-resistant assessment platform with adaptive AI questions, secure sandbox, proctoring signals, and skill intelligence integration

## v1 Requirements

Requirements for initial assessment system release.

### Assessment Engine Core

- [ ] **ASSESS-01**: Support multiple assessment types (Coding, Practical Skills, Role-Based)
- [ ] **ASSESS-02**: Implement adaptive difficulty engine (Easy → Medium → Hard based on performance)
- [ ] **ASSESS-03**: Generate dynamic coding questions using AI prompts
- [ ] **ASSESS-04**: Support multiple programming languages (Java, Python, JavaScript)
- [ ] **ASSESS-05**: Include real-world scenarios, not just LeetCode-style problems

### Code Execution Sandbox

- [ ] **SANDBOX-01**: Implement secure code execution environment (Docker-based)
- [ ] **SANDBOX-02**: Enforce time and memory limits per execution
- [ ] **SANDBOX-03**: Support multiple language runtimes safely
- [ ] **SANDBOX-04**: Prevent system access and network calls from sandbox
- [ ] **SANDBOX-05**: Handle compilation and runtime errors gracefully

### Evaluation Engine

- [ ] **EVAL-01**: Evaluate code correctness against test cases
- [ ] **EVAL-02**: Assess code efficiency (time/space complexity)
- [ ] **EVAL-03**: Check edge case handling
- [ ] **EVAL-04**: Analyze code quality (structure, naming, modularity)
- [ ] **EVAL-05**: Track behavioral signals (time taken, attempts, iterations)
- [ ] **EVAL-06**: Generate detailed assessment reports with scores and insights

### Proctoring Layer

- [x] **PROCTOR-01**: Track tab switching events
- [x] **PROCTOR-02**: Monitor window blur/focus events
- [x] **PROCTOR-03**: Detect copy-paste activity
- [x] **PROCTOR-04**: Calculate suspicion scores based on behavior patterns
- [ ] **PROCTOR-05**: Optional video monitoring with consent (face detection, multiple faces)
- [ ] **PROCTOR-06**: Optional audio monitoring for background conversation detection
- [ ] **PROCTOR-07**: Provide clear consent and disclosure for monitoring features

### Skill Intelligence Integration

- [x] **SKILL-01**: Convert assessment results to validated skills in graph database
- [x] **SKILL-02**: Update candidate skill strengths based on assessment performance
- [x] **SKILL-03**: Integrate with existing skill radar and matching algorithms
- [x] **SKILL-04**: Mark skills as "validated" vs "self-reported"
- [x] **SKILL-05**: Push assessment data to Neo4j graph for enhanced matching

### Database Schema

- [ ] **DB-01**: Create Assessment model with score, difficulty, and report fields
- [ ] **DB-02**: Create ProctoringLog model for behavior tracking
- [ ] **DB-03**: Add assessment relationships to Candidate and Job models
- [ ] **DB-04**: Store assessment metadata (language, time taken, attempts)
- [ ] **DB-05**: Implement proper indexing for assessment queries

### API Endpoints

- [x] **API-01**: POST /api/assessment/start - Initialize new assessment
- [x] **API-02**: POST /api/assessment/submit - Submit code solution
- [x] **API-03**: GET /api/assessment/results - Retrieve assessment results
- [x] **API-04**: POST /api/assessment/proctoring - Record proctoring events
- [x] **API-05**: GET /api/assessment/candidate/:id - Get candidate assessment history

### Recruiter Dashboard

- [ ] **UI-01**: Display validated skills with assessment scores
- [ ] **UI-02**: Show assessment difficulty reached and capability insights
- [ ] **UI-03**: Display proctoring risk signals (tab switching, copy-paste)
- [ ] **UI-04**: Provide assessment summary with strengths/weaknesses
- [ ] **UI-05**: Integrate assessment data into candidate profiles and matching

### Candidate Experience

- [ ] **UX-01**: Clean assessment interface without aggressive interruptions
- [ ] **UX-02**: Clear explanation of monitoring purpose and consent
- [ ] **UX-03**: Real-time feedback on code execution and test results
- [ ] **UX-04**: Progress indication through adaptive difficulty levels
- [ ] **UX-05**: Accessible assessment completion and results view

## v2 Requirements

Deferred to future releases.

### Advanced Proctoring

- **PROCTOR-08**: AI-powered anomaly detection in typing patterns
- **PROCTOR-09**: Screen capture detection and prevention
- **PROCTOR-10**: Multi-device assessment support

### Assessment Analytics

- **ANALYTICS-01**: Assessment performance trends and insights
- **ANALYTICS-02**: Skill gap analysis across candidate pools
- **ANALYTICS-03**: Assessment quality metrics and question performance

## Out of Scope

Explicitly excluded features to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Screen capture prevention | Not realistically achievable across all browsers/devices |
| Perfect cheating detection | Focus on cheating-resistant with risk signals instead |
| Live coding interviews | Out of scope for initial MVP |
| Non-coding assessments | Focus on technical skills assessment first |
| Third-party question banks | Build proprietary AI-generated questions |</content>
<parameter name="filePath">/Volumes/Macintosh HD - Data/WorkCrew - Job Portal/workcrew-revamped/.planning/REQUIREMENTS.md