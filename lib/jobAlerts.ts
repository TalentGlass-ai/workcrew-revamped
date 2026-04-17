import { prisma } from './prisma'
import { subDays, subHours } from 'date-fns'

export async function processJobAlerts() {
  try {
    console.log('Processing job alerts...')

    // Get active job alerts
    const activeAlerts = await prisma.jobAlert.findMany({
      where: { isActive: true },
      include: {
        candidate: {
          select: {
            id: true,
            userId: true,
            email: true,
            name: true,
          }
        }
      }
    })

    for (const alert of activeAlerts) {
      try {
        // Determine time window based on frequency
        let since: Date
        switch (alert.frequency) {
          case 'INSTANT':
            since = subHours(new Date(), 1) // Last hour
            break
          case 'DAILY':
            since = subDays(new Date(), 1)
            break
          case 'WEEKLY':
            since = subDays(new Date(), 7)
            break
          default:
            since = subDays(new Date(), 1)
        }

        // Skip if already sent recently
        if (alert.lastSentAt && alert.lastSentAt > since) {
          continue
        }

        // Build search criteria from alert
        const criteria = alert.criteria as any
        const where: any = {
          isActive: true,
          createdAt: { gte: since },
        }

        if (criteria.query) {
          where.OR = [
            { title: { contains: criteria.query, mode: 'insensitive' } },
            { description: { contains: criteria.query, mode: 'insensitive' } },
            { skills: { hasSome: [criteria.query] } },
          ]
        }

        if (criteria.location) {
          where.location = { contains: criteria.location, mode: 'insensitive' }
        }

        if (criteria.categoryId) {
          where.categoryId = criteria.categoryId
        }

        if (criteria.jobType) {
          where.type = criteria.jobType
        }

        if (criteria.salaryMin) {
          where.salaryMin = { gte: criteria.salaryMin }
        }

        if (criteria.salaryMax) {
          where.salaryMax = { lte: criteria.salaryMax }
        }

        if (criteria.companySize) {
          where.company = { size: criteria.companySize }
        }

        if (criteria.benefits?.length > 0) {
          where.OR = where.OR || []
          criteria.benefits.forEach((benefit: string) => {
            where.OR.push({
              benefits: { contains: benefit, mode: 'insensitive' }
            })
          })
        }

        if (criteria.isRemote !== undefined) {
          where.isRemote = criteria.isRemote
        }

        // Find matching jobs
        const newJobs = await prisma.job.findMany({
          where,
          include: {
            company: {
              select: {
                name: true,
                location: true,
              }
            },
            category: {
              select: { name: true }
            }
          },
          take: 10, // Limit to prevent spam
        })

        if (newJobs.length > 0) {
          // Send notification (in a real app, you'd use email service)
          console.log(`Sending job alert to ${alert.candidate.email}: ${newJobs.length} new jobs for "${alert.name}"`)

          // Here you would integrate with an email service like SendGrid, Mailgun, etc.
          // For now, we'll just log and update the lastSentAt
          await sendJobAlertEmail(alert.candidate, alert, newJobs)

          // Update last sent time
          await prisma.jobAlert.update({
            where: { id: alert.id },
            data: { lastSentAt: new Date() }
          })
        }
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error)
      }
    }

    console.log('Job alerts processing completed')
  } catch (error) {
    console.error('Job alerts processing failed:', error)
  }
}

async function sendJobAlertEmail(candidate: any, alert: any, jobs: any[]) {
  // Placeholder for email sending logic
  // In production, integrate with email service
  const emailContent = {
    to: candidate.email,
    subject: `New Jobs Matching "${alert.name}" - WorkCrew.ai`,
    html: `
      <h2>Hello ${candidate.name}!</h2>
      <p>We found ${jobs.length} new job${jobs.length > 1 ? 's' : ''} matching your alert "${alert.name}":</p>
      <ul>
        ${jobs.map(job => `
          <li>
            <strong>${job.title}</strong> at ${job.company.name}
            <br>Location: ${job.location || 'Remote'}
            <br>Category: ${job.category.name}
          </li>
        `).join('')}
      </ul>
      <p><a href="${process.env.NEXTAUTH_URL}/jobs">View all matching jobs</a></p>
      <p>Best regards,<br>WorkCrew.ai Team</p>
    `
  }

  console.log('Email would be sent:', emailContent)
  // TODO: Integrate with actual email service
}