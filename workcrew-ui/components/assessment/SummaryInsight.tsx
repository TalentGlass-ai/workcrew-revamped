'use client'

import React from 'react'
import { LightBulbIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface SummaryInsightProps {
  summary: string
  confidence: 'low' | 'medium' | 'high'
  suggestedLevel: string
}

export default function SummaryInsight({ summary, confidence, suggestedLevel }: SummaryInsightProps) {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <ShieldCheckIcon className="w-5 h-5 text-green-500" />
      case 'medium':
        return <LightBulbIcon className="w-5 h-5 text-yellow-500" />
      case 'low':
        return <UserGroupIcon className="w-5 h-5 text-red-500" />
      default:
        return <LightBulbIcon className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">🧠 AI Insight</h2>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getConfidenceIcon(confidence)}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Confidence:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getConfidenceColor(confidence)}`}>
                {confidence.toUpperCase()}
              </span>
            </div>

            <p className="text-gray-800 leading-relaxed mb-4">
              {summary}
            </p>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Suggested Level:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {suggestedLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}