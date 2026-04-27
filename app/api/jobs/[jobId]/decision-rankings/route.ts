import { NextRequest, NextResponse } from 'next/server';
import { getAIRankingEngine } from '@/lib/services/ai-ranking-engine';

export async function GET(
  request: NextRequest
) {
  try {
    const url = new URL(request.url);
    const jobId = url.pathname.split('/')[3]; // Extract jobId from path
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Use the new decision engine ranking method
    const rankingEngine = getAIRankingEngine();
    const result = await rankingEngine.rankCandidatesWithDecisionEngine(jobId, limit);

    return NextResponse.json({
      success: true,
      jobId,
      candidates: result.candidates,
      totalCandidates: result.totalCandidates,
      processingTime: result.processingTime,
      rankingMethod: 'decision-engine'
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