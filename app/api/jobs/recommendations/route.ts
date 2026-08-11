import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

    // Resolve candidate
    let candidateId = searchParams.get('candidateId')
    if (!candidateId) {
      const session = await auth()
      if (session?.user?.id) {
        const c = await prisma.candidate.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        })
        candidateId = c?.id ?? null
      }
    }

    // Fetch all published jobs so scoring picks the best matches, not just the newest
    const allJobs = await prisma.job.findMany({
      where: { status: 'published' },
      select: {
        id: true, title: true, location: true, jobType: true,
        salaryMin: true, salaryMax: true, seoSlug: true, createdAt: true,
        requiredSkills: true,
        organization: { select: { id: true, name: true, logo: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500, // practical ceiling; score all, return top N
    })

    if (!candidateId) {
      return NextResponse.json({ jobs: allJobs.slice(0, limit).map(j => ({ ...j, matchScore: 50 })), type: 'general' })
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        primarySkills: true,
        skills: { select: { skillName: true, isValidated: true } },
      },
    })
    if (!candidate) {
      return NextResponse.json({ jobs: allJobs.slice(0, limit).map(j => ({ ...j, matchScore: 50 })), type: 'general' })
    }

    // Build skill map: CandidateSkill rows + primarySkills JSON as fallback
    const skillMap = new Map<string, boolean>()
    for (const s of candidate.skills) skillMap.set(s.skillName.toLowerCase(), s.isValidated)
    const primary: string[] = Array.isArray(candidate.primarySkills) ? candidate.primarySkills as string[] : []
    for (const s of primary) {
      if (!skillMap.has(s.toLowerCase())) skillMap.set(s.toLowerCase(), false)
    }

    if (skillMap.size === 0) {
      // No skills at all — return recency-ordered with neutral score
      return NextResponse.json({ jobs: allJobs.slice(0, limit).map(j => ({ ...j, matchScore: 50 })), type: 'general' })
    }

    const scored = allJobs.map((job) => {
      const required: string[] = Array.isArray(job.requiredSkills) ? job.requiredSkills as string[] : []
      if (required.length === 0) return { ...job, matchScore: 30 } // deprioritise jobs with no skill requirements

      const matched = required.filter(s => skillMap.has(s.toLowerCase()))
      // validated skills count 1.5×; self-reported 1×
      const weightedMatch = matched.reduce((sum, s) => sum + (skillMap.get(s.toLowerCase()) ? 1.5 : 1), 0)
      const maxWeight = required.length * 1.5
      return { ...job, matchScore: Math.round((weightedMatch / maxWeight) * 100) }
    }).sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({ jobs: scored.slice(0, limit), type: 'personalized' })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
