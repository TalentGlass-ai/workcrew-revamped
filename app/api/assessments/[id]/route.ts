import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { evaluateAssessment } from "@/lib/evaluator";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      questions: true,
      candidate: { include: { user: { select: { name: true, email: true } } } },
      job: { select: { title: true } },
    },
  });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Access check: recruiter in same org OR the candidate themselves
  const role = (session.user as any)?.role ?? "candidate";
  if (role === "recruiter" || role === "admin") {
    const user = await prisma.user.findUnique({ where: { email: session.user?.email! }, select: { organizationId: true } });
    if (user?.organizationId !== assessment.organizationId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else {
    const candidate = await prisma.candidate.findFirst({ where: { user: { email: session.user?.email! } } });
    if (!candidate || candidate.id !== assessment.candidateId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ assessment });
}

// POST /api/assessments/[id] — candidate submits answers
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const candidate = await prisma.candidate.findFirst({ where: { user: { email: session.user?.email! } } });
  if (!candidate) return NextResponse.json({ error: "No candidate profile" }, { status: 403 });

  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (assessment.candidateId !== candidate.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (assessment.score !== null) return NextResponse.json({ error: "Assessment already submitted" }, { status: 400 });

  let body: { answers: Array<{ questionId: string; answerText: string }> };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body.answers?.length) return NextResponse.json({ error: "answers is required" }, { status: 400 });

  const attempt = await prisma.assessmentAttempt.create({
    data: { candidateId: candidate.id, assessmentId: id },
  });

  const result = await evaluateAssessment(attempt.id, body.answers);
  return NextResponse.json({ result });
}
