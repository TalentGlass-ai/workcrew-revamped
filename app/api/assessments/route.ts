import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  candidateEmail: z.string().email(),
  jobId: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  language: z.enum(["javascript", "python"]).default("javascript"),
  title: z.string().min(1).max(200),
  questions: z.array(z.object({
    type: z.enum(["coding", "text", "multiple_choice"]).default("coding"),
    text: z.string().min(1),
    expectedAnswer: z.string().optional(),
    weight: z.number().default(1),
  })).min(1).max(20),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role ?? "candidate";

  if (role === "recruiter" || role === "admin") {
    // Recruiter: list all assessments for their org
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      select: { organizationId: true },
    });
    if (!user?.organizationId) return NextResponse.json({ error: "No organization found" }, { status: 403 });

    const assessments = await prisma.assessment.findMany({
      where: { organizationId: user.organizationId },
      include: {
        candidate: { include: { user: { select: { name: true, email: true } } } },
        job: { select: { title: true } },
        _count: { select: { assessmentAttempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assessments });
  }

  // Candidate: list their pending and completed assessments
  const candidate = await prisma.candidate.findFirst({
    where: { user: { email: session.user?.email! } },
  });
  if (!candidate) return NextResponse.json({ assessments: [] });

  const { searchParams } = new URL(req.url);
  const pending = searchParams.get("pending") === "true";

  const assessments = await prisma.assessment.findMany({
    where: {
      candidateId: candidate.id,
      ...(pending ? { score: null } : {}),
    },
    include: {
      job: { select: { title: true } },
      questions: { select: { id: true, questionType: true, questionText: true, weightage: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ assessments });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role ?? "candidate";
  if (role !== "recruiter" && role !== "admin") {
    return NextResponse.json({ error: "Only recruiters can create assessments" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: "No organization found" }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { candidateEmail, jobId, difficulty, language, title, questions } = parsed.data;

  // Look up candidate by email
  const candidateUser = await prisma.user.findUnique({
    where: { email: candidateEmail },
    include: { candidate: true },
  });
  if (!candidateUser) return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  if (!candidateUser.candidate) return NextResponse.json({ error: "That user has no candidate profile yet" }, { status: 404 });

  const assessment = await prisma.assessment.create({
    data: {
      organizationId: user.organizationId,
      candidateId: candidateUser.candidate.id,
      jobId: jobId ?? null,
      difficulty,
      language,
      timeTaken: 0,
      report: { title, status: "pending", createdAt: new Date().toISOString() },
      questions: {
        create: questions.map((q) => ({
          questionType: q.type,
          questionText: q.text,
          expectedAnswer: q.expectedAnswer,
          weightage: q.weight,
        })),
      },
    },
  });

  return NextResponse.json({ assessment }, { status: 201 });
}
