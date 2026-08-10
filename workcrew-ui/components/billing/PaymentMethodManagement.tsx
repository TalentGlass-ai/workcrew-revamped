'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'

const PaymentForm = dynamic(() => import('./PaymentForm'), { ssr: false })

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

interface PaymentMethodManagementProps {
  paymentMethods: PaymentMethod[]
}

export default function PaymentMethodManagement({ paymentMethods: initial }: PaymentMethodManagementProps) {
  const [methods, setMethods] = useState(initial)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getBrandIcon = (brand: string | null) => {
    const icons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
    }
    return icons[brand || ''] || '💳'
  }

  const handleAddPaymentMethod = async () => {
    setLoadingAdd(true)
    setError(null)
    try {
      const res = await fetch('/api/billing/setup-intent', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to start setup')
      setClientSecret(data.clientSecret)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingAdd(false)
    }
  }

  const handleFormSuccess = async (paymentMethodId?: string) => {
    setClientSecret(null)
    if (!paymentMethodId) return

    try {
      const res = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId, setAsDefault: methods.length === 0 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save card')

      // Optimistically add the new method to the list
      setMethods(prev => [...prev, data.paymentMethod ?? {
        id: data.id ?? paymentMethodId,
        type: 'card',
        last4: null,
        brand: null,
        expiryMonth: null,
        expiryYear: null,
        isDefault: prev.length === 0,
        status: 'active',
      }])
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleSetDefault = async (id: string) => {
    setError(null)
    try {
      const res = await fetch('/api/billing/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: id }),
      })
      if (!res.ok) throw new Error('Failed to update default')
      setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })))
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleRemove = async (id: string) => {
    setError(null)
    try {
      const res = await fetch(`/api/billing/payment-methods?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove card')
      setMethods(prev => prev.filter(m => m.id !== id))
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        <button
          onClick={handleAddPaymentMethod}
          disabled={loadingAdd || !!clientSecret}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingAdd ? 'Loading…' : 'Add Card'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {methods.length === 0 && !clientSecret ? (
        <p className="text-gray-600">No payment methods added</p>
      ) : (
        <div className="space-y-3">
          {methods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getBrandIcon(method.brand)}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {method.brand ? `${method.brand} ` : ''}•••• {method.last4 ?? '????'}
                    </span>
                    {method.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  {method.expiryMonth && method.expiryYear && (
                    <div className="text-sm text-gray-600">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleRemove(method.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {clientSecret && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Add a card</h4>
          <PaymentForm
            clientSecret={clientSecret}
            mode="setup"
            onSuccess={handleFormSuccess}
            onCancel={() => setClientSecret(null)}
          />
        </div>
      )}
    </div>
  )
}
