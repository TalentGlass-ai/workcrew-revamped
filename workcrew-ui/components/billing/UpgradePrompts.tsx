'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface UpgradeRecommendation {
  type: 'usage_limit' | 'feature_unlock' | 'performance'
  title: string
  description: string
  recommendedPlan: string
  savings?: number
}

interface UpgradePromptsProps {
  recommendations: UpgradeRecommendation[]
}

export default function UpgradePrompts({ recommendations }: UpgradePromptsProps) {
  const router = useRouter()

  if (recommendations.length === 0) {
    return null
  }

  const handleUpgrade = (plan: string) => {
    router.push(`/billing/checkout?plan=${encodeURIComponent(plan.toLowerCase())}`)
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Recommendations</h3>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>

                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-600">
                    Recommended: {rec.recommendedPlan}
                  </span>
                  {rec.savings && (
                    <span className="text-sm text-green-600 font-medium">
                      Save ${rec.savings}/month
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(rec.recommendedPlan)}
                className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}