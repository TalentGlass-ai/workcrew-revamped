'use client'

import React from 'react'

interface Invoice {
  id: string
  amount: number
  currency: string
  status: string
  dueDate: Date | null
  paidAt: Date | null
  createdAt: Date
}

interface BillingHistoryProps {
  invoices: Invoice[]
}

export default function BillingHistory({ invoices }: BillingHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'void': return 'bg-gray-100 text-gray-800'
      case 'uncollectible': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  const handleDownload = (invoiceId: string) => {
    // TODO: Implement invoice download
    console.log('Download invoice:', invoiceId)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>

      {invoices.length === 0 ? (
        <p className="text-gray-600">No invoices yet</p>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {invoice.createdAt.toLocaleDateString()}
                  {invoice.paidAt && ` • Paid ${invoice.paidAt.toLocaleDateString()}`}
                  {invoice.dueDate && !invoice.paidAt && ` • Due ${invoice.dueDate.toLocaleDateString()}`}
                </div>
              </div>

              <button
                onClick={() => handleDownload(invoice.id)}
                className="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}