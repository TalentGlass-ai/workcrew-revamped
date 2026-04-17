'use client'

import React from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface MatchReason {
  type: 'skill_match' | 'skill_gap' | 'experience_match' | 'location_match' | 'salary_match'
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  value?: string
}

interface AIExplanationProps {
  matchScore: number
  reasons: MatchReason[]
  className?: string
}

const AIExplanation: React.FC<AIExplanationProps> = ({
  matchScore,
  reasons,
  className = ""
}) => {
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'negative':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'neutral':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'negative':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'neutral':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    }
  }

  const positiveReasons = reasons.filter(r => r.impact === 'positive')
  const negativeReasons = reasons.filter(r => r.impact === 'negative')
  const neutralReasons = reasons.filter(r => r.impact === 'neutral')

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Why This Matches You
        </h3>
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900 mr-2">
            {matchScore}%
          </span>
          <span className="text-sm text-gray-600">Match</span>
        </div>
      </div>

      {/* Match Score Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Match Strength</span>
          <span>{matchScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              matchScore >= 80 ? 'bg-green-500' :
              matchScore >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${matchScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Reasons */}
      <div className="space-y-4">
        {/* Positive Reasons */}
        {positiveReasons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              What matches well
            </h4>
            <div className="space-y-2">
              {positiveReasons.map((reason, index) => (
                <div
                  key={index}
                  className={`flex items-start p-3 rounded-lg border ${getImpactColor(reason.impact)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getImpactIcon(reason.impact)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{reason.title}</p>
                    <p className="text-sm opacity-90 mt-1">{reason.description}</p>
                    {reason.value && (
                      <p className="text-xs font-medium mt-1 opacity-75">
                        {reason.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Negative Reasons */}
        {negativeReasons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-800 mb-3 flex items-center">
              <XCircleIcon className="h-4 w-4 mr-1" />
              Areas for improvement
            </h4>
            <div className="space-y-2">
              {negativeReasons.map((reason, index) => (
                <div
                  key={index}
                  className={`flex items-start p-3 rounded-lg border ${getImpactColor(reason.impact)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getImpactIcon(reason.impact)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{reason.title}</p>
                    <p className="text-sm opacity-90 mt-1">{reason.description}</p>
                    {reason.value && (
                      <p className="text-xs font-medium mt-1 opacity-75">
                        {reason.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Neutral Reasons */}
        {neutralReasons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              Additional factors
            </h4>
            <div className="space-y-2">
              {neutralReasons.map((reason, index) => (
                <div
                  key={index}
                  className={`flex items-start p-3 rounded-lg border ${getImpactColor(reason.impact)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getImpactIcon(reason.impact)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{reason.title}</p>
                    <p className="text-sm opacity-90 mt-1">{reason.description}</p>
                    {reason.value && (
                      <p className="text-xs font-medium mt-1 opacity-75">
                        {reason.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Insight */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">AI</span>
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">
              AI Recommendation
            </h4>
            <p className="mt-1 text-sm text-blue-700">
              {matchScore >= 80
                ? "This is an excellent match! Your skills align very well with the job requirements."
                : matchScore >= 60
                ? "This is a good match with some room for improvement. Consider highlighting your transferable skills."
                : "This job requires skills you don't currently have listed. Consider upskilling or focusing on similar roles."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIExplanation