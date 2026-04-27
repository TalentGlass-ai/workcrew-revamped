'use client'

import React from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, UserGroupIcon } from '@heroicons/react/24/solid'

interface RecommendationProps {
  recommendation: 'recommended' | 'conditional' | 'not_recommended'
  suggestedLevel: string
  reasoning: string
}

export default function Recommendation({ recommendation, suggestedLevel, reasoning }: RecommendationProps) {
  const getRecommendationConfig = (rec: string) => {
    switch (rec) {
      case 'recommended':
        return {
          icon: <CheckCircleIcon className="w-8 h-8 text-green-500" />,
          title: '✅ Recommended',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'Strong candidate match for this role'
        }
      case 'conditional':
        return {
          icon: <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />,
          title: '⚠️ Conditional Recommendation',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          description: 'May be suitable with additional training or experience'
        }
      case 'not_recommended':
        return {
          icon: <XCircleIcon className="w-8 h-8 text-red-500" />,
          title: '❌ Not Recommended',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          description: 'Does not meet requirements for this role'
        }
      default:
        return {
          icon: <UserGroupIcon className="w-8 h-8 text-gray-500" />,
          title: 'Under Review',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          description: 'Assessment in progress'
        }
    }
  }

  const config = getRecommendationConfig(recommendation)

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Recommendation</h2>

      <div className={`p-6 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {config.icon}
          </div>

          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${config.color} mb-2`}>
              {config.title}
            </h3>

            <p className="text-gray-700 mb-4">
              {config.description}
            </p>

            <div className="flex items-center space-x-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Suggested Level:</span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {suggestedLevel}
                </span>
              </div>
            </div>

            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Reasoning:</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {reasoning}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}