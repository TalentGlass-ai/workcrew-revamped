import { Resend } from 'resend';
import { prisma } from './prisma';

const client = process.env.EMAIL_API_KEY ? new Resend(process.env.EMAIL_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? 'WorkCrew.ai <no-reply@workcrew.ai>';
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://workcrew.ai';

/** Send a transactional email. No-ops (with a log) when EMAIL_API_KEY is not set. */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!client) {
    console.log(`[email:dev] "${subject}" → ${to}`);
    return;
  }
  try {
    await client.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error(`[email] failed to send "${subject}" to ${to}:`, err);
  }
}

/** Resolve billing contact email from a subscription row. */
export async function getBillingEmail(sub: {
  userId?: string | null;
  organizationId?: string | null;
}): Promise<string | null> {
  if (sub.userId) {
    const u = await prisma.user.findUnique({ where: { id: sub.userId }, select: { email: true } });
    return u?.email ?? null;
  }
  if (sub.organizationId) {
    const u = await prisma.user.findFirst({
      where: { organizationId: sub.organizationId, role: { in: ['admin', 'recruiter'] } },
      select: { email: true },
      orderBy: { createdAt: 'asc' },
    });
    return u?.email ?? null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Templates — plain inline-styled HTML, works in all email clients
// ---------------------------------------------------------------------------

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#5A3BFF;padding:28px 40px;">
          <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">WorkCrew<span style="opacity:0.7;">.ai</span></span>
        </td></tr>
        <tr><td style="padding:36px 40px 28px;">${body}</td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #eee;background:#fafafa;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">You received this email from WorkCrew.ai. If you have questions, reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#5A3BFF;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">${text}</a>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.3px;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">${text}</p>`;
}

// ---------------------------------------------------------------------------

export const emailTemplates = {
  passwordReset(token: string): { subject: string; html: string } {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    return {
      subject: 'Reset your WorkCrew.ai password',
      html: layout('Reset your password', `
        ${h1('Reset your password')}
        ${p('We received a request to reset the password for your WorkCrew.ai account. Click the button below to choose a new password. This link expires in 1 hour.')}
        ${btn('Reset password', resetUrl)}
        ${p('<span style="color:#6b7280;font-size:13px;">If you didn\'t request a password reset, you can safely ignore this email — your password won\'t change.</span>')}
      `),
    };
  },

  paymentSucceeded(amount: number, currency: string, date: Date): { subject: string; html: string } {
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount);
    const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return {
      subject: `Payment confirmed — ${formatted}`,
      html: layout('Payment confirmed', `
        ${h1('Payment confirmed')}
        ${p(`Your payment of <strong>${formatted}</strong> was processed successfully on ${dateStr}.`)}
        ${p('Your subscription is active. You can view your invoices and billing history in your dashboard.')}
        ${btn('View billing', `${APP_URL}/billing`)}
      `),
    };
  },

  paymentFailed(amount?: number, currency?: string): { subject: string; html: string } {
    const amountStr = amount && currency
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount)
      : 'your subscription payment';
    return {
      subject: 'Action required — payment failed',
      html: layout('Payment failed', `
        ${h1('Payment failed')}
        ${p(`We were unable to process ${amountStr}. Your subscription is now past due.`)}
        ${p('Please update your payment method to keep your account active. If you don\'t update within 7 days, your account will be downgraded to the free plan.')}
        ${btn('Update payment method', `${APP_URL}/billing`)}
      `),
    };
  },

  subscriptionUpdated(planName: string, status: string): { subject: string; html: string } {
    return {
      subject: 'Your WorkCrew.ai subscription has been updated',
      html: layout('Subscription updated', `
        ${h1('Subscription updated')}
        ${p(`Your subscription has been updated. Current plan: <strong>${planName}</strong>. Status: <strong>${status}</strong>.`)}
        ${p('If you didn\'t make this change or have questions, contact us by replying to this email.')}
        ${btn('View subscription', `${APP_URL}/billing`)}
      `),
    };
  },

  trialEnding(daysLeft: number): { subject: string; html: string } {
    return {
      subject: `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
      html: layout('Trial ending soon', `
        ${h1('Your trial is ending soon')}
        ${p(`Your WorkCrew.ai free trial ends in <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong>. Add a payment method to keep access to all features.`)}
        ${p('After your trial ends, your account will be automatically downgraded to the free plan unless you subscribe.')}
        ${btn('Upgrade now', `${APP_URL}/pricing`)}
      `),
    };
  },

  subscriptionCancelled(planName: string, periodEnd: Date): { subject: string; html: string } {
    const dateStr = periodEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return {
      subject: 'Your WorkCrew.ai subscription has been cancelled',
      html: layout('Subscription cancelled', `
        ${h1('Subscription cancelled')}
        ${p(`Your <strong>${planName}</strong> subscription has been cancelled. You'll retain access to paid features until <strong>${dateStr}</strong>.`)}
        ${p('After that date your account will revert to the free plan. You can resubscribe at any time from your billing page.')}
        ${btn('Manage billing', `${APP_URL}/billing`)}
      `),
    };
  },

  usageAlert(metric: string, current: number, limit: number, alertType: 'warning' | 'critical'): { subject: string; html: string } {
    const pct = Math.round((current / limit) * 100);
    const metricName = metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isWarning = alertType === 'warning';
    return {
      subject: `${isWarning ? 'Heads up' : 'Action required'} — ${pct}% of ${metricName} limit used`,
      html: layout(`${isWarning ? 'Usage warning' : 'Usage limit critical'}`, `
        ${h1(isWarning ? `You're at ${pct}% of your ${metricName} limit` : `You're almost out of ${metricName}`)}
        ${p(`You've used <strong>${current.toLocaleString()} of ${limit.toLocaleString()}</strong> ${metricName.toLowerCase()} this billing period (${pct}%).`)}
        ${isWarning
          ? p('You\'re approaching your plan\'s limit. Consider upgrading to avoid service interruption.')
          : p('You\'re very close to your limit. Upgrade now to keep your workflow uninterrupted.')}
        ${btn('Upgrade plan', `${APP_URL}/pricing`)}
      `),
    };
  },

  jobAlert(alertId: string, jobs: Array<{ title: string; company: string; location?: string; id: string }>): { subject: string; html: string } {
    const rows = jobs.slice(0, 10).map(j => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
          <a href="${APP_URL}/jobs/${j.id}" style="font-weight:600;color:#5A3BFF;text-decoration:none;">${j.title}</a>
          <br><span style="font-size:13px;color:#6b7280;">${j.company}${j.location ? ` · ${j.location}` : ''}</span>
        </td>
      </tr>`).join('');
    return {
      subject: `${jobs.length} new job${jobs.length === 1 ? '' : 's'} match your alert`,
      html: layout('New job matches', `
        ${h1(`${jobs.length} new job${jobs.length === 1 ? '' : 's'} for you`)}
        ${p('We found new jobs matching your saved alert:')}
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        ${btn('View all jobs', `${APP_URL}/jobs`)}
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
          <a href="${APP_URL}/settings/alerts/${alertId}" style="color:#9ca3af;">Manage this alert</a>
        </p>
      `),
    };
  },

  assessmentAssigned(jobTitle: string, company: string, assessmentId: string, language: string, difficulty: string): { subject: string; html: string } {
    const takeUrl = `${APP_URL}/assessments/${assessmentId}/take`;
    const lang = language.charAt(0).toUpperCase() + language.slice(1);
    const diff = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    return {
      subject: `You've been invited to complete a ${lang} assessment — ${jobTitle}`,
      html: layout('Assessment invitation', `
        ${h1('You have a new assessment')}
        ${p(`<strong>${company}</strong> has invited you to complete a coding assessment as part of your application for <strong>${jobTitle}</strong>.`)}
        ${p(`<strong>Language:</strong> ${lang} &nbsp;·&nbsp; <strong>Difficulty:</strong> ${diff}`)}
        ${p('Complete it at your own pace — there\'s no fixed deadline, but finishing promptly helps keep your application moving forward.')}
        ${btn('Start assessment', takeUrl)}
        ${p('<span style="color:#6b7280;font-size:13px;">If you\'re not expecting this, you can safely ignore it.</span>')}
      `),
    };
  },

  applicationStageChanged(jobTitle: string, company: string, stage: string, status: string): { subject: string; html: string } {
    const isRejected = status === 'rejected';
    const isHired = status === 'hired';
    const STAGE_LABELS: Record<string, string> = {
      screening: 'Screening', interview: 'Interview', offer: 'Offer', hired: 'Hired',
    };
    const stageLabel = STAGE_LABELS[stage] ?? stage;
    if (isRejected) {
      return {
        subject: `Update on your application — ${jobTitle} at ${company}`,
        html: layout('Application update', `
          ${h1('Application update')}
          ${p(`Thank you for your interest in <strong>${jobTitle}</strong> at <strong>${company}</strong>.`)}
          ${p('After careful consideration, the team has decided to move forward with other candidates at this time. We appreciate the time you invested and encourage you to apply for future openings.')}
          ${btn('Browse more jobs', `${APP_URL}/jobs`)}
        `),
      };
    }
    if (isHired) {
      return {
        subject: `Congratulations — offer accepted for ${jobTitle} at ${company}`,
        html: layout('Offer accepted', `
          ${h1('Congratulations!')}
          ${p(`Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been marked as hired. The recruiting team will be in touch with next steps.`)}
          ${btn('View your applications', `${APP_URL}/dashboard/applications`)}
        `),
      };
    }
    return {
      subject: `Your application has moved to ${stageLabel} — ${jobTitle}`,
      html: layout('Application update', `
        ${h1(`You've advanced to ${stageLabel}`)}
        ${p(`Great news! Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has moved to the <strong>${stageLabel}</strong> stage.`)}
        ${p('The recruiting team will reach out with more details. Keep an eye on your inbox.')}
        ${btn('Track your application', `${APP_URL}/dashboard/applications`)}
      `),
    };
  },

  contactReceived(data: {
    company: string;
    contactPerson: string;
    email: string;
    phone: string;
    companySize: string;
    role: string;
    desc?: string;
  }): { subject: string; html: string } {
    return {
      subject: `New contact form: ${data.company}`,
      html: layout('New contact form submission', `
        ${h1('New contact form submission')}
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;">
          ${[
            ['Company', data.company],
            ['Contact', data.contactPerson],
            ['Email', data.email],
            ['Phone', data.phone],
            ['Company size', data.companySize],
            ['Role', data.role],
            ['Message', data.desc ?? '—'],
          ].map(([label, value]) => `
            <tr>
              <td style="padding:8px 12px 8px 0;font-weight:600;color:#6b7280;white-space:nowrap;">${label}</td>
              <td style="padding:8px 0;">${value}</td>
            </tr>`).join('')}
        </table>
      `),
    };
  },
};
