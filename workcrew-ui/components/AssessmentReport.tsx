'use client'

import React, { useState } from 'react'
import { AssessmentReport } from '../types'
import HeaderScore from './assessment/HeaderScore'
import SkillRadar from './assessment/SkillRadar'
import CodeViewer from './assessment/CodeViewer'
import SummaryInsight from './assessment/SummaryInsight'
import RiskSignals from './assessment/RiskSignals'
import Recommendation from './assessment/Recommendation'

interface AssessmentReportProps {
  report: AssessmentReport
  className?: string
}

export default function AssessmentReportComponent({ report, className = '' }: AssessmentReportProps) {
  const [expandedSections, setExpandedSections] = useState({
    codeReview: true,
    skillBreakdown: true,
    riskSignals: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className={`max-w-6xl mx-auto bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header Score Section */}
      <HeaderScore report={report} />

      {/* Skill Radar Section */}
      <div className="border-t border-gray-200">
        <SkillRadar
          skills={report.skillBreakdown}
          isExpanded={expandedSections.skillBreakdown}
          onToggle={() => toggleSection('skillBreakdown')}
        />
      </div>

      {/* Summary Insight Section */}
      <div className="border-t border-gray-200 p-6">
        <SummaryInsight
          summary={report.summary}
          confidence={report.confidence}
          suggestedLevel={report.suggestedLevel}
        />
      </div>

      {/* Code Review Section */}
      <div className="border-t border-gray-200">
        <CodeViewer
          code={report.codeReview.code || ''}
          comments={report.codeReview.inlineComments}
          language={report.codeReview.language || 'javascript'}
          isExpanded={expandedSections.codeReview}
          onToggle={() => toggleSection('codeReview')}
        />
      </div>

      {/* Risk Signals Section */}
      <div className="border-t border-gray-200">
        <RiskSignals
          proctoringResult={report.proctoringResult}
          isExpanded={expandedSections.riskSignals}
          onToggle={() => toggleSection('riskSignals')}
        />
      </div>

      {/* Recommendation Section */}
      <div className="border-t border-gray-200 p-6">
        <Recommendation
          recommendation={report.recommendation}
          suggestedLevel={report.suggestedLevel}
          reasoning={report.summary}
        />
      </div>
    </div>
  )
}