import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role ?? "candidate";
  if (role !== "recruiter" && role !== "hiring_manager" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const flag = await prisma.proctoringFlag.findUnique({
    where: { id },
    include: { assessment: { select: { organizationId: true } } },
  });

  if (!flag) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const orgId = (session.user as any)?.organizationId;
  if (role !== "admin" && flag.assessment.organizationId !== orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.proctoringFlag.update({
    where: { id },
    data: { reviewed: !flag.reviewed },
  });

  return NextResponse.json({ id: updated.id, reviewed: updated.reviewed });
}
