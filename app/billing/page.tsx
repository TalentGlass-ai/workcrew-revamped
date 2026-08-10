import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import { prisma } from '../../lib/prisma'
import { BillingDashboard } from '../../workcrew-ui/components/billing'

export const metadata = { title: 'Billing – WorkCrew.ai' }

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const now = new Date()

  const [subscription, paymentMethods] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'trialing', 'past_due'] },
      },
      include: {
        plan: true,
        usages: {
          where: { periodStart: { lte: now }, periodEnd: { gte: now } },
          orderBy: { metric: 'asc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    }),
    prisma.paymentMethod.findMany({
      where: { userId: session.user.id, status: 'active' },
      orderBy: { isDefault: 'desc' },
    }),
  ])

  const usages = (subscription?.usages ?? []).map(u => ({
    metric: u.metric,
    quantity: u.quantity,
    limit: (subscription?.plan?.limits as Record<string, number> | null)?.[u.metric] ?? 100,
    periodStart: u.periodStart,
    periodEnd: u.periodEnd,
  }))

  const invoices = (subscription?.invoices ?? []).map(inv => ({
    id: inv.id,
    amount: inv.amount,
    currency: inv.currency,
    status: inv.status,
    dueDate: inv.dueDate,
    paidAt: inv.paidAt,
    createdAt: inv.createdAt,
  }))

  const methods = paymentMethods.map(pm => ({
    id: pm.id,
    type: pm.type,
    last4: pm.last4,
    brand: pm.brand,
    expiryMonth: pm.expiryMonth,
    expiryYear: pm.expiryYear,
    isDefault: pm.isDefault,
    status: pm.status,
  }))

  const planForDisplay = subscription?.plan
    ? {
        id: subscription.plan.id,
        name: subscription.plan.name,
        tier: subscription.plan.tier,
        price: subscription.plan.price,
        currency: subscription.plan.currency,
        interval: subscription.plan.interval,
        features: (subscription.plan.features as string[] | null) ?? [],
        limits: (subscription.plan.limits as Record<string, number> | null) ?? {},
      }
    : null

  const subscriptionForDisplay = subscription && planForDisplay
    ? {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        plan: planForDisplay,
      }
    : null

  return (
    <BillingDashboard
      subscription={subscriptionForDisplay}
      usages={usages}
      invoices={invoices}
      paymentMethods={methods}
      recommendations={[]}
    />
  )
}
