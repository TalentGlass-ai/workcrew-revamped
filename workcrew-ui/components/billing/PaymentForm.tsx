'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  clientSecret: string
  mode: 'setup' | 'payment'
  onSuccess: (paymentMethodId?: string) => void
  onCancel: () => void
}

function CheckoutForm({ mode, onSuccess, onCancel }: Omit<PaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Payment failed')
      setLoading(false)
      return
    }

    const result = mode === 'setup'
      ? await stripe.confirmSetup({
          elements,
          confirmParams: { return_url: `${window.location.origin}/billing?setup=success` },
          redirect: 'if_required',
        })
      : await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: `${window.location.origin}/billing?payment=success` },
          redirect: 'if_required',
        })

    if (result.error) {
      setError(result.error.message ?? 'Payment failed')
    } else {
      const pmId = (result as any).setupIntent?.payment_method
        ?? (result as any).paymentIntent?.payment_method
      onSuccess(typeof pmId === 'string' ? pmId : undefined)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-[#4D31EC] text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-[#4029c8] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing…' : mode === 'setup' ? 'Save Card' : 'Pay Now'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function PaymentForm({ clientSecret, mode, onSuccess, onCancel }: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm mode={mode} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  )
}
