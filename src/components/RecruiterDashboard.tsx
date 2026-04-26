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

export default function RecruiterDashboard() {
  const [flags, setFlags] = useState<ProctoringFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const response = await fetch('/api/proctoring/events');
      const data = await response.json();
      setFlags(data.flags || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching flags:', error);
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
      <h1 className="text-3xl font-bold mb-6">Flagged Assessments</h1>
      
      {flags.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No flagged assessments at this time.</p>
        </div>
      ) : (
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