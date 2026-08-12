import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../auth";
import { getPrisma } from "../../../../lib/prisma";
import { can } from "../../../../lib/employerAuth";

async function getOrgUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const prisma = await getPrisma();
  if (!prisma) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, organizationId: true, role: true },
  });
  if (!user?.organizationId) return null;
  return { prisma, user };
}

export async function GET() {
  const ctx = await getOrgUser();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { prisma, user } = ctx;

  const jobs = await prisma.job.findMany({
    where: { organizationId: user.organizationId! },
    select: {
      id: true, title: true, location: true, jobType: true,
      status: true, createdAt: true, publishedAt: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  location: z.string().optional(),
  jobType: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  publish: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const ctx = await getOrgUser();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { prisma, user } = ctx;

  if (!can(user.role, "manageJobs")) {
    return NextResponse.json({ error: "Your role does not permit posting jobs" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { publish, ...fields } = parsed.data;
  const job = await prisma.job.create({
    data: {
      ...fields,
      organizationId: user.organizationId!,
      createdBy: user.id,
      status: publish ? "published" : "draft",
      publishedAt: publish ? new Date() : null,
      requiredSkills: [] as unknown as any,
      preferredSkills: [] as unknown as any,
      skillClusters: [] as unknown as any,
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
