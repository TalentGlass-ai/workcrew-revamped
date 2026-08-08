import { NextRequest, NextResponse } from "next/server";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const scryptAsync = promisify(scrypt);

const signupSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().transform((e) => e.trim().toLowerCase()),
  password: z.string().min(8).max(128),
});

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64, SCRYPT_PARAMS)) as Buffer;
  // Format: scrypt$N$r$p$salt$hash — params versioned so cost can be raised later
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${buf.toString("hex")}`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { firstName, lastName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  try {
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        passwordHash,
        role: "candidate",
      },
    });
  } catch (err: any) {
    // P2002 = unique constraint violation (race condition: concurrent signup with same email)
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
