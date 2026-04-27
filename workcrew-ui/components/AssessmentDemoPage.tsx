'use client'

import React, { useState, useEffect } from 'react'
import AssessmentReport from '../components/AssessmentReport'
import { AssessmentReport as AssessmentReportType } from '../types'

// Mock data for demonstration
const mockAssessmentReport: AssessmentReportType = {
  candidateId: '123',
  candidateName: 'John Doe',
  role: 'Backend Engineer',
  overallScore: 82,
  difficulty: 'hard',
  recommendation: 'recommended',
  summary: 'Strong backend engineer with clean API design and solid problem-solving skills. Shows good understanding of algorithms and data structures. Could improve on edge case handling and code documentation.',
  skillBreakdown: [
    {
      skill: 'API Design',
      score: 85,
      level: 'advanced',
      description: 'Strong proficiency in API Design with complex problem-solving and clean architecture patterns'
    },
    {
      skill: 'Data Structures',
      score: 78,
      level: 'advanced',
      description: 'Solid grasp of Data Structures with practical application and efficient implementations'
    },
    {
      skill: 'Algorithms',
      score: 80,
      level: 'advanced',
      description: 'Strong proficiency in Algorithms with complex problem-solving and optimized solutions'
    },
    {
      skill: 'Error Handling',
      score: 65,
      level: 'intermediate',
      description: 'Solid grasp of Error Handling with practical application but room for improvement'
    },
    {
      skill: 'Code Quality',
      score: 75,
      level: 'intermediate',
      description: 'Solid grasp of Code Quality with practical application and good practices'
    }
  ],
  codeReview: {
    score: 75,
    issues: [
      'Missing null checks in some functions',
      'Could improve error handling for edge cases'
    ],
    strengths: [
      'Clean and readable code structure',
      'Good use of modern JavaScript features',
      'Efficient algorithm implementation'
    ],
    suggestions: [
      'Add input validation for API endpoints',
      'Consider adding more comprehensive error handling',
      'Add JSDoc comments for better documentation'
    ],
    inlineComments: [
      {
        line: 3,
        severity: 'warning',
        comment: 'Possible null reference if user is undefined',
        suggestion: 'Add null check before accessing user properties'
      },
      {
        line: 8,
        severity: 'info',
        comment: 'Good use of array methods for data processing',
        suggestion: undefined
      },
      {
        line: 12,
        severity: 'critical',
        comment: 'Potential infinite loop if input validation fails',
        suggestion: 'Add proper bounds checking'
      }
    ],
    code: `function processUserData(users) {
  const result = [];
  for (let user of users) {
    // Process each user
    const processed = {
      id: user.id,
      name: user.name.toUpperCase(),
      email: user.email
    };
    result.push(processed);
  }
  return result;
}

function findUserById(users, targetId) {
  for (let user of users) {
    if (user.id === targetId) {
      return user;
    }
  }
  return null;
}`,
    language: 'javascript'
  },
  proctoringResult: {
    suspicionScore: 0.2,
    riskLevel: 'low',
    signals: [
      {
        type: 'tab_switch',
        count: 2,
        severity: 'low',
        description: 'Switched tabs a few times during assessment'
      },
      {
        type: 'copy_paste',
        count: 1,
        severity: 'medium',
        description: 'Used copy/paste functionality'
      }
    ],
    summary: 'Minor unusual activity detected but within acceptable ranges'
  },
  confidence: 'high',
  suggestedLevel: 'Mid-Level Engineer',
  timestamp: new Date()
}

export default function AssessmentDemoPage() {
  const [report, setReport] = useState<AssessmentReportType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setReport(mockAssessmentReport)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment report...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load assessment report</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assessment Report Demo
          </h1>
          <p className="text-gray-600">
            Experience the GitHub PR-style code review interface for hiring evaluations
          </p>
        </div>

        <AssessmentReport report={report} />
      </div>
    </div>
  )
}