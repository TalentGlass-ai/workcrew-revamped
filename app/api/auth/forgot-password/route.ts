import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimiter";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!rateLimit(`forgot:${ip}`, 5, 60_000)) {
    return NextResponse.json({ ok: true }); // Silent — don't hint at rate limit
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const { email } = parsed.data;
  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ ok: true }); // degrade silently

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (user) {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3_600_000); // 1 hour

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

    // ponytail: log token — wire to email service (Resend/SendGrid) when ready
    console.log(`[forgot-password] reset link: /reset-password?token=${token}`);
  }

  // Always 200 — don't reveal whether email is registered
  return NextResponse.json({ ok: true });
}
