import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { prisma } from '../../../../../lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      subscription: {
        include: {
          plan: { select: { name: true, tier: true } },
          user: { select: { name: true, email: true } },
          organization: { select: { name: true } },
        },
      },
    },
  });

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Ownership check: invoice must belong to the requesting user's subscription
  const sub = invoice.subscription;
  if (sub.userId !== session.user.id && sub.organizationId !== (session.user as any).organizationId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const fmt = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount);

  const billedTo = sub.organization?.name ?? sub.user?.name ?? sub.user?.email ?? 'Customer';
  const invoiceDate = invoice.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const paidDate = invoice.paidAt?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) ?? '—';
  const amount = fmt(invoice.amount, invoice.currency);
  const plan = sub.plan?.name ?? 'Subscription';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.id.slice(-8).toUpperCase()} – WorkCrew.ai</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #f9fafb; padding: 40px 20px; color: #111827; }
    .card { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 48px; box-shadow: 0 1px 8px rgba(0,0,0,.08); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .logo { font-size: 20px; font-weight: 700; color: #4D31EC; }
    .logo span { opacity: .5; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .status.paid { background: #dcfce7; color: #166534; }
    .status.open { background: #dbeafe; color: #1e40af; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .id { color: #6b7280; font-size: 14px; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af; margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    td { padding: 14px 0; border-bottom: 1px solid #f3f4f6; font-size: 15px; }
    .total-row td { border-bottom: none; font-weight: 700; font-size: 18px; padding-top: 16px; }
    .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 0; background: #fff; } .card { box-shadow: none; border-radius: 0; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">WorkCrew<span>.ai</span></div>
      <span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span>
    </div>

    <h1>Invoice</h1>
    <p class="id">#${invoice.id.slice(-8).toUpperCase()}</p>

    <div class="grid">
      <div>
        <div class="label">Billed to</div>
        <div class="value">${billedTo}</div>
      </div>
      <div>
        <div class="label">Invoice date</div>
        <div class="value">${invoiceDate}</div>
      </div>
      <div>
        <div class="label">Payment date</div>
        <div class="value">${paidDate}</div>
      </div>
      <div>
        <div class="label">Payment method</div>
        <div class="value">${invoice.stripeInvoiceId ? 'Stripe' : invoice.razorpayInvoiceId ? 'Razorpay' : '—'}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>${plan} Plan — ${sub.plan?.tier ?? ''}</td>
          <td style="text-align:right">${amount}</td>
        </tr>
        <tr class="total-row">
          <td>Total</td>
          <td style="text-align:right">${amount}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      WorkCrew.ai · Questions? Reply to your billing confirmation email.
    </div>
  </div>
  <script>window.onload = () => window.print()</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
