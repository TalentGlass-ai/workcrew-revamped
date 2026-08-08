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
        skills: { select: { skillName: true, score: true } },
        applications: { where: { jobId }, select: { id: true } },
      },
      take: limit * 3,
    })

    const scored = candidates
      .filter((c) => c.applications.length === 0)
      .map((c) => {
        const candidateSkills = new Set(c.skills.map((s) => s.skillName.toLowerCase()))
        const matched = requiredSkills.filter((s) => candidateSkills.has(s.toLowerCase()))
        return {
          ...c,
          matchScore: requiredSkills.length ? Math.round((matched.length / requiredSkills.length) * 100) : 0,
          matchedSkills: matched,
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
