import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';

const scryptAsync = promisify(scrypt);
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

// Must match app/api/auth/signup/route.ts so NextAuth can verify the hash
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await (scryptAsync as Function)(password, salt, 64, SCRYPT_PARAMS)) as Buffer;
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${buf.toString('hex')}`;
}

async function validInvite(token: string) {
  const invite = await prisma.orgInvite.findUnique({
    where: { token },
    include: { organization: { select: { name: true } } },
  });
  if (!invite || invite.acceptedAt || invite.expires < new Date()) return null;
  return invite;
}

// GET — validate token, return invite details for the accept page
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await validInvite(token);
  if (!invite) return NextResponse.json({ error: 'This invite is invalid or has expired' }, { status: 404 });

  return NextResponse.json({
    invite: { email: invite.email, role: invite.role, orgName: invite.organization.name },
  });
}

const acceptSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
});

// POST — accept the invite by creating the teammate's account
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await validInvite(token);
  if (!invite) return NextResponse.json({ error: 'This invite is invalid or has expired' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const { firstName, lastName, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: invite.email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          firstName, lastName, name: `${firstName} ${lastName}`,
          email: invite.email, passwordHash,
          role: invite.role, organizationId: invite.organizationId,
        },
      });
      await tx.orgInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
    });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
