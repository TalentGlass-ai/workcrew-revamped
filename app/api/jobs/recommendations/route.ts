import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'
import { calculateDistance } from '../../../../lib/geocoding'

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ recommendations: [] })
    }

    const { searchParams } = new URL(request.url)
    const candidateId = searchParams.get('candidateId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!candidateId) {
      // Return general recommendations if no candidate specified
      const jobs = await prisma.job.findMany({
        where: { isActive: true },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              size: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
            }
          },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ jobs, type: 'general' })
    }

    // Get candidate profile and skills
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        skills: true,
        savedJobs: {
          select: { jobId: true }
        },
        applications: {
          select: { jobId: true }
        }
      }
    })

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      )
    }

    // Get all active jobs
    const allJobs = await prisma.job.findMany({
      where: { isActive: true },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            size: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        },
      },
    })

    // Calculate match scores
    const candidateSkills = candidate.skills.map((s: any) => s.skillName.toLowerCase())
    const savedJobIds = new Set(candidate.savedJobs.map((s: any) => s.jobId))
    const appliedJobIds = new Set(candidate.applications.map((a: any) => a.jobId))

    const scoredJobs = allJobs
      .filter((job: any) => !savedJobIds.has(job.id) && !appliedJobIds.has(job.id)) // Exclude already interacted jobs
      .map((job: any) => {
        let score = 0
        const jobSkills = job.skills ? job.skills.split(',').map((s: string) => s.trim().toLowerCase()) : []

        // Skill matching (40% weight)
        const matchingSkills = jobSkills.filter((skill: string) =>
          candidateSkills.some((candidateSkill: string) =>
            candidateSkill.includes(skill) || skill.includes(candidateSkill)
          )
        )
        score += (matchingSkills.length / Math.max(jobSkills.length, 1)) * 40

        // Experience level matching (20% weight)
        if (candidate.experience && job.experience) {
          const candidateExp = parseExperience(candidate.experience)
          const jobExp = parseExperience(job.experience)
          if (candidateExp >= jobExp) {
            score += 20
          } else if (candidateExp >= jobExp - 1) {
            score += 10 // Partial match
          }
        }

        // Salary compatibility (20% weight)
        if (candidate.preferredSalaryMin && job.salaryMax) {
          if (candidate.preferredSalaryMin <= job.salaryMax) {
            score += 20
          } else if (candidate.preferredSalaryMin <= job.salaryMax * 1.2) {
            score += 10 // Close match
          }
        }

        // Location proximity (10% weight)
        if (candidate.latitude && candidate.longitude && job.latitude && job.longitude) {
          const distance = calculateDistance(
            candidate.latitude,
            candidate.longitude,
            job.latitude,
            job.longitude
          )
          if (distance <= 50) { // Within 50km
            score += 10
          } else if (distance <= 100) {
            score += 5
          }
        }

        // Remote work preference (10% weight)
        if (candidate.willingToRelocate || job.isRemote) {
          score += 10
        }

        return { ...job, matchScore: Math.round(score) }
      })
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, limit)

    return NextResponse.json({
      jobs: scoredJobs,
      type: 'personalized',
      candidateSkills: candidateSkills
    })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to parse experience strings
function parseExperience(exp: string): number {
  const lower = exp.toLowerCase()
  if (lower.includes('senior') || lower.includes('lead') || lower.includes('10+')) return 10
  if (lower.includes('mid') || lower.includes('intermediate') || lower.includes('5-10')) return 7
  if (lower.includes('junior') || lower.includes('entry') || lower.includes('1-3')) return 2
  if (lower.includes('3-5')) return 4

  // Extract numbers
  const match = exp.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}