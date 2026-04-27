import { NextRequest, NextResponse } from 'next/server';
import { learningLoopService } from '@/lib/services/learning-loop';

export async function POST(
  request: NextRequest
) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const jobId = segments[3]; // /api/jobs/[jobId]/candidates/[candidateId]/feedback
    const candidateId = segments[5]; // /api/jobs/[jobId]/candidates/[candidateId]/feedback
    const body = await request.json();

    const feedback = {
      candidateId,
      jobId,
      action: body.action, // 'accepted' | 'rejected' | 'shortlisted' | 'interviewed'
      confidence: body.confidence || 'medium', // 'high' | 'medium' | 'low'
      notes: body.notes,
      signalAdjustments: body.signalAdjustments, // Optional weight adjustments
      timestamp: new Date()
    };

    // Validate required fields
    if (!feedback.action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Validate action values
    const validActions = ['accepted', 'rejected', 'shortlisted', 'interviewed'];
    if (!validActions.includes(feedback.action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action value' },
        { status: 400 }
      );
    }

    // Record the feedback
    await learningLoopService.recordFeedback(feedback);

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      feedback: {
        candidateId,
        jobId,
        action: feedback.action,
        recordedAt: feedback.timestamp
      }
    });

  } catch (error) {
    console.error('Error recording feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve learning metrics for a job
export async function GET(
  request: NextRequest
) {
  try {
    const url = new URL(request.url);
    const jobId = url.pathname.split('/')[3]; // Extract jobId from path /api/jobs/[jobId]/...
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'job'; // 'job' or 'organization'

    if (type === 'job') {
      const summary = await learningLoopService.getJobFeedbackSummary(jobId);
      return NextResponse.json({
        success: true,
        type: 'job',
        jobId,
        data: summary
      });
    } else {
      // Get organization from job
      const { getPrisma } = await import('../../../../../../../lib/prisma');
      const prisma = await getPrisma();
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { organizationId: true }
      });

      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }

      const metrics = await learningLoopService.getLearningMetrics(job.organizationId);
      return NextResponse.json({
        success: true,
        type: 'organization',
        organizationId: job.organizationId,
        data: metrics
      });
    }

  } catch (error) {
    console.error('Error fetching learning metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch learning metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}