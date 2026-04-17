'use client'

import React, { useState } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
  ComposedChart,
  Bar
} from 'recharts'
import { InformationCircleIcon, LightBulbIcon, ChartBarIcon, ViewfinderCircleIcon } from '@heroicons/react/24/outline'
import type { SkillMatch, SkillInsight, ComparisonData, ComparisonMode } from '../types'

interface EnhancedSkillRadarProps {
  data: SkillMatch[]
  comparisonData?: ComparisonData
  mode?: ComparisonMode
  title?: string
  showInsights?: boolean
  insights?: SkillInsight[]
  height?: number
  className?: string
  onSkillClick?: (skill: SkillMatch) => void
  interactive?: boolean
}

const EnhancedSkillRadar: React.FC<EnhancedSkillRadarProps> = ({
  data,
  comparisonData,
  mode = 'overlay',
  title = "Skill Analysis",
  showInsights = true,
  insights = [],
  height = 400,
  className = "",
  onSkillClick,
  interactive = true
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'radar' | 'bar' | 'comparison'>('radar')

  // Enhanced tooltip with evidence and insights
  const EnhancedTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && label) {
      const skillData = data.find(d => d.skill === label)
      const skillInsight = insights.find(i => i.skill === label)

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <h4 className="font-semibold text-gray-900 mb-2">{label}</h4>

          <div className="space-y-1 mb-3">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span style={{ color: entry.color }}>
                  {entry.dataKey === 'candidate' && 'Your Level:'}
                  {entry.dataKey === 'job' && 'Job Required:'}
                  {entry.dataKey === 'average' && 'Top Candidates:'}
                  {entry.dataKey === 'topPerformer' && 'Top Performer:'}
                </span>
                <span className="font-medium">{entry.value}/10</span>
              </div>
            ))}
          </div>

          {skillInsight && (
            <div className="border-t pt-2">
              <div className="flex items-center mb-1">
                <LightBulbIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-xs font-medium text-blue-700">AI Insight</span>
              </div>
              <p className="text-xs text-gray-600">{skillInsight.insight}</p>
            </div>
          )}

          {skillData?.evidence && skillData.evidence.length > 0 && (
            <div className="border-t pt-2 mt-2">
              <p className="text-xs font-medium text-gray-700 mb-1">Evidence:</p>
              <div className="flex flex-wrap gap-1">
                {skillData.evidence.slice(0, 2).map((evidence, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {evidence}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interactive && onSkillClick && skillData && (
            <button
              onClick={() => onSkillClick(skillData)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              View Details →
            </button>
          )}
        </div>
      )
    }
    return null
  }

  // Render different chart types
  const renderChart = () => {
    if (viewMode === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />
            <PolarRadiusAxis domain={[0, 10]} />

            <Bar dataKey="candidate" fill="#3B82F6" name="Your Skills" />
            {mode !== 'candidate-only' && <Bar dataKey="job" fill="#EF4444" name="Job Required" />}
            {mode === 'overlay' && comparisonData?.average && (
              <Bar dataKey="average" fill="#10B981" name="Top Candidates" />
            )}

            <Tooltip content={<EnhancedTooltip />} />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      )
    }

    if (mode === 'side-by-side' && comparisonData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidate Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 text-center">Your Skills</h4>
            <ResponsiveContainer width="100%" height={height}>
              <RadarChart data={comparisonData.candidate}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 8 }} />
                <Radar
                  dataKey="candidate"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip content={<EnhancedTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Job Requirements Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 text-center">Job Requirements</h4>
            <ResponsiveContainer width="100%" height={height}>
              <RadarChart data={comparisonData.job || []}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 8 }} />
                <Radar
                  dataKey="job"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip content={<EnhancedTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    }

    // Default overlay radar chart
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid gridType="polygon" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            className="text-xs"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickCount={6}
          />

          <Radar
            name="Your Skills"
            dataKey="candidate"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.1}
            strokeWidth={2}
          />

          {mode !== 'candidate-only' && (
            <Radar
              name="Job Requirements"
              dataKey="job"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          )}

          {mode === 'overlay' && comparisonData?.average && (
            <Radar
              name="Top Candidates"
              dataKey="average"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          )}

          {mode === 'overlay' && comparisonData?.topPerformer && (
            <Radar
              name="Top Performer"
              dataKey="topPerformer"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          )}

          <Tooltip content={<EnhancedTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />
        </RadarChart>
      </ResponsiveContainer>
    )
  }

  // Generate insights if not provided
  const generatedInsights = insights.length > 0 ? insights : data.map(skill => {
    const gap = skill.job - skill.candidate
    let strength: SkillInsight['strength'] = 'adequate'
    let insight = ''

    if (gap >= 3) {
      strength = 'gap'
      insight = `Significant gap in ${skill.skill}. Consider upskilling to meet job requirements.`
    } else if (gap >= 1) {
      strength = 'needs_improvement'
      insight = `Room for improvement in ${skill.skill}. Building this skill would strengthen your profile.`
    } else if (skill.candidate >= skill.job + 1) {
      strength = 'excellent'
      insight = `Excellent proficiency in ${skill.skill}. This is a key strength that matches job requirements.`
    } else if (skill.candidate >= skill.job) {
      strength = 'good'
      insight = `Good alignment in ${skill.skill}. Your skills meet the job requirements well.`
    }

    return {
      skill: skill.skill,
      strength,
      insight,
      priority: gap >= 2 ? 'high' : gap >= 1 ? 'medium' : 'low'
    } as SkillInsight
  })

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('radar')}
            className={`px-3 py-1 text-xs rounded ${
              viewMode === 'radar' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Radar
          </button>
          <button
            onClick={() => setViewMode('bar')}
            className={`px-3 py-1 text-xs rounded ${
              viewMode === 'bar' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Bar
          </button>
          {comparisonData && (
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'comparison' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Compare
            </button>
          )}
        </div>
      </div>

      {renderChart()}

      {/* AI Insights Layer */}
      {showInsights && generatedInsights.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center mb-4">
            <LightBulbIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="text-md font-semibold text-gray-900">AI Skill Insights</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedInsights
              .filter(insight => insight.priority === 'high')
              .slice(0, 4)
              .map((insight) => (
                <div
                  key={insight.skill}
                  className={`p-3 rounded-lg border ${
                    insight.strength === 'excellent' ? 'bg-green-50 border-green-200' :
                    insight.strength === 'good' ? 'bg-blue-50 border-blue-200' :
                    insight.strength === 'needs_improvement' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                      insight.strength === 'excellent' ? 'bg-green-500' :
                      insight.strength === 'good' ? 'bg-blue-500' :
                      insight.strength === 'needs_improvement' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{insight.skill}</p>
                      <p className="text-xs text-gray-600 mt-1">{insight.insight}</p>
                      {insight.recommendation && (
                        <p className="text-xs text-blue-600 mt-1 font-medium">
                          💡 {insight.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Interactive Skill Details */}
      {selectedSkill && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Skill Details: {selectedSkill}</h5>
          <p className="text-sm text-gray-600">Detailed analysis and improvement suggestions...</p>
        </div>
      )}
    </div>
  )
}

export default EnhancedSkillRadar