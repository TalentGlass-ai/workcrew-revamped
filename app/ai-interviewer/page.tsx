'use client'

import React from 'react'
import AIInterviewer from '../../workcrew-ui/components/AIInterviewer'

export default function AIInterviewerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Technical Interview
          </h1>
          <p className="text-lg text-gray-600">
            Experience a real technical interview with adaptive questioning based on your code
          </p>
        </div>
        <AIInterviewer />
      </div>
    </div>
  )
}