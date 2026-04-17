'use client'

import React, { useState } from 'react'

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

export default function PaymentMethodManagement({ paymentMethods }: PaymentMethodManagementProps) {
  const [isAdding, setIsAdding] = useState(false)

  const getBrandIcon = (brand: string | null) => {
    // Simple brand icons - in real app, use proper icons
    const icons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳'
    }
    return icons[brand || ''] || '💳'
  }

  const handleAddPaymentMethod = () => {
    // TODO: Implement add payment method flow
    setIsAdding(true)
    console.log('Add payment method')
  }

  const handleSetDefault = (id: string) => {
    // TODO: Implement set default
    console.log('Set default:', id)
  }

  const handleRemove = (id: string) => {
    // TODO: Implement remove
    console.log('Remove:', id)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        <button
          onClick={handleAddPaymentMethod}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Payment Method
        </button>
      </div>

      {paymentMethods.length === 0 ? (
        <p className="text-gray-600">No payment methods added</p>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getBrandIcon(method.brand)}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {method.brand} •••• {method.last4}
                    </span>
                    {method.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </div>
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

      {isAdding && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Payment method form would go here...</p>
          <button
            onClick={() => setIsAdding(false)}
            className="mt-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}