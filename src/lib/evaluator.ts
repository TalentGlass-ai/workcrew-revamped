import { executeCode, TestCase } from './sandbox';

export interface EvaluationResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
}

export async function evaluateAnswer(
  question: {
    id: string;
    questionType: string;
    expectedAnswer?: string;
    weightage: number;
    testCases?: TestCase[];
  },
  userAnswer: string
): Promise<EvaluationResult> {
  switch (question.questionType) {
    case 'multiple-choice':
      const isCorrect = userAnswer.trim() === (question.expectedAnswer || '').trim();
      return {
        isCorrect,
        score: isCorrect ? question.weightage : 0,
        feedback: isCorrect
          ? 'Correct answer!'
          : `Incorrect. The correct answer is: ${question.expectedAnswer}`
      };

    case 'code':
      if (!question.testCases || question.testCases.length === 0) {
        return {
          isCorrect: false,
          score: 0,
          feedback: 'No test cases available for evaluation'
        };
      }

      try {
        const results = await executeCode(userAnswer, 'javascript', question.testCases);
        const allPassed = results.every(result => result.passed);

        return {
          isCorrect: allPassed,
          score: allPassed ? question.weightage : 0,
          feedback: allPassed
            ? `All ${results.length} test cases passed!`
            : `Failed ${results.filter(r => !r.passed).length} out of ${results.length} test cases.`
        };
      } catch (error) {
        return {
          isCorrect: false,
          score: 0,
          feedback: 'Error executing code: ' + (error as Error).message
        };
      }

    case 'text':
      // For text answers, could use AI evaluation, but for now simple match
      const correct = userAnswer.toLowerCase().includes((question.expectedAnswer || '').toLowerCase());
      return {
        isCorrect: correct,
        score: correct ? question.weightage : 0,
        feedback: correct ? 'Good answer!' : 'Answer needs improvement.'
      };

    default:
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Unsupported question type'
      };
  }
}

export async function evaluateAssessment(assessment: any, answers: any[]): Promise<{
  totalScore: number;
  maxScore: number;
  results: EvaluationResult[];
}> {
  const results: EvaluationResult[] = [];

  for (const answer of answers) {
    const question = assessment.questions.find((q: any) => q.id === answer.questionId);
    if (question) {
      const result = await evaluateAnswer(question, answer.answerText);
      results.push(result);
    }
  }

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const maxScore = assessment.questions.reduce((sum: number, q: any) => sum + q.weightage, 0);

  return { totalScore, maxScore, results };
}