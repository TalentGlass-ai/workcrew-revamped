'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const PaymentForm = dynamic(
  () => import('../../../workcrew-ui/components/billing/PaymentForm'),
  { ssr: false }
)

const PLAN_PRICES: Record<string, { name: string; monthly: number; yearly: number }> = {
  starter:    { name: 'Starter',    monthly: 99,  yearly: 89  },
  growth:     { name: 'Growth',     monthly: 199, yearly: 179 },
  enterprise: { name: 'Enterprise', monthly: 399, yearly: 359 },
}

function CheckoutContent() {
  const router = useRouter()
  const params = useSearchParams()
  const planKey = params.get('plan') ?? 'growth'
  const billing = (params.get('billing') ?? 'monthly') as 'monthly' | 'yearly'

  const plan = PLAN_PRICES[planKey] ?? PLAN_PRICES.growth
  const price = billing === 'yearly' ? plan.yearly : plan.monthly

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  // price used for display only; subscription amount is determined server-side
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/billing/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planKey, billing }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.clientSecret) setClientSecret(data.clientSecret)
        else setError(data.error ?? 'Failed to load checkout')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [planKey, billing])

  const handleSuccess = () => {
    setSuccess(true)
    setTimeout(() => router.push('/billing'), 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900">Payment successful!</h2>
          <p className="text-gray-600 mt-2">Redirecting to your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complete your purchase</h1>
          <p className="text-gray-500 mt-1 text-sm">Secure checkout powered by Stripe</p>
        </div>

        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-gray-900">{plan.name} Plan</div>
              <div className="text-sm text-gray-500 capitalize">{billing}</div>
            </div>
            <div className="text-xl font-bold text-[#4D31EC]">
              ${price}<span className="text-sm font-normal text-gray-500">/mo</span>
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-8 text-gray-500">Loading checkout…</div>}
        {error && <div className="text-red-600 text-sm py-4">{error}</div>}
        {clientSecret && (
          <PaymentForm
            clientSecret={clientSecret}
            mode="payment"
            onSuccess={handleSuccess}
            onCancel={() => router.back()}
          />
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          By completing this purchase you agree to our Terms of Service.
        </p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
