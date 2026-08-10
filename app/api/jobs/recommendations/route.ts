import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ recommendations: [] })
    }

    const { searchParams } = new URL(request.url)
    const candidateId = searchParams.get('candidateId')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Return recent published jobs; personalisation requires candidateId
    const jobs = await prisma.job.findMany({
      where: { status: 'published' },
      include: { organization: { select: { id: true, name: true, logo: true } } },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    if (!candidateId) {
      return NextResponse.json({ jobs, type: 'general' })
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { skills: { select: { skillName: true, isValidated: true } } }
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const skillMap = new Map(candidate.skills.map((s) => [s.skillName.toLowerCase(), s.isValidated]))

    const scored = jobs.map((job) => {
      const required: string[] = Array.isArray(job.requiredSkills) ? job.requiredSkills as string[] : []
      const matched = required.filter((s) => skillMap.has(s.toLowerCase()))
      const weightedMatch = matched.reduce((sum, s) => sum + (skillMap.get(s.toLowerCase()) ? 1.5 : 1), 0)
      const maxWeight = required.length * 1.5
      return { ...job, matchScore: required.length ? Math.round((weightedMatch / maxWeight) * 100) : 0 }
    }).sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({ jobs: scored, type: 'personalized', candidateSkills: [...skillMap.keys()] })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
