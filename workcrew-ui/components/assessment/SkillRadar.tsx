'use client'

import React from 'react'
import { SkillBreakdown } from '../../types'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface SkillRadarProps {
  skills: SkillBreakdown[]
  isExpanded: boolean
  onToggle: () => void
}

export default function SkillRadar({ skills, isExpanded, onToggle }: SkillRadarProps) {
  const getSkillColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-red-500'
      case 'intermediate':
        return 'bg-yellow-500'
      case 'advanced':
        return 'bg-blue-500'
      case 'expert':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getSkillBgColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-red-50'
      case 'intermediate':
        return 'bg-yellow-50'
      case 'advanced':
        return 'bg-blue-50'
      case 'expert':
        return 'bg-green-50'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div className="p-6">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <h2 className="text-xl font-semibold text-gray-900">📊 Skill Breakdown</h2>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className={`p-4 rounded-lg ${getSkillBgColor(skill.level)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{skill.skill}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 capitalize">{skill.level}</span>
                  <span className="font-semibold text-gray-900">{skill.score}/100</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${getSkillColor(skill.level)}`}
                  style={{ width: `${skill.score}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-700">{skill.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}