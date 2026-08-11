import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}
