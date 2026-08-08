import { NextRequest, NextResponse } from "next/server";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString("hex")}`;
}

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, password } = await req.json();

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
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

  return NextResponse.json({ ok: true }, { status: 201 });
}
