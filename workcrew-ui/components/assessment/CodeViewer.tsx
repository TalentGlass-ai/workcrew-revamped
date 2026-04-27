'use client'

import React, { useState } from 'react'
import { InlineComment } from '../../../lib/aiCodeEvaluator'
import { ChevronDownIcon, ChevronUpIcon, InformationCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface CodeViewerProps {
  code: string
  comments: InlineComment[]
  language: string
  isExpanded: boolean
  onToggle: () => void
}

export default function CodeViewer({ code, comments, language, isExpanded, onToggle }: CodeViewerProps) {
  const [selectedComment, setSelectedComment] = useState<number | null>(null)

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
      case 'critical':
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      default:
        return <InformationCircleIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'border-blue-200 bg-blue-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'critical':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const lines = code.split('\n')

  return (
    <div className="p-6">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-900">💻 Code Review</h2>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          {/* Code Header */}
          <div className="bg-gray-800 px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
            {language.toUpperCase()} Solution
          </div>

          {/* Code Content */}
          <div className="relative">
            <pre className="text-gray-100 text-sm leading-6 overflow-x-auto p-4">
              {lines.map((line, index) => {
                const lineNumber = index + 1
                const lineComments = comments.filter(c => c.line === lineNumber)

                return (
                  <div key={index} className="relative group">
                    {/* Line number */}
                    <span className="inline-block w-8 text-right text-gray-500 select-none mr-4">
                      {lineNumber}
                    </span>

                    {/* Code line */}
                    <span className="relative">
                      {line || ' '}
                      {lineComments.length > 0 && (
                        <button
                          onClick={() => setSelectedComment(selectedComment === lineNumber ? null : lineNumber)}
                          className="ml-2 inline-flex items-center"
                        >
                          {getSeverityIcon(lineComments[0].severity)}
                        </button>
                      )}
                    </span>

                    {/* Inline comment popup */}
                    {selectedComment === lineNumber && lineComments.length > 0 && (
                      <div className={`absolute left-full ml-4 top-0 z-10 w-80 p-3 rounded-lg border ${getSeverityColor(lineComments[0].severity)} shadow-lg`}>
                        <div className="flex items-start space-x-2">
                          {getSeverityIcon(lineComments[0].severity)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {lineComments[0].comment}
                            </p>
                            {lineComments[0].suggestion && (
                              <p className="text-sm text-gray-700 mt-1">
                                💡 {lineComments[0].suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </pre>
          </div>

          {/* Comments Summary */}
          {comments.length > 0 && (
            <div className="bg-gray-800 border-t border-gray-700 p-4">
              <h3 className="text-white font-medium mb-3">🧠 AI Review Comments</h3>
              <div className="space-y-2">
                {comments.map((comment, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    {getSeverityIcon(comment.severity)}
                    <div className="flex-1">
                      <span className="text-gray-300">
                        Line {comment.line}: {comment.comment}
                      </span>
                      {comment.suggestion && (
                        <span className="text-gray-400 block ml-4 mt-1">
                          💡 {comment.suggestion}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}