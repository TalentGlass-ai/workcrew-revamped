/**
 * Tenant isolation: a recruiter in Org B must never reach Org A's data.
 * Calls the REAL route handlers with a mocked session, against the real DB.
 * Complements the live cross-org probe done during the V2 audit.
 */
import 'dotenv/config'; // load DATABASE_URL from .env locally (CI sets it in the job env)
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';

// auth() is mocked so we can act as an arbitrary signed-in user without NextAuth.
const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@/auth', () => ({ auth: () => mockAuth() }));

import { prisma } from '@/lib/prisma';
import { GET as pipelineGET } from '@/app/api/employer/jobs/[id]/pipeline/route';
import { PATCH as jobPATCH } from '@/app/api/employer/jobs/[id]/route';
import { POST as assignAssessment } from '@/app/api/employer/jobs/[id]/assign-assessment/route';

const SUFFIX = `iso-${Date.now()}`;
let jobA = '';   // belongs to Org A
let jobB = '';   // belongs to Org B (control)
const recruiterBEmail = `recruiterB-${SUFFIX}@test.com`;

function actAsRecruiterB() {
  mockAuth.mockResolvedValue({ user: { email: recruiterBEmail, role: 'recruiter' } });
}
const params = (id: string) => ({ params: Promise.resolve({ id }) });
const req = (method = 'GET', body?: unknown) =>
  new NextRequest('http://localhost/api/test', {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });

beforeAll(async () => {
  const orgA = await prisma.organization.create({ data: { name: `OrgA ${SUFFIX}`, slug: `orga-${SUFFIX}` } });
  const orgB = await prisma.organization.create({ data: { name: `OrgB ${SUFFIX}`, slug: `orgb-${SUFFIX}` } });
  const recA = await prisma.user.create({ data: { email: `recruiterA-${SUFFIX}@test.com`, role: 'recruiter', organizationId: orgA.id, status: 'active' } });
  await prisma.user.create({ data: { email: recruiterBEmail, role: 'recruiter', organizationId: orgB.id, status: 'active' } });
  const recB = await prisma.user.findUniqueOrThrow({ where: { email: recruiterBEmail } });
  const mk = (orgId: string, createdBy: string, title: string) => prisma.job.create({
    data: { organizationId: orgId, createdBy, title, description: 'x'.repeat(20), status: 'published',
      requiredSkills: [] as any, preferredSkills: [] as any, skillClusters: [] as any },
    select: { id: true },
  });
  jobA = (await mk(orgA.id, recA.id, 'Org A Job')).id;
  jobB = (await mk(orgB.id, recB.id, 'Org B Job')).id;
});

afterAll(async () => {
  // Cascades to jobs + users via org FK onDelete: Cascade / SetNull.
  await prisma.organization.deleteMany({ where: { slug: { in: [`orga-${SUFFIX}`, `orgb-${SUFFIX}`] } } });
  await prisma.$disconnect();
});

describe('cross-org tenant isolation', () => {
  it('Org B recruiter CANNOT read Org A pipeline (404)', async () => {
    actAsRecruiterB();
    const res = await pipelineGET(req(), params(jobA));
    expect(res.status).toBe(404);
  });

  it('Org B recruiter CANNOT edit an Org A job (404)', async () => {
    actAsRecruiterB();
    const res = await jobPATCH(req('PATCH', { title: 'HACKED' }), params(jobA));
    expect(res.status).toBe(404);
    // And the job is unchanged.
    const still = await prisma.job.findUnique({ where: { id: jobA }, select: { title: true } });
    expect(still?.title).toBe('Org A Job');
  });

  it('Org B recruiter CANNOT assign an assessment into an Org A job (404)', async () => {
    actAsRecruiterB();
    const res = await assignAssessment(req('POST', { candidateId: 'whatever', language: 'javascript', difficulty: 'medium' }), params(jobA));
    expect(res.status).toBe(404);
  });

  it('CONTROL: Org B recruiter CAN read its OWN pipeline (200)', async () => {
    actAsRecruiterB();
    const res = await pipelineGET(req(), params(jobB));
    expect(res.status).toBe(200);
  });
});
