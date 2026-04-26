'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Answer {
  id: string;
  answerText: string;
  isCorrect: boolean;
  question: {
    questionText: string;
    expectedAnswer: string;
  };
}

interface AssessmentAttempt {
  id: string;
  score: number;
  answers: Answer[];
}

interface Assessment {
  id: string;
  score: number;
  report: any;
  questions: Array<{
    id: string;
    questionText: string;
    expectedAnswer: string;
  }>;
  assessmentAttempts: AssessmentAttempt[];
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const assessmentId = params.id as string;
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [assessmentId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/assessment/results?assessmentId=${assessmentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setAssessment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">Error</div>
          <p className="mt-2 text-gray-600">{error || 'Results not found'}</p>
          <Link
            href="/assessment"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  const latestAttempt = assessment.assessmentAttempts[0];
  const score = latestAttempt?.score || assessment.score;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link
            href="/assessment"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Assessments
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {score}%
            </div>
            <p className="text-gray-600">Your Score</p>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Question Review</h2>

          {latestAttempt?.answers.map((answer, index) => (
            <div key={answer.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Question {index + 1}
                </h3>
                <p className="text-gray-700">{answer.question.questionText}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Answer</h4>
                  <div className={`p-3 rounded ${
                    answer.isCorrect
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={answer.isCorrect ? 'text-green-800' : 'text-red-800'}>
                      {answer.answerText}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Correct Answer</h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-800">{answer.question.expectedAnswer}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  answer.isCorrect
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {answer.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}