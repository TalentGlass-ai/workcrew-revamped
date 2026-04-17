'use client'

import React from 'react'

interface UsageMetric {
  metric: string
  quantity: number
  limit: number
  periodStart: Date
  periodEnd: Date
}

interface UsageMetersProps {
  usages: UsageMetric[]
}

export default function UsageMeters({ usages }: UsageMetersProps) {
  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      job_posts: 'Job Posts',
      candidate_unlocks: 'Candidate Unlocks',
      ai_interviews: 'AI Interviews',
      video_screenings: 'Video Screenings'
    }
    return labels[metric] || metric.replace('_', ' ')
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>

      <div className="space-y-4">
        {usages.map((usage) => {
          const percentage = (usage.quantity / usage.limit) * 100
          const progressColor = getProgressColor(percentage)

          return (
            <div key={usage.metric} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {getMetricLabel(usage.metric)}
                </span>
                <span className="text-sm text-gray-600">
                  {usage.quantity} / {usage.limit}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${progressColor} transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              {percentage >= 90 && (
                <p className="text-xs text-red-600">
                  Approaching limit - consider upgrading
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Resets on {usages[0]?.periodEnd.toLocaleDateString()}
      </div>
    </div>
  )
}