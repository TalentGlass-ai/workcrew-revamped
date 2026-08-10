import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'

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
      return NextResponse.json({ error: 'jobId parameter is required' }, { status: 400 })
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { organization: { select: { id: true, name: true, logo: true } } },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const requiredSkills: string[] = Array.isArray(job.requiredSkills) ? job.requiredSkills as string[] : []

    const candidates = await prisma.candidate.findMany({
      include: {
        skills: { select: { skillName: true, score: true, isValidated: true } },
        applications: { where: { jobId }, select: { id: true } },
      },
      take: limit * 3,
    })

    const scored = candidates
      .filter((c) => c.applications.length === 0)
      .map((c) => {
        const skillMap = new Map(c.skills.map((s) => [s.skillName.toLowerCase(), s.isValidated]))
        const matched = requiredSkills.filter((s) => skillMap.has(s.toLowerCase()))
        // Validated skills count 1.5×, self-reported count 1×
        const weightedMatch = matched.reduce((sum, s) => sum + (skillMap.get(s.toLowerCase()) ? 1.5 : 1), 0)
        const maxWeight = requiredSkills.length * 1.5
        return {
          ...c,
          matchScore: requiredSkills.length ? Math.round((weightedMatch / maxWeight) * 100) : 0,
          matchedSkills: matched,
          validatedSkills: matched.filter((s) => skillMap.get(s.toLowerCase())),
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)

    return NextResponse.json({
      candidates: scored,
      job: { id: job.id, title: job.title, organization: job.organization, requiredSkills },
      type: 'job-specific',
    })
  } catch (error) {
    console.error('Candidate recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
