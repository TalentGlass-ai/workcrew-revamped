import { NextRequest, NextResponse } from 'next/server';
import { decisionEngine } from '@/lib/services/decision-engine';

export async function GET(
  request: NextRequest
) {
  try {
    const url = new URL(request.url);
    const jobId = url.pathname.split('/')[3]; // Extract jobId from path
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const startTime = Date.now();

    // Use the new sophisticated decision engine ranking
    const rankings = await decisionEngine.getJobRanking(jobId);

    // Apply limit if specified
    const limitedRankings = limit > 0 ? rankings.slice(0, limit) : rankings;

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      jobId,
      candidates: limitedRankings,
      totalCandidates: rankings.length,
      returnedCount: limitedRankings.length,
      processingTime,
      rankingMethod: 'confidence-weighted-decision-engine'
    });

  } catch (error) {
    console.error('Error fetching decision rankings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch candidate rankings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual re-evaluation of specific candidates
export async function POST(
  request: NextRequest
) {
  try {
    const url = new URL(request.url);
    const jobId = url.pathname.split('/')[3]; // Extract jobId from path
    const body = await request.json();
    const { candidateIds, forceRefresh = false } = body;

    // Import decision engine
    const { decisionEngine } = await import('@/lib/services/decision-engine');

    const results = await Promise.all(
      candidateIds.map(async (candidateId: string) => {
        try {
          return await decisionEngine.evaluateCandidate(candidateId, jobId);
        } catch (error) {
          console.warn(`Failed to evaluate candidate ${candidateId}:`, error);
          return null;
        }
      })
    );

    const validResults = results.filter(result => result !== null);

    return NextResponse.json({
      success: true,
      jobId,
      candidates: validResults,
      evaluatedCount: validResults.length,
      failedCount: results.length - validResults.length,
      forceRefresh
    });

  } catch (error) {
    console.error('Error re-evaluating candidates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to re-evaluate candidates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}