'use client'

import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'

interface SkillData {
  skill: string
  candidate: number
  job: number
  average?: number
}

interface SkillRadarProps {
  data: SkillData[]
  title?: string
  showAverage?: boolean
  height?: number
  className?: string
}

const SkillRadar: React.FC<SkillRadarProps> = ({
  data,
  title = "Skill Match Analysis",
  showAverage = false,
  height = 400,
  className = ""
}) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === 'candidate' && 'Your Level: '}
              {entry.dataKey === 'job' && 'Job Required: '}
              {entry.dataKey === 'average' && 'Top Candidates: '}
              {entry.value}/10
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

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

          <Radar
            name="Job Requirements"
            dataKey="job"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.1}
            strokeWidth={2}
          />

          {showAverage && (
            <Radar
              name="Top Candidates"
              dataKey="average"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          )}

          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Skill breakdown */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((skill) => {
          const matchLevel = skill.candidate >= skill.job ? 'good' : 'gap'
          const gap = skill.job - skill.candidate

          return (
            <div key={skill.skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{skill.skill}</p>
                <div className="flex items-center mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(skill.candidate / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{skill.candidate}/10</span>
                </div>
                <div className="flex items-center mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(skill.job / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{skill.job}/10</span>
                </div>
              </div>

              {gap > 0 && (
                <div className="ml-3 text-right">
                  <span className="text-xs text-red-600 font-medium">
                    Gap: {gap}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SkillRadar