'use client'

import React from 'react'
import ConversationalAIAssistant from '../../workcrew-ui/components/ConversationalAIAssistant'
import type { CandidateProfile, JobDetails, SkillMatch, MatchReason } from '../../workcrew-ui/types'

// Sample data for demonstration
const sampleCandidate: CandidateProfile = {
  name: 'Alex Chen',
  experience: 'Senior',
  topSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
  education: 'Computer Science, MIT',
  location: 'Boston, MA'
}

const sampleJob: JobDetails = {
  title: 'Senior Full-Stack Developer',
  company: 'InnovateLabs',
  requiredSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Docker'],
  preferredSkills: ['Python', 'AWS', 'Kubernetes', 'MongoDB'],
  experience: 'Senior',
  location: 'Boston, MA'
}

const sampleSkillMatches: SkillMatch[] = [
  {
    skill: 'React',
    candidate: 9,
    job: 8,
    evidence: ['Led React migration project', '3+ years experience'],
    description: 'Expert level React development with advanced hooks and performance optimization'
  },
  {
    skill: 'TypeScript',
    candidate: 8,
    job: 9,
    evidence: ['TypeScript certification', 'Large-scale TS migration'],
    description: 'Strong TypeScript skills with advanced types and generics'
  },
  {
    skill: 'Node.js',
    candidate: 9,
    job: 7,
    evidence: ['Built microservices architecture', 'Express.js expert'],
    description: 'Senior Node.js developer with extensive backend experience'
  },
  {
    skill: 'GraphQL',
    candidate: 3,
    job: 8,
    evidence: ['Completed GraphQL tutorial'],
    description: 'Basic GraphQL knowledge, needs significant hands-on experience'
  },
  {
    skill: 'Docker',
    candidate: 4,
    job: 7,
    evidence: ['Docker basics certification'],
    description: 'Fundamental Docker knowledge, limited production experience'
  },
  {
    skill: 'Python',
    candidate: 7,
    job: 5,
    evidence: ['Data analysis projects', 'Django applications'],
    description: 'Solid Python skills for data processing and web development'
  },
  {
    skill: 'AWS',
    candidate: 6,
    job: 8,
    evidence: ['AWS Solutions Architect Associate', 'EC2, S3, Lambda experience'],
    description: 'Good AWS foundation with common services experience'
  }
]

const sampleMatchReasons: MatchReason[] = [
  {
    type: 'skill_match',
    title: 'Strong React & Node.js expertise',
    description: 'Candidate exceeds requirements in core technologies',
    impact: 'positive',
    value: '9/10 vs 8/10 required'
  },
  {
    type: 'skill_gap',
    title: 'GraphQL experience gap',
    description: 'Limited GraphQL knowledge for a required skill',
    impact: 'negative',
    value: '3/10 vs 8/10 required'
  },
  {
    type: 'experience_match',
    title: 'Senior-level experience alignment',
    description: 'Experience level matches job requirements perfectly',
    impact: 'positive'
  },
  {
    type: 'location_match',
    title: 'Local candidate',
    description: 'Located in same city as job opportunity',
    impact: 'positive'
  },
  {
    type: 'skill_match',
    title: 'Bonus Python skills',
    description: 'Additional valuable skills beyond requirements',
    impact: 'positive',
    value: '7/10 proficiency'
  }
]

export default function AIChatPage() {
  const handleAction = (action: string, data?: any) => {
    console.log('AI Assistant Action:', action, data)

    // Handle different actions
    switch (action) {
      case 'view_detailed_match':
        alert('Opening detailed match analysis...')
        break
      case 'find_similar_jobs':
        alert('Searching for similar jobs...')
        break
      case 'update_profile':
        alert('Redirecting to profile update...')
        break
      case 'view_learning_resources':
        alert('Opening learning resources...')
        break
      case 'search_jobs':
        alert('Searching for recommended jobs...')
        break
      case 'create_learning_plan':
        alert('Creating personalized learning plan...')
        break
      case 'start_mock_interview':
        alert('Starting mock interview practice...')
        break
      default:
        console.log('Unhandled action:', action)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 Conversational AI Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of hiring with an AI assistant that understands your career goals,
            analyzes job matches, and provides personalized guidance like a human career coach.
          </p>
        </div>

        {/* AI Assistant Component */}
        <div className="mb-8">
          <ConversationalAIAssistant
            candidate={sampleCandidate}
            currentJob={sampleJob}
            skillMatches={sampleSkillMatches}
            matchScore={78}
            reasons={sampleMatchReasons}
            onAction={handleAction}
          />
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🚀 What Makes This Revolutionary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contextual Understanding</h3>
              <p className="text-gray-600">
                Remembers your profile, skills, and job preferences to provide personalized, relevant advice
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Conversations</h3>
              <p className="text-gray-600">
                Responds in natural language, understands intent, and provides ChatGPT-style explanations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Actionable Insights</h3>
              <p className="text-gray-600">
                Provides specific recommendations, learning paths, and next steps you can actually implement
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data-Driven Advice</h3>
              <p className="text-gray-600">
                All recommendations backed by your skill data, market trends, and job requirements analysis
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Guidance</h3>
              <p className="text-gray-600">
                Instant responses to career questions, interview prep, salary negotiation, and skill development
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎪</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Experience</h3>
              <p className="text-gray-600">
                Clickable suggestions, action buttons, and seamless integration with your job search workflow
              </p>
            </div>
          </div>
        </div>

        {/* Sample Conversations */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            💬 Try These Conversations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">For Job Seekers</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• "Why is my match score low?"</li>
                <li>• "How can I improve my profile?"</li>
                <li>• "Suggest better jobs for me"</li>
                <li>• "What skills should I learn next?"</li>
                <li>• "Help me prepare for interviews"</li>
                <li>• "What's a good salary range for me?"</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">For Recruiters</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• "Why does this candidate match well?"</li>
                <li>• "What should I ask in the interview?"</li>
                <li>• "Find similar candidates"</li>
                <li>• "What's the candidate's salary expectation?"</li>
                <li>• "How strong are their technical skills?"</li>
                <li>• "Should I move forward with this candidate?"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔧 Technical Architecture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Capabilities</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Intent recognition and natural language processing</li>
                <li>• Context-aware conversation memory</li>
                <li>• Skill gap analysis and recommendations</li>
                <li>• Job market intelligence integration</li>
                <li>• Personalized learning path generation</li>
                <li>• Interview preparation algorithms</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Points</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• User profile and skill data</li>
                <li>• Job requirements and descriptions</li>
                <li>• Historical interaction data</li>
                <li>• Market salary and trend data</li>
                <li>• Learning resource databases</li>
                <li>• Company culture and values data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Deploy AI-Powered Hiring?
            </h2>
            <p className="text-xl mb-6 text-blue-100">
              This Conversational AI Assistant can transform your job platform into an intelligent career companion.
              Users will never want to use a platform without AI assistance again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                View Integration Guide →
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Schedule Demo Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}