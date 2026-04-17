'use client'

import React from 'react'
import { LightBulbIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

interface SkillSuggestion {
  skill: string
  currentMatch: number
  potentialMatch: number
  improvement: number
  reason: string
  priority: 'high' | 'medium' | 'low'
}

interface ProfileImprovementProps {
  suggestions: SkillSuggestion[]
  className?: string
}

const ProfileImprovement: React.FC<ProfileImprovementProps> = ({
  suggestions,
  className = ""
}) => {
  const sortedSuggestions = suggestions.sort((a, b) => b.improvement - a.improvement)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  if (suggestions.length === 0) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <LightBulbIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Your profile is optimized! 🎉
            </h3>
            <p className="mt-1 text-sm text-green-700">
              You're matching well with available jobs. Keep up the great work!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <LightBulbIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Improve Your Profile
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Add these skills to your profile to increase your match percentage with more jobs.
      </p>

      <div className="space-y-4">
        {sortedSuggestions.map((suggestion, index) => (
          <div
            key={suggestion.skill}
            className={`border rounded-lg p-4 ${getPriorityColor(suggestion.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">
                    {getPriorityIcon(suggestion.priority)}
                  </span>
                  <h4 className="font-medium text-gray-900">
                    Add "{suggestion.skill}"
                  </h4>
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-75">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    +{suggestion.improvement}%
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  {suggestion.reason}
                </p>

                <div className="flex items-center text-sm">
                  <span className="text-gray-600">
                    Current match: {suggestion.currentMatch}%
                  </span>
                  <span className="mx-2 text-gray-400">→</span>
                  <span className="font-medium text-gray-900">
                    Potential: {suggestion.potentialMatch}%
                  </span>
                </div>
              </div>

              <div className="ml-4">
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Add to Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <LightBulbIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">
              Pro Tip
            </h4>
            <p className="mt-1 text-sm text-blue-700">
              Focus on high-priority skills first. Adding just 2-3 key skills can significantly improve your job matches.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileImprovement