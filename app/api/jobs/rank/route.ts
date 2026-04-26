import { NextRequest, NextResponse } from 'next/server';
import { getAIRankingEngine } from '../../../../lib/services/ai-ranking-engine';
import { getPrisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { jobId, limit = 50 } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    // Check if job exists
    const prisma = await getPrisma();
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, status: true }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'published') {
      return NextResponse.json(
        { error: 'Job is not published' },
        { status: 400 }
      );
    }

    // Run AI ranking
    const rankingEngine = getAIRankingEngine();
    const result = await rankingEngine.rankCandidatesForJob(jobId, limit);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('AI Ranking API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter is required' },
        { status: 400 }
      );
    }

    // Get cached ranking results
    const prisma = await getPrisma();
    const matches = await prisma.jobCandidateMatch.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            profileSummary: true,
            totalExperience: true,
            currentRole: true,
            location: true,
            primarySkills: true,
            skillClusters: true
          }
        }
      },
      orderBy: { score: 'desc' },
      take: limit
    });

    // Format response
    const candidates = matches.map((match: any) => ({
      candidateId: match.candidateId,
      score: match.score,
      recommendation: match.recommendation,
      scoreBreakdown: match.scoreBreakdown as any,
      analysis: match.analysis as any,
      candidate: {
        id: match.candidate.id,
        name: `${match.candidate.user.firstName} ${match.candidate.user.lastName}`,
        email: match.candidate.user.email,
        profileSummary: match.candidate.profileSummary,
        totalExperience: match.candidate.totalExperience,
        currentRole: match.candidate.currentRole,
        location: match.candidate.location,
        primarySkills: match.candidate.primarySkills,
        skillClusters: match.candidate.skillClusters
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        candidates,
        totalResults: matches.length
      }
    });

  } catch (error) {
    console.error('AI Ranking GET API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}