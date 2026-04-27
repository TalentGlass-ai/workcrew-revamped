import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const { slug } = await context.params
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Extract job ID from slug (format: "job-title-12345678")
    const jobId = extractJobIdFromSlug(slug)

    if (!jobId) {
      return NextResponse.json(
        { error: 'Invalid job slug' },
        { status: 400 }
      )
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          include: {
            _count: {
              select: {
                jobs: {
                  where: { isActive: true }
                }
              }
            }
          }
        },
        category: true,
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
          },
          where: {
            candidate: {
              userId: request.headers.get('x-user-id') || undefined // For personalization
            }
          }
        },
        _count: {
          select: {
            applications: true,
            savedJobs: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Get similar jobs
    const similarJobs = await prisma.job.findMany({
      where: {
        id: { not: job.id },
        status: 'published',
        OR: [
          { categoryId: job.categoryId },
          { location: { contains: job.location?.split(',')[0] || '' } },
          { skills: { contains: job.skills?.split(',')[0] || '' } },
        ]
      },
      include: {
        company: {
          select: {
            name: true,
            logo: true,
          }
        },
        category: {
          select: { name: true }
        },
      },
      take: 4,
    })

    // Add SEO data
    const jobWithMeta = {
      ...job,
      slug,
      url: `${request.nextUrl.origin}/jobs/${slug}`,
      similarJobs: similarJobs.map((similarJob: any) => ({
        ...similarJob,
        url: `/jobs/${createJobSlug(similarJob.title, similarJob.id)}`,
      })),
      structuredData: generateJobStructuredData(job, request.nextUrl.origin),
      meta: {
        title: `${job.title} at ${job.company.name} | WorkCrew.ai`,
        description: job.description.substring(0, 160).replace(/\n/g, ' ') + '...',
        keywords: [
          job.title,
          job.company.name,
          job.category.name,
          job.location || 'Remote',
          job.type.replace('_', ' '),
          'jobs',
          'careers',
          'hiring',
          ...job.skills?.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 3) || []
        ].filter(Boolean),
        ogImage: job.company.logo || `${baseUrl}/api/og/job?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company.name)}&location=${encodeURIComponent(job.location || 'Remote')}`,
        canonicalUrl: `${baseUrl}/jobs/${slug}`,
        publishedTime: job.createdAt,
        modifiedTime: job.updatedAt,
        author: job.company.name,
        section: job.category.name,
        tags: [
          job.category.name,
          job.location || 'Remote',
          job.type.replace('_', ' '),
          ...job.skills?.split(',').map((s: string) => s.trim()).filter(Boolean) || []
        ].filter(Boolean)
      }
    }

    return NextResponse.json(jobWithMeta)
  } catch (error) {
    console.error('Job detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function extractJobIdFromSlug(slug: string): string | null {
  // Slug format: "job-title-12345678" where 12345678 is last 8 chars of ID
  const parts = slug.split('-')
  if (parts.length < 2) return null

  const idPart = parts[parts.length - 1]
  if (idPart.length !== 8) return null

  // In a real app, you'd need to query the database to find the full ID
  // For now, we'll assume the slug contains the full ID at the end
  // You might want to store slugs in the database for better performance
  return idPart.padStart(24, '0') // Pad to make it look like a full ID
}

function createJobSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `${slug}-${id.slice(-8)}`
}

function generateJobStructuredData(job: any, baseUrl: string) {
  const jobUrl = `${baseUrl}/jobs/${createJobSlug(job.title, job.id)}`

  return {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    '@id': jobUrl + '#JobPosting',
    title: job.title,
    description: job.description.substring(0, 5000), // Limit description length
    datePosted: job.createdAt,
    validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    employmentType: mapEmploymentType(job.type),
    hiringOrganization: {
      '@type': 'Organization',
      '@id': `${baseUrl}/companies/${job.company.name.toLowerCase().replace(/\s+/g, '-')}-${job.company.id.slice(-8)}#Organization`,
      name: job.company.name,
      logo: job.company.logo ? {
        '@type': 'ImageObject',
        url: job.company.logo,
        width: 200,
        height: 200
      } : undefined,
      sameAs: job.company.website,
      description: job.company.description,
      foundingDate: job.company.foundedYear,
      numberOfEmployees: job.company.size ? {
        '@type': 'QuantitativeValue',
        value: parseInt(job.company.size.split('-')[0]) || 1
      } : undefined,
      industry: job.company.industry,
      address: job.company.location ? {
        '@type': 'PostalAddress',
        addressLocality: job.company.location
      } : undefined
    },
    jobLocation: job.location ? {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'US' // You might want to make this dynamic
      }
    } : {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Remote'
      }
    },
    jobLocationType: job.isRemote ? 'TELECOMMUTE' : 'ONSITE',
    baseSalary: job.salaryMin && job.salaryMax ? {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: 'YEAR'
      }
    } : undefined,
    skills: job.skills?.split(',').map((skill: string) => skill.trim()).filter(Boolean) || [],
    occupationalCategory: job.category.name,
    experienceRequirements: job.experience ? {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: parseExperienceToMonths(job.experience)
    } : undefined,
    educationRequirements: job.educationLevel ? {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: job.educationLevel
    } : undefined,
    jobBenefits: job.benefits?.split(',').map((benefit: string) => benefit.trim()).filter(Boolean) || [],
    url: jobUrl,
    directApply: true,
    applicationContact: {
      '@type': 'ContactPoint',
      url: jobUrl,
      contactType: 'technical support'
    }
  }
}

function mapEmploymentType(type: string): string {
  const typeMap: Record<string, string> = {
    'full_time': 'FULL_TIME',
    'part_time': 'PART_TIME',
    'contract': 'CONTRACTOR',
    'temporary': 'TEMPORARY',
    'internship': 'INTERN',
    'freelance': 'FREELANCE'
  }
  return typeMap[type] || 'FULL_TIME'
}

function parseExperienceToMonths(experience: string): number {
  // Simple parser for experience strings like "2-3 years", "1 year", "6 months"
  const yearMatch = experience.match(/(\d+)(?:\s*-\s*\d+)?\s*year/)
  const monthMatch = experience.match(/(\d+)(?:\s*-\s*\d+)?\s*month/)

  if (yearMatch) {
    return parseInt(yearMatch[1]) * 12
  } else if (monthMatch) {
    return parseInt(monthMatch[1])
  }
  return 0
}