'use client'

import React from 'react'

interface Plan {
  id: string
  name: string
  tier: string
  price: number
  currency: string
  interval: string
  features: string[]
  limits: Record<string, number>
}

interface Subscription {
  id: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  plan: Plan
}

interface CurrentPlanDisplayProps {
  subscription: Subscription | null
}

export default function CurrentPlanDisplay({ subscription }: CurrentPlanDisplayProps) {
  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
        <p className="text-gray-600">No active subscription</p>
      </div>
    )
  }

  const { plan, status, currentPeriodEnd } = subscription
  const isActive = status === 'active'

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
        <p className="text-2xl font-bold text-blue-600">
          ${plan.price}/{plan.interval}
        </p>
      </div>

      <div className="mb-4">
        <h5 className="font-medium text-gray-900 mb-2">Key Features</h5>
        <ul className="space-y-1">
          {plan.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-sm text-gray-600">
        <p>Next billing date: {currentPeriodEnd.toLocaleDateString()}</p>
      </div>
    </div>
  )
}