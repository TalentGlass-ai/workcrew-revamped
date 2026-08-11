import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

const scryptAsync = promisify(scrypt);
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await (scryptAsync as Function)(password, salt, 64, SCRYPT_PARAMS)) as Buffer;
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${buf.toString('hex')}`;
}

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    const parts = hash.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
    const [, N, r, p, salt, storedHash] = parts;
    const params = { N: parseInt(N), r: parseInt(r), p: parseInt(p) };
    const buf = (await (scryptAsync as Function)(plain, salt, 64, params)) as Buffer;
    return timingSafeEqual(buf, Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 });
  if (typeof newPassword !== 'string' || newPassword.length < 8)
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) return NextResponse.json({ error: 'Cannot change password for this account' }, { status: 400 });

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });
  return NextResponse.json({ ok: true });
}
