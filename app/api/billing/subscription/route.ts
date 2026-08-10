import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'trialing', 'past_due'] },
      },
      include: {
        usages: {
          where: {
            periodStart: { lte: now },
            periodEnd: { gte: now },
          },
          orderBy: { metric: 'asc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: session.user.id, status: 'active' },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json({ subscription, paymentMethods });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
