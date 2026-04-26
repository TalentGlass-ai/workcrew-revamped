'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Assessment {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  createdAt: string;
  isCompleted: boolean;
  score: number | null;
  questionCount: number;
}

export default function AssessmentListPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/assessments');
      if (!response.ok) {
        throw new Error('Failed to fetch assessments');
      }
      const data = await response.json();
      setAssessments(data.assessments || []);
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
          <p className="mt-4 text-gray-600">Loading assessments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">Error</div>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={fetchAssessments}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Assessments</h1>
          <p className="mt-2 text-gray-600">Test your skills and showcase your abilities</p>
        </div>

        {assessments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No assessments available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{assessment.title}</h2>
                  <p className="text-gray-600 text-sm mb-3">{assessment.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="capitalize">{assessment.difficulty}</span>
                    <span>{assessment.language}</span>
                    <span>{assessment.questionCount} questions</span>
                  </div>
                </div>

                {assessment.isCompleted && (
                  <div className="mb-4 p-3 bg-green-50 rounded">
                    <p className="text-green-800 text-sm font-medium">
                      Completed {assessment.score !== null ? `• Score: ${assessment.score}%` : ''}
                    </p>
                  </div>
                )}

                <Link
                  href={`/assessment/${assessment.id}`}
                  className={`w-full inline-flex justify-center items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    assessment.isCompleted
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {assessment.isCompleted ? 'View Results' : 'Start Assessment'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}