import { prisma } from './prisma';
import { sendEmail, emailTemplates } from './email';

/**
 * Process all due job alerts and send notification emails.
 * An alert is "due" when it has never been sent, or was last sent
 * more than its frequency window ago.
 */
export async function processJobAlerts(): Promise<{ sent: number; errors: number }> {
  const now = new Date();

  const alerts = await prisma.jobAlert.findMany({
    where: {
      OR: [
        { lastSentAt: null },
        { frequency: 'daily',  lastSentAt: { lte: new Date(now.getTime() - 86_400_000) } },
        { frequency: 'weekly', lastSentAt: { lte: new Date(now.getTime() - 7 * 86_400_000) } },
      ],
    },
    include: { user: { select: { email: true } } },
  });

  let sent = 0;
  let errors = 0;

  for (const alert of alerts) {
    if (!alert.user.email) continue;

    try {
      const since = alert.lastSentAt ?? new Date(0);

      // Build job query from alert filters
      const jobs = await prisma.job.findMany({
        where: {
          status: 'published',
          publishedAt: { gte: since },
          ...(alert.location && { location: { contains: alert.location, mode: 'insensitive' } }),
          ...(alert.jobType && { jobType: alert.jobType }),
          ...(alert.query && {
            OR: [
              { title: { contains: alert.query, mode: 'insensitive' } },
              { description: { contains: alert.query, mode: 'insensitive' } },
            ],
          }),
        },
        select: {
          id: true,
          title: true,
          location: true,
          seoSlug: true,
          requiredSkills: true,
          organization: { select: { name: true } },
        },
        take: 20,
      });

      // Filter by skills if the alert specifies them
      const matched = alert.skills.length === 0 ? jobs : jobs.filter(j => {
        const jobSkills: string[] = Array.isArray(j.requiredSkills)
          ? (j.requiredSkills as string[])
          : Object.keys(j.requiredSkills as object);
        return alert.skills.some(s =>
          jobSkills.some(js => js.toLowerCase().includes(s.toLowerCase()))
        );
      });

      if (matched.length === 0) {
        // Still update lastSentAt so we don't re-check unnecessarily
        await prisma.jobAlert.update({
          where: { id: alert.id },
          data: { lastSentAt: now },
        });
        continue;
      }

      const tpl = emailTemplates.jobAlert(
        alert.id,
        matched.map(j => ({
          id: j.id,
          title: j.title,
          company: j.organization.name,
          location: j.location ?? undefined,
          slug: j.seoSlug,
        })),
      );

      await sendEmail(alert.user.email, tpl.subject, tpl.html);

      await prisma.jobAlert.update({
        where: { id: alert.id },
        data: { lastSentAt: now },
      });

      sent++;
    } catch (err) {
      console.error(`[jobAlerts] failed for alert ${alert.id}:`, err);
      errors++;
    }
  }

  console.log(`[jobAlerts] sent=${sent} errors=${errors} total=${alerts.length}`);
  return { sent, errors };
}
