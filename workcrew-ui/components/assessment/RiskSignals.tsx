'use client'

import React from 'react'
import { ProctoringResult } from '../../types'
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, CursorArrowRaysIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface RiskSignalsProps {
  proctoringResult: ProctoringResult
  isExpanded: boolean
  onToggle: () => void
}

export default function RiskSignals({ proctoringResult, isExpanded, onToggle }: RiskSignalsProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'tab_switch':
        return <EyeIcon className="w-4 h-4 text-gray-500" />
      case 'copy_paste':
        return <CursorArrowRaysIcon className="w-4 h-4 text-gray-500" />
      case 'typing_pattern':
        return <CursorArrowRaysIcon className="w-4 h-4 text-gray-500" />
      case 'time_spent':
        return <ClockIcon className="w-4 h-4 text-gray-500" />
      case 'focus_loss':
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getSignalSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="p-6">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-900">⚠️ Behavior Signals</h2>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Risk Level Summary */}
      <div className={`p-4 rounded-lg border mb-4 ${getRiskColor(proctoringResult.riskLevel)}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">Risk Level: {proctoringResult.riskLevel.toUpperCase()}</span>
          <span className="text-sm">
            Suspicion Score: {(proctoringResult.suspicionScore * 100).toFixed(1)}%
          </span>
        </div>
        <p className="text-sm mt-2 opacity-90">{proctoringResult.summary}</p>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {proctoringResult.signals.map((signal, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getSignalIcon(signal.type)}
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {signal.type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-600">{signal.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${getSignalSeverityColor(signal.severity)}`}>
                  {signal.count}
                </div>
                <div className={`text-xs capitalize ${getSignalSeverityColor(signal.severity)}`}>
                  {signal.severity}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        * Behavior signals are for informational purposes only and do not affect the final score
      </div>
    </div>
  )
}