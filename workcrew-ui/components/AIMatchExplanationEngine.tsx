'use client'

import React, { useState } from 'react'
import {
  SparklesIcon,
  LightBulbIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'
import type { SkillMatch, MatchReason } from '../types'

interface CandidateProfile {
  name: string
  experience: string
  topSkills: string[]
  education?: string
  location?: string
}

interface JobDetails {
  title: string
  company: string
  requiredSkills: string[]
  preferredSkills: string[]
  experience: string
  location?: string
}

interface AIMatchExplanationEngineProps {
  candidate: CandidateProfile
  job: JobDetails
  skillMatches: SkillMatch[]
  matchScore: number
  reasons: MatchReason[]
  className?: string
}

const AIMatchExplanationEngine: React.FC<AIMatchExplanationEngineProps> = ({
  candidate,
  job,
  skillMatches,
  matchScore,
  reasons,
  className = ""
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview')

  // Generate natural language explanations
  const generateExplanation = () => {
    const strongMatches = skillMatches.filter(s => s.candidate >= s.job)
    const skillGaps = skillMatches.filter(s => s.candidate < s.job)
    const majorGaps = skillGaps.filter(s => s.job - s.candidate >= 3)

    let explanation = ""

    if (matchScore >= 85) {
      explanation = `🎉 **Excellent match!** ${candidate.name} is a strong candidate for this ${job.title} position at ${job.company}. `
    } else if (matchScore >= 70) {
      explanation = `👍 **Good match** with some areas to consider. ${candidate.name} has solid potential for this ${job.title} role. `
    } else if (matchScore >= 50) {
      explanation = `🤔 **Moderate match** that could work with development. ${candidate.name} might need some upskilling for this ${job.title} position. `
    } else {
      explanation = `⚠️ **Challenging match** requiring significant development. ${candidate.name} would need substantial upskilling for this ${job.title} role. `
    }

    if (strongMatches.length > 0) {
      explanation += `They excel in ${strongMatches.slice(0, 3).map(s => s.skill).join(', ')}`
      if (strongMatches.length > 3) explanation += ` and ${strongMatches.length - 3} other areas`
      explanation += `. `
    }

    if (majorGaps.length > 0) {
      explanation += `However, there are notable gaps in ${majorGaps.slice(0, 2).map(s => s.skill).join(' and ')}`
      if (majorGaps.length > 2) explanation += ` plus ${majorGaps.length - 2} other skills`
      explanation += ` that would need development.`
    }

    return explanation
  }

  const generateSkillAnalysis = () => {
    const analyses = skillMatches.map(skill => {
      const gap = skill.job - skill.candidate
      const isStrength = skill.candidate >= skill.job
      const isMajorGap = gap >= 3

      let analysis = ""

      if (isStrength) {
        if (skill.candidate >= skill.job + 2) {
          analysis = `🚀 **Outstanding** in ${skill.skill} - exceeds requirements by ${skill.candidate - skill.job} levels`
        } else {
          analysis = `✅ **Solid match** for ${skill.skill} - meets job requirements comfortably`
        }
      } else if (isMajorGap) {
        analysis = `⚠️ **Significant gap** in ${skill.skill} - needs ${gap} levels of improvement`
      } else {
        analysis = `📈 **Minor gap** in ${skill.skill} - could benefit from ${gap} level${gap > 1 ? 's' : ''} of development`
      }

      return { skill: skill.skill, analysis, isStrength, gap }
    })

    return analyses
  }

  const generateRecommendations = () => {
    const recommendations = []

    // Experience-based recommendations
    if (candidate.experience === 'Senior' && job.experience === 'Mid-level') {
      recommendations.push({
        type: 'experience',
        priority: 'high',
        text: `Consider if ${candidate.name}'s senior experience aligns with the mid-level scope of this role`,
        icon: '⚖️'
      })
    }

    // Location recommendations
    if (candidate.location && job.location && candidate.location !== job.location) {
      recommendations.push({
        type: 'location',
        priority: 'medium',
        text: `Location difference: ${candidate.name} is in ${candidate.location}, job is in ${job.location}`,
        icon: '📍'
      })
    }

    // Skill development recommendations
    const skillGaps = skillMatches.filter(s => s.job - s.candidate >= 2)
    if (skillGaps.length > 0) {
      recommendations.push({
        type: 'skills',
        priority: 'high',
        text: `Focus development on: ${skillGaps.slice(0, 3).map(s => s.skill).join(', ')}`,
        icon: '🎯'
      })
    }

    // Transferable skills
    const transferableSkills = skillMatches.filter(s => s.candidate >= 7 && s.job < 7)
    if (transferableSkills.length > 0) {
      recommendations.push({
        type: 'transferable',
        priority: 'medium',
        text: `Highlight transferable skills: ${transferableSkills.slice(0, 2).map(s => s.skill).join(', ')}`,
        icon: '🔄'
      })
    }

    return recommendations
  }

  const generateInterviewQuestions = () => {
    const questions = []

    // Experience questions
    questions.push(`Can you walk us through your experience with ${job.requiredSkills[0]}?`)

    // Skill gap questions
    const majorGaps = skillMatches.filter(s => s.job - s.candidate >= 3)
    if (majorGaps.length > 0) {
      questions.push(`How would you approach learning ${majorGaps[0].skill} if given the opportunity?`)
    }

    // Strength questions
    const strengths = skillMatches.filter(s => s.candidate >= s.job + 1)
    if (strengths.length > 0) {
      questions.push(`What's your most impressive project involving ${strengths[0].skill}?`)
    }

    // Cultural fit
    questions.push(`What interests you most about working at ${job.company}?`)

    return questions.slice(0, 4) // Return top 4 questions
  }

  const skillAnalysis = generateSkillAnalysis()
  const recommendations = generateRecommendations()
  const interviewQuestions = generateInterviewQuestions()

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-white mr-3" />
            <div>
              <h2 className="text-xl font-bold text-white">AI Match Analysis</h2>
              <p className="text-blue-100 text-sm">
                {candidate.name} ↔ {job.title} at {job.company}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{matchScore}%</div>
            <div className="text-blue-100 text-sm">Match Score</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Overview Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'overview' ? null : 'overview')}
            className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-900">AI Overview</span>
            </div>
            <ArrowUpIcon className={`h-4 w-4 text-gray-500 transform transition-transform ${expandedSection === 'overview' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'overview' && (
            <div className="p-4 bg-white">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <SparklesIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed">
                    {generateExplanation()}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <span className="font-medium">Analysis based on:</span>
                    <span className="ml-2">{skillMatches.length} skills compared</span>
                    <span className="mx-2">•</span>
                    <span>{candidate.experience} experience</span>
                    <span className="mx-2">•</span>
                    <span>{reasons.length} factors considered</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skills Analysis */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'skills' ? null : 'skills')}
            className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <LightBulbIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-gray-900">Skills Deep Dive</span>
            </div>
            <ArrowUpIcon className={`h-4 w-4 text-gray-500 transform transition-transform ${expandedSection === 'skills' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'skills' && (
            <div className="p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillAnalysis.map((analysis, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      analysis.isStrength
                        ? 'bg-green-50 border-green-200'
                        : analysis.gap >= 3
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{analysis.skill}</h4>
                        <p className={`text-sm mt-1 ${
                          analysis.isStrength ? 'text-green-700' :
                          analysis.gap >= 3 ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {analysis.analysis}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'recommendations' ? null : 'recommendations')}
            className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <ArrowUpIcon className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium text-gray-900">Smart Recommendations</span>
            </div>
            <ArrowUpIcon className={`h-4 w-4 text-gray-500 transform transition-transform ${expandedSection === 'recommendations' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'recommendations' && (
            <div className="p-4 bg-white">
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`flex items-start p-3 rounded-lg border ${
                      rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                      rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <span className="text-lg mr-3">{rec.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{rec.text}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interview Questions */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'interview' ? null : 'interview')}
            className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="font-medium text-gray-900">Suggested Interview Questions</span>
            </div>
            <ArrowUpIcon className={`h-4 w-4 text-gray-500 transform transition-transform ${expandedSection === 'interview' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'interview' && (
            <div className="p-4 bg-white">
              <div className="space-y-3">
                {interviewQuestions.map((question, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-medium text-indigo-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Final AI Verdict */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Final Assessment</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                {matchScore >= 80
                  ? `🎯 **Strong Hire Recommendation** - ${candidate.name} demonstrates excellent alignment with this ${job.title} position. Their skills and experience make them a top candidate worth prioritizing for interviews.`
                  : matchScore >= 65
                  ? `👍 **Consider for Interview** - ${candidate.name} shows good potential for this role with some development opportunities. Their strengths in key areas make them worth exploring further.`
                  : matchScore >= 45
                  ? `🤔 **Borderline Candidate** - ${candidate.name} has some relevant skills but would need significant development. Consider if they're willing to grow into the role or if this is a stepping stone position.`
                  : `⚠️ **Not Recommended** - ${candidate.name} would require substantial upskilling for this ${job.title} position. Consider roles better aligned with their current skill set.`
                }
              </p>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Confidence:</span>
                <div className="ml-2 flex items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(matchScore + 10, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs">{Math.min(matchScore + 10, 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIMatchExplanationEngine