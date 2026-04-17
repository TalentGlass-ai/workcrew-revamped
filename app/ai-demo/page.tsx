'use client'

import React from 'react'
import AIMatchExplanationEngine from '../../workcrew-ui/components/AIMatchExplanationEngine'
import type { SkillMatch, MatchReason, CandidateProfile, JobDetails } from '../../workcrew-ui/types'

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

export default function AIDemoPage() {
  const matchScore = 78 // Calculated match score

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI Match Explanation Engine
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of recruitment with ChatGPT-style AI explanations that make hiring decisions crystal clear.
            This engine analyzes candidate-job matches and provides human-like insights, recommendations, and interview guidance.
          </p>
        </div>

        {/* Demo Component */}
        <div className="mb-8">
          <AIMatchExplanationEngine
            candidate={sampleCandidate}
            job={sampleJob}
            skillMatches={sampleSkillMatches}
            matchScore={matchScore}
            reasons={sampleMatchReasons}
          />
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🚀 What Makes This Special
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversational AI</h3>
              <p className="text-gray-600">
                Natural language explanations that sound like they're written by an experienced recruiter
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Actionable Insights</h3>
              <p className="text-gray-600">
                Specific recommendations for hiring decisions, skill development, and interview questions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Analysis</h3>
              <p className="text-gray-600">
                Comprehensive match analysis in seconds, covering skills, experience, location, and culture fit
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎪</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Experience</h3>
              <p className="text-gray-600">
                Expandable sections for detailed analysis, skill deep-dives, and personalized recommendations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data-Driven Decisions</h3>
              <p className="text-gray-600">
                Every recommendation backed by skill gap analysis, evidence evaluation, and market benchmarks
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recruiter-Focused</h3>
              <p className="text-gray-600">
                Designed specifically for recruiters with hiring recommendations, interview guides, and decision support
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔧 Technical Implementation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Natural language generation algorithms</li>
                <li>• Skill gap analysis with priority scoring</li>
                <li>• Evidence-based recommendations</li>
                <li>• Interactive expandable sections</li>
                <li>• Confidence scoring system</li>
                <li>• Personalized interview question generation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Candidate skill assessments</li>
                <li>• Job requirement analysis</li>
                <li>• Historical hiring data</li>
                <li>• Market salary benchmarks</li>
                <li>• Company culture profiles</li>
                <li>• Geographic location data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Hiring Process?
            </h2>
            <p className="text-xl mb-6 text-blue-100">
              This AI Match Explanation Engine can be integrated into your existing ATS or recruitment platform
              to provide ChatGPT-style insights for every candidate evaluation.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Implementation Guide →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}