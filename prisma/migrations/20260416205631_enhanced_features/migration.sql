-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "industry" TEXT,
    "size" TEXT,
    "benefits" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "job_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "experience" TEXT,
    "skills" TEXT,
    "benefits" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "jobs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "job_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "candidate_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "resume" TEXT,
    "bio" TEXT,
    "experience" TEXT,
    "preferredSalaryMin" INTEGER,
    "preferredSalaryMax" INTEGER,
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "proficiency" TEXT,
    CONSTRAINT "candidate_skills_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coverLetter" TEXT,
    "resume" TEXT,
    CONSTRAINT "job_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "job_applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "saved_jobs_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assessment_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "score" INTEGER,
    "results" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "assessment_sessions_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "video_screenings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "transcription" TEXT,
    "analysis" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "video_screenings_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT,
    "location" TEXT,
    "categoryId" TEXT,
    "jobType" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "isRemote" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "saved_searches_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "job_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "searchId" TEXT,
    "name" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "lastSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "job_alerts_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_name_key" ON "job_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profiles_userId_key" ON "candidate_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_skills_candidateId_skillName_key" ON "candidate_skills"("candidateId", "skillName");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_jobId_candidateId_key" ON "job_applications"("jobId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_jobId_candidateId_key" ON "saved_jobs"("jobId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "video_screenings_applicationId_key" ON "video_screenings"("applicationId");
