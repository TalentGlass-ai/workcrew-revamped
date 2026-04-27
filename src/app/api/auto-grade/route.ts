import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { autoGradingEngine, Submission, BehaviorSignals } from '../../../../lib/autoGradingEngine';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      questionId,
      language,
      code,
      testCases,
      behaviorSignals,
      context
    } = body;

    if (!questionId || !language || !code || !testCases) {
      return NextResponse.json({
        error: 'Missing required fields: questionId, language, code, testCases'
      }, { status: 400 });
    }

    // Get candidate
    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // Get question details for context
    const question = await prisma.assessmentQuestion.findUnique({
      where: { id: questionId },
      include: { assessment: true }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Prepare submission
    const submission: Submission = {
      candidateId: candidate.id,
      questionId,
      language,
      code,
      testCases,
      context: {
        question: question.questionText,
        expectedApproach: question.expectedAnswer,
        difficulty: question.assessment?.difficulty || 'medium',
        ...context
      }
    };

    // Grade the submission
    const gradingResult = await autoGradingEngine.gradeSubmission(submission);

    // Evaluate behavior signals if provided
    let behaviorResult;
    if (behaviorSignals) {
      const signals: BehaviorSignals = {
        tabSwitches: behaviorSignals.tabSwitches || 0,
        copyPaste: behaviorSignals.copyPaste || false,
        typingPattern: behaviorSignals.typingPattern || 'normal',
        timeSpent: behaviorSignals.timeSpent || 0,
        focusTime: behaviorSignals.focusTime || 0
      };

      behaviorResult = await autoGradingEngine.evaluateBehaviorSignals(signals);
    }

    // Save grading result
    await autoGradingEngine.saveGradingResult(submission, gradingResult, behaviorResult);

    // Generate skill mapping
    const questionSkills = question.skills ? JSON.parse(question.skills) : [];
    const skillMapping = autoGradingEngine.generateSkillMapping(gradingResult, questionSkills);

    // Update skill assessments
    for (const skill of skillMapping) {
      await prisma.skillAssessment.upsert({
        where: {
          candidateId_skillName_source: {
            candidateId: candidate.id,
            skillName: skill.name,
            source: 'auto-grading'
          }
        },
        update: {
          score: skill.score,
          confidence: skill.confidence,
          context: {
            questionId,
            gradingResult: gradingResult.breakdown,
            timestamp: new Date()
          }
        },
        create: {
          candidateId: candidate.id,
          skillName: skill.name,
          score: skill.score,
          confidence: skill.confidence,
          source: 'auto-grading',
          context: {
            questionId,
            gradingResult: gradingResult.breakdown,
            timestamp: new Date()
          }
        }
      });
    }

    // Return comprehensive result
    return NextResponse.json({
      success: true,
      score: gradingResult.score,
      breakdown: gradingResult.breakdown,
      metrics: gradingResult.metrics,
      aiReview: gradingResult.aiReview,
      testResults: gradingResult.testResults,
      behaviorAnalysis: behaviorResult ? {
        suspicionScore: behaviorResult.suspicionScore,
        riskLevel: behaviorResult.riskLevel,
        signals: behaviorResult.signals
      } : null,
      skillMapping,
      feedback: {
        overall: generateOverallFeedback(gradingResult, behaviorResult),
        strengths: gradingResult.aiReview.strengths,
        improvements: gradingResult.aiReview.issues.concat(gradingResult.aiReview.suggestions)
      }
    });

  } catch (error) {
    console.error('Auto-grading API error:', error);
    return NextResponse.json(
      { error: 'Failed to grade submission' },
      { status: 500 }
    );
  }
}

function generateOverallFeedback(
  result: any,
  behaviorResult?: any
): string {
  const score = result.score;
  let feedback = '';

  if (score >= 90) {
    feedback = 'Excellent work! You demonstrated strong technical skills and problem-solving abilities.';
  } else if (score >= 80) {
    feedback = 'Great job! Your solution shows solid understanding and good coding practices.';
  } else if (score >= 70) {
    feedback = 'Good work! You solved the problem correctly with room for improvement in efficiency or code quality.';
  } else if (score >= 60) {
    feedback = 'Decent attempt. Focus on improving code efficiency and handling edge cases.';
  } else {
    feedback = 'Your solution needs significant improvement. Review the requirements and test cases carefully.';
  }

  // Add behavior insights
  if (behaviorResult && behaviorResult.suspicionScore > 0.3) {
    feedback += ` Note: Some unusual activity was detected during your session (${behaviorResult.signals.join(', ')}).`;
  }

  return feedback;
}