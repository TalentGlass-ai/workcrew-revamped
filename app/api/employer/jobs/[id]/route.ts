import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../auth";
import { getPrisma } from "../../../../../lib/prisma";

const patchSchema = z.object({
  status: z.enum(["draft", "published", "closed", "archived"]),
});

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, organizationId: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const job = await prisma.job.findFirst({ where: { id, organizationId: user.organizationId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.job.update({
    where: { id },
    data: {
      status: parsed.data.status,
      publishedAt: parsed.data.status === "published" ? (job.publishedAt ?? new Date()) : job.publishedAt,
    },
  });

  return NextResponse.json({ job: updated });
}
