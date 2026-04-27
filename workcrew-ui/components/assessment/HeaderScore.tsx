'use client'

import React from 'react'
import { AssessmentReport } from '../../types'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'

interface HeaderScoreProps {
  report: AssessmentReport
}

export default function HeaderScore({ report }: HeaderScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'recommended':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'conditional':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
      case 'not_recommended':
        return <XCircleIcon className="w-6 h-6 text-red-500" />
      default:
        return null
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-orange-100 text-orange-800'
      case 'expert':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{report.candidateName}</h1>
          <p className="text-gray-600">{report.role}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-full font-semibold ${getScoreColor(report.overallScore)}`}>
            Score: {report.overallScore}/100
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(report.difficulty)}`}>
            {report.difficulty.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getRecommendationIcon(report.recommendation)}
          <span className="text-lg font-medium capitalize">
            {report.recommendation.replace('_', ' ')}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Evaluated on {new Date(report.timestamp).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}