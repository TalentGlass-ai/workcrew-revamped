import { NextRequest, NextResponse } from "next/server";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimiter";

const scryptAsync = promisify(scrypt);

const signupSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().transform((e) => e.trim().toLowerCase()),
  password: z.string().min(8).max(128),
  role: z.enum(["candidate", "recruiter"]).optional().default("candidate"),
  companyName: z.string().min(1).max(200).optional(),
});

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await (scryptAsync as Function)(password, salt, 64, SCRYPT_PARAMS)) as Buffer;
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${buf.toString("hex")}`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!rateLimit(`signup:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { firstName, lastName, email, password, role, companyName } = parsed.data;

  if (role === "recruiter" && !companyName) {
    return NextResponse.json({ error: "Company name is required for employer accounts" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  try {
    if (role === "recruiter" && companyName) {
      // Create org + user in a transaction so both succeed or both roll back
      const baseSlug = slugify(companyName);
      // Make slug unique by appending a short random suffix if needed
      let slug = baseSlug;
      const conflict = await prisma.organization.findUnique({ where: { slug } });
      if (conflict) slug = `${baseSlug}-${randomBytes(3).toString("hex")}`;

      await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: { name: companyName, slug },
        });
        await tx.user.create({
          data: { firstName, lastName, name: `${firstName} ${lastName}`, email, passwordHash, role: "recruiter", organizationId: org.id },
        });
      });
    } else {
      await prisma.user.create({
        data: { firstName, lastName, name: `${firstName} ${lastName}`, email, passwordHash, role: "candidate" },
      });
    }
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
