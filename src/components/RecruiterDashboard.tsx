'use client';

import { useState, useEffect } from 'react';

interface ProctoringFlag {
  id: string;
  assessmentId: string;
  candidateId: string;
  reason: string;
  severity: string;
  flaggedAt: string;
  reviewed: boolean;
  assessment: {
    id: string;
    score: number | null;
  };
  candidate: {
    id: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
}

interface Assessment {
  id: string;
  score: number | null;
  difficulty: string;
  language: string;
  timeTaken: number;
  createdAt: string;
  completed: boolean;
  candidate: {
    id: string;
    name: string | null;
    email: string | null;
  };
  job: {
    id: string;
    title: string;
  };
}

export default function RecruiterDashboard() {
  const [flags, setFlags] = useState<ProctoringFlag[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlags();
    fetchAssessments();
  }, []);

  const fetchFlags = async () => {
    try {
      const response = await fetch('/api/proctoring/events');
      const data = await response.json();
      setFlags(data.flags || []);
    } catch (error) {
      console.error('Error fetching flags:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/assessments/all');
      const data = await response.json();
      setAssessments(data.assessments || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissFlag = async (flagId: string) => {
    // In a real implementation, you'd have an API to update the flag
    // For now, just remove from local state
    setFlags(flags.filter(flag => flag.id !== flagId));
  };

  if (loading) return <div className="p-4">Loading flagged assessments...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Recruiter Dashboard</h1>

      {/* Assessment Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Assessments</h2>
        {assessments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No assessments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border-b text-left">Candidate</th>
                  <th className="px-4 py-2 border-b text-left">Job</th>
                  <th className="px-4 py-2 border-b text-left">Score</th>
                  <th className="px-4 py-2 border-b text-left">Status</th>
                  <th className="px-4 py-2 border-b text-left">Difficulty</th>
                  <th className="px-4 py-2 border-b text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">
                      <div>
                        <div className="font-medium">{assessment.candidate.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-600">{assessment.candidate.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b">{assessment.job.title}</td>
                    <td className="px-4 py-2 border-b">
                      {assessment.score !== null ? `${assessment.score}%` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        assessment.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assessment.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b capitalize">{assessment.difficulty}</td>
                    <td className="px-4 py-2 border-b">
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Flagged Assessments */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Flagged Assessments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 border-b text-left">Candidate</th>
                <th className="px-4 py-2 border-b text-left">Assessment</th>
                <th className="px-4 py-2 border-b text-left">Reason</th>
                <th className="px-4 py-2 border-b text-left">Severity</th>
                <th className="px-4 py-2 border-b text-left">Flagged At</th>
                <th className="px-4 py-2 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">
                    <div>
                      <div className="font-medium">{flag.candidate.user.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">{flag.candidate.user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 border-b">
                    Assessment {flag.assessmentId.slice(-8)}
                  </td>
                  <td className="px-4 py-2 border-b">{flag.reason}</td>
                  <td className="px-4 py-2 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      flag.severity === 'high' ? 'bg-red-100 text-red-800' :
                      flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {flag.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b">
                    {new Date(flag.flaggedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => dismissFlag(flag.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Dismiss
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}