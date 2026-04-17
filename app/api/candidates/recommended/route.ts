import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'
import { calculateDistance } from '../../../../lib/geocoding'

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ candidates: [] })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId parameter is required' },
        { status: 400 }
      )
    }

    // Get the job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
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

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Get all candidate profiles
    const allCandidates = await prisma.candidateProfile.findMany({
      include: {
        skills: {
          select: {
            skillName: true,
            proficiency: true,
          }
        },
        applications: {
          where: { jobId },
          select: { id: true, status: true }
        },
      },
    })

    // Extract job requirements
    const jobSkills = job.skills ? job.skills.split(',').map((s: string) => s.trim().toLowerCase()) : []
    const jobExperience = parseExperience(job.experience || '')
    const jobLocation = job.location || ''
    const jobLatitude = job.latitude
    const jobLongitude = job.longitude

    // Calculate match scores for candidates
    const scoredCandidates = allCandidates
      .filter((candidate: any) => candidate.applications.length === 0) // Exclude already applied candidates
      .map((candidate: any) => {
        let score = 0
        let matchedSkills: string[] = []
        let missingSkills: string[] = []

        // Skills matching (50% weight)
        const candidateSkills = candidate.skills.map((s: any) => s.skillName.toLowerCase())
        matchedSkills = jobSkills.filter((jobSkill: string) =>
          candidateSkills.some((candidateSkill: string) =>
            candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill)
          )
        )
        missingSkills = jobSkills.filter((jobSkill: string) =>
          !candidateSkills.some((candidateSkill: string) =>
            candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill)
          )
        )

        const skillMatchRatio = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0
        score += skillMatchRatio * 50

        // Experience level matching (20% weight)
        if (candidate.experience) {
          const candidateExp = parseExperience(candidate.experience)
          if (candidateExp >= jobExperience) {
            score += 20
          } else if (candidateExp >= jobExperience - 1) {
            score += 10 // Partial match
          }
        }

        // Location proximity (15% weight)
        if (candidate.latitude && candidate.longitude && jobLatitude && jobLongitude) {
          const distance = calculateDistance(
            candidate.latitude,
            candidate.longitude,
            jobLatitude,
            jobLongitude
          )
          if (distance <= 50) { // Within 50km
            score += 15
          } else if (distance <= 100) {
            score += 7.5
          }
        }

        // Salary compatibility (10% weight)
        if (candidate.preferredSalaryMax && job.salaryMax) {
          if (candidate.preferredSalaryMax >= job.salaryMax) {
            score += 10
          } else if (candidate.preferredSalaryMax >= job.salaryMax * 0.8) {
            score += 5 // Close match
          }
        }

        // Willing to relocate (5% weight)
        if (candidate.willingToRelocate) {
          score += 5
        }

        return {
          ...candidate,
          matchScore: Math.round(score),
          matchedSkills,
          missingSkills,
          skillMatchRatio: Math.round(skillMatchRatio * 100),
          topSkills: candidate.skills
            .sort((a: any, b: any) => (b.proficiency || 0) - (a.proficiency || 0))
            .slice(0, 5)
            .map((s: any) => s.skillName)
        }
      })
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, limit)

    return NextResponse.json({
      candidates: scoredCandidates,
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        requiredSkills: jobSkills,
        experience: job.experience,
        location: job.location,
      },
      type: 'job-specific'
    })
  } catch (error) {
    console.error('Candidate recommendations error:', error)
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