import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '../../../../lib/prisma';
import { evaluateCandidate } from '../../../../lib/services/candidate-evaluation';

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { candidateId, jobId } = body;

    if (!candidateId || !jobId) {
      return NextResponse.json(
        { error: 'candidateId and jobId are required' },
        { status: 400 }
      );
    }

    // Get candidate with skills
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        skills: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Prepare evaluation input
    const evaluationInput = {
      candidate: {
        ...candidate,
        skills: candidate.skills,
      },
      job,
    };

    // Perform evaluation
    const result = await evaluateCandidate(evaluationInput);

    // Return only the JSON result as specified in the system prompt
    return NextResponse.json(result);

  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}