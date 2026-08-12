import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { auth } from '../../../../auth';
import { getPrisma } from '../../../../lib/prisma';
import { sendEmail, emailTemplates } from '../../../../lib/email';
import { can } from '../../../../lib/employerAuth';

const INVITABLE_ROLES = ['recruiter', 'hiring_manager', 'interviewer'] as const;

async function getActor() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const prisma = await getPrisma();
  if (!prisma) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, organizationId: true, role: true },
  });
  if (!user?.organizationId) return null;
  return { prisma, user };
}

// GET — members + pending invites for the actor's org
export async function GET() {
  const actor = await getActor();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { prisma, user } = actor;

  const [members, invites] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.orgInvite.findMany({
      where: { organizationId: user.organizationId!, acceptedAt: null },
      select: { id: true, email: true, role: true, expires: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({ members, invites, currentUserId: user.id });
}

// POST — invite a teammate { email, role }
export async function POST(req: NextRequest) {
  const actor = await getActor();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { prisma, user } = actor;

  if (!can(user.role, 'manageTeam')) {
    return NextResponse.json({ error: 'Only recruiters and admins can invite teammates' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = body.role;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }
  if (!INVITABLE_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { organizationId: true } });
  if (existingUser?.organizationId === user.organizationId) {
    return NextResponse.json({ error: 'That person is already on your team' }, { status: 409 });
  }
  if (existingUser) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 7 * 86_400_000); // 7 days

  // Re-inviting refreshes the token/role/expiry rather than erroring on the unique constraint
  await prisma.orgInvite.upsert({
    where: { organizationId_email: { organizationId: user.organizationId!, email } },
    create: { organizationId: user.organizationId!, email, role, token, invitedBy: user.id, expires },
    update: { role, token, invitedBy: user.id, expires, acceptedAt: null },
  });

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId! },
    select: { name: true },
  });
  const tpl = emailTemplates.teamInvite(org?.name ?? 'your team', user.name, role, token);
  await sendEmail(email, tpl.subject, tpl.html);

  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE — revoke a pending invite ?inviteId=
export async function DELETE(req: NextRequest) {
  const actor = await getActor();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { prisma, user } = actor;

  if (!can(user.role, 'manageTeam')) {
    return NextResponse.json({ error: 'Only recruiters and admins can manage invites' }, { status: 403 });
  }

  const inviteId = req.nextUrl.searchParams.get('inviteId');
  if (!inviteId) return NextResponse.json({ error: 'inviteId required' }, { status: 400 });

  // Scope delete to the actor's org so you can't revoke another org's invite
  await prisma.orgInvite.deleteMany({ where: { id: inviteId, organizationId: user.organizationId! } });
  return NextResponse.json({ ok: true });
}
