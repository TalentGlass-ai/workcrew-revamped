import { prisma } from './prisma';
import { ASSESSMENT_PACKS, getPackByRole, calculateWeightedScore, EvaluationResult } from './assessmentPacks';

export interface AssessmentResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  feedback: string;
  behavioralAnalysis: {
    timeSpent: number;
    attempts: number;
    consistency: number;
  };
  skillScores: Record<string, number>;
  evaluationBreakdown: EvaluationResult;
}

export async function evaluateAssessment(
  attemptId: string,
  answers: Array<{ questionId: string; answerText: string; codeExecution?: any }>,
  role?: string
): Promise<AssessmentResult> {
  try {
    // Get the assessment attempt with questions
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            questions: true
          }
        },
        answers: true
      }
    });

    if (!attempt) {
      throw new Error('Assessment attempt not found');
    }

    // Get assessment pack for role-based evaluation
    const pack = role ? getPackByRole(role) : null;
    const evaluationWeights = pack?.evaluation_weights || {
      correctness: 40,
      system_design: 20,
      code_quality: 20,
      efficiency: 10,
      edge_cases: 10
    };

    let totalScore = 0;
    let maxScore = 0;
    let correctAnswers = 0;
    const skillScores: Record<string, number> = {};
    const evaluationBreakdown: EvaluationResult = {} as EvaluationResult;

    // Initialize evaluation breakdown
    Object.keys(evaluationWeights).forEach(key => {
      evaluationBreakdown[key as keyof EvaluationResult] = 0;
    });

    // Evaluate each answer
    for (const question of attempt.assessment.questions) {
      maxScore += question.weightage;

      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        // Enhanced evaluation based on role and question type
        const evaluation = evaluateAnswer(answer, question, pack);
        totalScore += evaluation.score;

        if (evaluation.correct) correctAnswers++;

        // Update skill scores
        if (question.skills) {
          question.skills.forEach((skill: string) => {
            if (!skillScores[skill]) skillScores[skill] = 0;
            skillScores[skill] += evaluation.score;
          });
        }

        // Update evaluation breakdown
        Object.entries(evaluation.criteria).forEach(([criterion, score]) => {
          if (evaluationBreakdown[criterion as keyof EvaluationResult] !== undefined) {
            evaluationBreakdown[criterion as keyof EvaluationResult] += score;
          }
        });

        // Save the answer
        await prisma.answer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: question.id
            }
          },
          update: {
            answerText: answer.answerText,
            isCorrect: evaluation.correct,
            score: evaluation.score
          },
          create: {
            attemptId,
            questionId: question.id,
            answerText: answer.answerText,
            isCorrect: evaluation.correct,
            score: evaluation.score
          }
        });
      }
    }

    // Calculate weighted score
    const weightedScore = calculateWeightedScore(evaluationBreakdown, evaluationWeights);
    const percentage = Math.round(weightedScore * 100) / 100;
    const passed = percentage >= 60; // 60% passing threshold

    // Calculate behavioral analysis
    const timeSpent = attempt.answers.length > 0 ?
      Math.max(...attempt.answers.map((a: { submittedAt: Date }) => a.submittedAt.getTime())) - attempt.startedAt.getTime() : 0;

    const behavioralAnalysis = {
      timeSpent: Math.round(timeSpent / 1000), // seconds
      attempts: attempt.answers.length,
      consistency: correctAnswers / attempt.assessment.questions.length
    };

    // Normalize skill scores
    Object.keys(skillScores).forEach(skill => {
      skillScores[skill] = Math.round((skillScores[skill] / maxScore) * 100);
    });

    const result: AssessmentResult = {
      score: weightedScore,
      maxScore,
      percentage,
      passed,
      feedback: generateFeedback(percentage, evaluationBreakdown, pack),
      behavioralAnalysis,
      skillScores,
      evaluationBreakdown
    };

    // Update the assessment with results
    await prisma.assessment.update({
      where: { id: attempt.assessmentId },
      data: {
        score: weightedScore,
        maxScore,
        percentage,
        status: passed ? 'completed' : 'failed',
        completedAt: new Date(),
        report: {
          score: weightedScore,
          percentage,
          passed,
          feedback: result.feedback,
          behavioralAnalysis,
          skillScores,
          evaluationBreakdown
        }
      }
    });

    // Update attempt
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        score: weightedScore
      }
    });

    return result;
  } catch (error) {
    console.error('Assessment evaluation error:', error);
    throw new Error('Failed to evaluate assessment');
  }
}

function evaluateAnswer(
  answer: { questionId: string; answerText: string; codeExecution?: any },
  question: any,
  pack?: any
): { score: number; correct: boolean; criteria: Record<string, number> } {
  // Enhanced evaluation logic based on question type and role
  const criteria: Record<string, number> = {};

  // Basic correctness check
  let correct = false;
  let score = 0;

  if (answer.codeExecution) {
    // Code execution results available
    correct = answer.codeExecution.passed || false;
    score = correct ? question.weightage : 0;

    // Evaluate based on test cases
    if (answer.codeExecution.testResults) {
      const passedTests = answer.codeExecution.testResults.filter((t: any) => t.passed).length;
      const totalTests = answer.codeExecution.testResults.length;
      const correctness = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
      criteria.correctness = correctness;
      score = (correctness / 100) * question.weightage;
    }
  } else {
    // Text-based evaluation (fallback)
    correct = answer.answerText.toLowerCase().trim() ===
             (question.expectedAnswer || '').toLowerCase().trim();
    score = correct ? question.weightage : 0;
    criteria.correctness = correct ? 100 : 0;
  }

  // Additional criteria evaluation based on pack
  if (pack) {
    // Evaluate system design aspects
    if (pack.evaluation_weights.system_design) {
      criteria.system_design = evaluateSystemDesign(answer.answerText, question);
    }

    // Evaluate code quality
    if (pack.evaluation_weights.code_quality) {
      criteria.code_quality = evaluateCodeQuality(answer.answerText);
    }

    // Evaluate efficiency
    if (pack.evaluation_weights.efficiency) {
      criteria.efficiency = evaluateEfficiency(answer.answerText);
    }

    // Evaluate edge cases
    if (pack.evaluation_weights.edge_cases) {
      criteria.edge_cases = evaluateEdgeCases(answer.answerText, question);
    }

    // Role-specific evaluations
    if (pack.pack_name.includes('Data')) {
      if (pack.evaluation_weights.data_handling) {
        criteria.data_handling = evaluateDataHandling(answer.answerText);
      }
      if (pack.evaluation_weights.model_quality) {
        criteria.model_quality = evaluateModelQuality(answer.answerText);
      }
    }

    if (pack.pack_name.includes('Frontend')) {
      if (pack.evaluation_weights.ui_logic) {
        criteria.ui_logic = evaluateUILogic(answer.answerText);
      }
      if (pack.evaluation_weights.async_handling) {
        criteria.async_handling = evaluateAsyncHandling(answer.answerText);
      }
    }
  }

  return { score, correct, criteria };
}

function evaluateSystemDesign(code: string, question: any): number {
  let score = 50; // Base score

  // Check for good design patterns
  if (code.includes('class') || code.includes('function')) score += 20;
  if (code.includes('try') || code.includes('catch')) score += 10;
  if (code.includes('async') || code.includes('await')) score += 10;
  if (code.includes('interface') || code.includes('type')) score += 10;

  return Math.min(score, 100);
}

function evaluateCodeQuality(code: string): number {
  let score = 50; // Base score

  // Check for good practices
  if (code.includes('//') || code.includes('/*')) score += 15; // Comments
  if (code.length > 50 && code.length < 500) score += 15; // Reasonable length
  if (!code.includes('var ')) score += 10; // Modern variable declarations
  if (code.includes('const ') || code.includes('let ')) score += 10;

  return Math.min(score, 100);
}

function evaluateEfficiency(code: string): number {
  let score = 50; // Base score

  // Check for efficient patterns
  if (!code.includes('for') || code.includes('forEach')) score += 20;
  if (code.includes('Map') || code.includes('Set')) score += 15;
  if (code.includes('reduce') || code.includes('filter')) score += 15;

  return Math.min(score, 100);
}

function evaluateEdgeCases(code: string, question: any): number {
  let score = 50; // Base score

  // Check for edge case handling
  if (code.includes('null') || code.includes('undefined')) score += 20;
  if (code.includes('if') && (code.includes('!') || code.includes('==='))) score += 15;
  if (code.includes('try') || code.includes('catch')) score += 15;

  return Math.min(score, 100);
}

function evaluateDataHandling(code: string): number {
  let score = 50; // Base score

  if (code.includes('map') || code.includes('filter')) score += 20;
  if (code.includes('JSON') || code.includes('parse')) score += 15;
  if (code.includes('null') || code.includes('undefined')) score += 15;

  return Math.min(score, 100);
}

function evaluateModelQuality(code: string): number {
  let score = 50; // Base score

  if (code.includes('train') || code.includes('predict')) score += 20;
  if (code.includes('accuracy') || code.includes('score')) score += 15;
  if (code.includes('feature') || code.includes('label')) score += 15;

  return Math.min(score, 100);
}

function evaluateUILogic(code: string): number {
  let score = 50; // Base score

  if (code.includes('useState') || code.includes('useEffect')) score += 20;
  if (code.includes('onClick') || code.includes('onChange')) score += 15;
  if (code.includes('render') || code.includes('return')) score += 15;

  return Math.min(score, 100);
}

function evaluateAsyncHandling(code: string): number {
  let score = 50; // Base score

  if (code.includes('async') || code.includes('await')) score += 25;
  if (code.includes('Promise') || code.includes('then')) score += 15;
  if (code.includes('useEffect') && code.includes('async')) score += 10;

  return Math.min(score, 100);
}

function generateFeedback(percentage: number, breakdown: EvaluationResult, pack?: any): string {
  if (percentage >= 80) {
    return "Excellent work! You demonstrated strong technical skills and problem-solving abilities.";
  } else if (percentage >= 60) {
    return "Good job! You passed the assessment with solid foundational skills.";
  } else {
    return "You did not pass this assessment. Focus on improving your core programming fundamentals and try again.";
  }
}