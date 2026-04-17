'use client'

import React from 'react'
import CurrentPlanDisplay from './CurrentPlanDisplay'
import UsageMeters from './UsageMeters'
import BillingHistory from './BillingHistory'
import UpgradePrompts from './UpgradePrompts'
import PaymentMethodManagement from './PaymentMethodManagement'

// Types (should be moved to a shared types file)
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

interface UsageMetric {
  metric: string
  quantity: number
  limit: number
  periodStart: Date
  periodEnd: Date
}

interface Invoice {
  id: string
  amount: number
  currency: string
  status: string
  dueDate: Date | null
  paidAt: Date | null
  createdAt: Date
}

interface PaymentMethod {
  id: string
  type: string
  last4: string | null
  brand: string | null
  expiryMonth: number | null
  expiryYear: number | null
  isDefault: boolean
  status: string
}

interface UpgradeRecommendation {
  type: 'usage_limit' | 'feature_unlock' | 'performance'
  title: string
  description: string
  recommendedPlan: string
  savings?: number
}

interface BillingDashboardProps {
  subscription: Subscription | null
  usages: UsageMetric[]
  invoices: Invoice[]
  paymentMethods: PaymentMethod[]
  recommendations: UpgradeRecommendation[]
}

export default function BillingDashboard({
  subscription,
  usages,
  invoices,
  paymentMethods,
  recommendations
}: BillingDashboardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your subscription, track usage, and view billing history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CurrentPlanDisplay subscription={subscription} />
        <UsageMeters usages={usages} />
      </div>

      <div className="mb-6">
        <UpgradePrompts recommendations={recommendations} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BillingHistory invoices={invoices} />
        <PaymentMethodManagement paymentMethods={paymentMethods} />
      </div>
    </div>
  )
}