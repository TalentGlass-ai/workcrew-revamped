import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/geocoding'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      // Return general recommendations if no user specified
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
      where: { userId },
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
    const candidateSkills = candidate.skills.map(s => s.skillName.toLowerCase())
    const savedJobIds = new Set(candidate.savedJobs.map(s => s.jobId))
    const appliedJobIds = new Set(candidate.applications.map(a => a.jobId))

    const scoredJobs = allJobs
      .filter(job => !savedJobIds.has(job.id) && !appliedJobIds.has(job.id)) // Exclude already interacted jobs
      .map(job => {
        let score = 0
        const jobSkills = job.skills ? job.skills.split(',').map(s => s.trim().toLowerCase()) : []

        // Skill matching (40% weight)
        const matchingSkills = jobSkills.filter(skill =>
          candidateSkills.some(candidateSkill =>
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
      .sort((a, b) => b.matchScore - a.matchScore)
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