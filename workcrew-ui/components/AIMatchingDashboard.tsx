'use client'

import React, { useState, useEffect } from 'react'
import EnhancedSkillRadar from './EnhancedSkillRadar'
import AIExplanation from './AIExplanation'
import AIMatchExplanationEngine from './AIMatchExplanationEngine'
import ConversationalAIAssistant from './ConversationalAIAssistant'
import ProfileImprovement from './ProfileImprovement'
import { useJobInteractions, useCandidateInteractions } from '../lib/hooks/useUserInteractionTracking'
import type {
  CandidateRecommendation,
  JobRecommendation,
  SkillMatch,
  MatchReason,
  SkillSuggestion,
  ComparisonData,
  SkillInsight,
  CandidateProfile,
  JobDetails
} from '../types'

// Mock data for demonstration - replace with real API calls
const mockJobRecommendations: JobRecommendation[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechCorp',
    matchScore: 85,
    matchedSkills: ['React', 'TypeScript', 'JavaScript'],
    missingSkills: ['GraphQL', 'Docker'],
    location: 'San Francisco, CA',
    salary: '$120k - $150k',
    skills: ['React', 'TypeScript', 'JavaScript', 'GraphQL', 'Docker'],
    description: 'Build amazing user experiences with modern web technologies...'
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    matchScore: 72,
    matchedSkills: ['React', 'Node.js', 'PostgreSQL'],
    missingSkills: ['AWS', 'Kubernetes'],
    location: 'Remote',
    salary: '$90k - $120k',
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Kubernetes'],
    description: 'Join our fast-growing team building the future of work...'
  }
]

const mockCandidateRecommendations: CandidateRecommendation[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    matchScore: 88,
    matchedSkills: ['React', 'TypeScript', 'Node.js'],
    missingSkills: ['GraphQL'],
    skillMatchRatio: 75,
    topSkills: ['React', 'TypeScript', 'JavaScript', 'Node.js'],
    experience: 'Senior',
    location: 'San Francisco, CA',
    bio: 'Passionate full-stack developer with 5+ years experience...'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.c@example.com',
    matchScore: 79,
    matchedSkills: ['React', 'JavaScript', 'CSS'],
    missingSkills: ['TypeScript', 'Docker'],
    skillMatchRatio: 60,
    topSkills: ['React', 'JavaScript', 'CSS', 'HTML'],
    experience: 'Mid-level',
    location: 'New York, NY',
    bio: 'Creative frontend developer specializing in modern UI/UX...'
  }
]

const mockSkillData: SkillMatch[] = [
  {
    skill: 'React',
    candidate: 9,
    job: 8,
    average: 7,
    evidence: ['GitHub: react-portfolio', '3 years experience'],
    description: 'Expert level React development with hooks and advanced patterns'
  },
  {
    skill: 'TypeScript',
    candidate: 7,
    job: 9,
    average: 8,
    evidence: ['TypeScript certification', 'Large codebase migration'],
    description: 'Strong TypeScript skills with advanced types and generics'
  },
  {
    skill: 'Node.js',
    candidate: 8,
    job: 7,
    average: 6,
    evidence: ['Express.js APIs', 'Microservices architecture'],
    description: 'Backend development with Node.js and modern frameworks'
  },
  {
    skill: 'GraphQL',
    candidate: 2,
    job: 8,
    average: 7,
    evidence: ['Basic tutorials completed'],
    description: 'Limited GraphQL experience, needs significant improvement'
  },
  {
    skill: 'Docker',
    candidate: 3,
    job: 6,
    average: 5,
    evidence: ['Docker basics course'],
    description: 'Basic containerization knowledge, practical experience needed'
  },
  {
    skill: 'AWS',
    candidate: 4,
    job: 7,
    average: 8,
    evidence: ['AWS certification in progress'],
    description: 'Growing cloud skills, needs hands-on experience'
  }
]

const mockComparisonData: ComparisonData = {
  candidate: mockSkillData,
  job: mockSkillData.map(skill => ({ ...skill, candidate: skill.job })),
  average: mockSkillData.map(skill => ({ ...skill, candidate: skill.average || 5 })),
  topPerformer: mockSkillData.map(skill => ({
    ...skill,
    candidate: Math.min(10, skill.job + 2)
  }))
}

const mockSkillInsights: SkillInsight[] = [
  {
    skill: 'React',
    strength: 'excellent',
    insight: 'Your React expertise exceeds job requirements. This is a key strength that sets you apart.',
    recommendation: 'Consider mentoring junior developers in React best practices.',
    priority: 'low'
  },
  {
    skill: 'TypeScript',
    strength: 'good',
    insight: 'Good TypeScript alignment with job needs. Minor gap can be addressed with targeted learning.',
    recommendation: 'Focus on advanced TypeScript patterns and utility types.',
    priority: 'medium'
  },
  {
    skill: 'GraphQL',
    strength: 'gap',
    insight: 'Significant gap in GraphQL expertise. This is a critical requirement for the role.',
    recommendation: 'Complete GraphQL certification and build a sample project.',
    priority: 'high'
  },
  {
    skill: 'Docker',
    strength: 'needs_improvement',
    insight: 'Basic Docker knowledge exists but practical experience is needed for this role.',
    recommendation: 'Set up local development environment with Docker and deploy a sample app.',
    priority: 'high'
  }
]

// Sample data for AI Match Explanation Engine
const mockCandidateProfile: CandidateProfile = {
  name: 'Sarah Johnson',
  experience: 'Senior',
  topSkills: ['React', 'TypeScript', 'Node.js', 'JavaScript'],
  education: 'Computer Science, Stanford University',
  location: 'San Francisco, CA'
}

const mockJobDetails: JobDetails = {
  title: 'Senior React Developer',
  company: 'TechCorp',
  requiredSkills: ['React', 'TypeScript', 'GraphQL', 'Node.js'],
  preferredSkills: ['Docker', 'AWS', 'Kubernetes'],
  experience: 'Senior',
  location: 'San Francisco, CA'
}

const mockMatchReasons: MatchReason[] = [
  {
    type: 'skill_match',
    title: 'Strong React expertise',
    description: 'Your React skills exceed job requirements',
    impact: 'positive',
    value: '9/10 vs 8/10 required'
  },
  {
    type: 'skill_gap',
    title: 'Missing GraphQL experience',
    description: 'Job requires GraphQL but you have limited experience',
    impact: 'negative',
    value: '2/10 vs 8/10 required'
  },
  {
    type: 'experience_match',
    title: 'Experience level matches',
    description: 'Your senior-level experience aligns well',
    impact: 'positive'
  },
  {
    type: 'location_match',
    title: 'Location flexibility',
    description: 'Open to remote work arrangements',
    impact: 'neutral'
  }
]

const mockSkillSuggestions: SkillSuggestion[] = [
  {
    skill: 'GraphQL',
    currentMatch: 65,
    potentialMatch: 85,
    improvement: 20,
    reason: 'This job requires GraphQL and 80% of similar roles do too',
    priority: 'high'
  },
  {
    skill: 'Docker',
    currentMatch: 72,
    potentialMatch: 88,
    improvement: 16,
    reason: 'Containerization skills are increasingly important',
    priority: 'medium'
  },
  {
    skill: 'AWS',
    currentMatch: 78,
    potentialMatch: 90,
    improvement: 12,
    reason: 'Cloud skills open up more senior opportunities',
    priority: 'medium'
  }
]

interface AIMatchingDashboardProps {
  userType: 'candidate' | 'recruiter'
  userId: string
  className?: string
}

const AIMatchingDashboard: React.FC<AIMatchingDashboardProps> = ({
  userType,
  userId,
  className = ""
}) => {
  const [selectedJob, setSelectedJob] = useState<JobRecommendation | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecommendation | null>(null)
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[]>([])
  const [candidateRecommendations, setCandidateRecommendations] = useState<CandidateRecommendation[]>([])
  const [comparisonMode, setComparisonMode] = useState<'overlay' | 'side-by-side' | 'candidate-only'>('overlay')

  const { trackJobView, trackJobApply, trackJobSave } = useJobInteractions()
  const { trackCandidateView, trackCandidateContact } = useCandidateInteractions()

  // Load recommendations on mount
  useEffect(() => {
    if (userType === 'candidate') {
      // In real app: fetch(`/api/jobs/recommended?candidateId=${userId}`)
      setJobRecommendations(mockJobRecommendations)
    } else {
      // In real app: fetch(`/api/candidates/recommended?jobId=${userId}`)
      setCandidateRecommendations(mockCandidateRecommendations)
    }
  }, [userType, userId])

  const handleJobSelect = (job: JobRecommendation) => {
    setSelectedJob(job)
    trackJobView(job.id, userType === 'candidate' ? userId : undefined)
  }

  const handleCandidateSelect = (candidate: CandidateRecommendation) => {
    setSelectedCandidate(candidate)
    trackCandidateView(candidate.id, userType === 'recruiter' ? userId : undefined)
  }

  const handleApply = (jobId: string) => {
    trackJobApply(jobId, userId)
    // Handle application logic
  }

  const handleSave = (jobId: string) => {
    trackJobSave(jobId, userId, true)
    // Handle save logic
  }

  const handleContact = (candidateId: string) => {
    trackCandidateContact(candidateId, userId)
    // Handle contact logic
  }

  if (userType === 'candidate') {
    return (
      <div className={`max-w-7xl mx-auto p-6 ${className}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your AI Job Matches
          </h1>
          <p className="text-gray-600">
            Jobs that match your skills and experience, powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Top Jobs For You</h2>
            <div className="space-y-4">
              {jobRecommendations.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleJobSelect(job)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedJob?.id === job.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <span className="text-lg font-bold text-blue-600">
                      {job.matchScore}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {typeof job.company === 'string' ? job.company : job.company?.companyName}
                  </p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApply(job.id)
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Apply
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSave(job.id)
                      }}
                      className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Details & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {selectedJob ? (
              <>
                <AIExplanation
                  matchScore={selectedJob.matchScore}
                  reasons={mockMatchReasons}
                />

                {/* AI Match Explanation Engine */}
                <AIMatchExplanationEngine
                  candidate={mockCandidateProfile}
                  job={mockJobDetails}
                  skillMatches={mockSkillData}
                  matchScore={selectedJob.matchScore}
                  reasons={mockMatchReasons}
                />

                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Skill Analysis</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">View:</span>
                    <select
                      value={comparisonMode}
                      onChange={(e) => setComparisonMode(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="overlay">Overlay Comparison</option>
                      <option value="side-by-side">Side-by-Side</option>
                      <option value="candidate-only">Your Skills Only</option>
                    </select>
                  </div>
                </div>

                <EnhancedSkillRadar
                  data={mockSkillData}
                  comparisonData={mockComparisonData}
                  mode={comparisonMode}
                  title={`Skill Comparison: ${comparisonMode === 'overlay' ? 'You vs Job vs Top Candidates' : comparisonMode === 'side-by-side' ? 'You vs Job Requirements' : 'Your Skills'}`}
                  showInsights={true}
                  insights={mockSkillInsights}
                  onSkillClick={(skill) => {
                    console.log('Skill clicked:', skill)
                    // Could open a modal with detailed skill information
                  }}
                  interactive={true}
                />

                <ProfileImprovement suggestions={mockSkillSuggestions} />
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a job to see detailed AI analysis
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Recruiter View
  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Top Candidates
        </h1>
        <p className="text-gray-600">
          Best matching candidates for your open positions, ranked by AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidate List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Best Matches</h2>
          <div className="space-y-4">
            {candidateRecommendations.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => handleCandidateSelect(candidate)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCandidate?.id === candidate.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                  <span className="text-lg font-bold text-green-600">
                    {candidate.matchScore}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{candidate.experience} Level</p>
                <p className="text-sm text-gray-500 mb-2">{candidate.location}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {candidate.topSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleContact(candidate.id)
                  }}
                  className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Contact Candidate
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Details & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCandidate ? (
            <>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">{selectedCandidate.name}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-medium">{selectedCandidate.experience}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{selectedCandidate.location}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Bio</p>
                  <p className="text-gray-700">{selectedCandidate.bio}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Top Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.topSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">Match Score</p>
                      <p className="text-sm text-green-700">
                        {selectedCandidate.skillMatchRatio}% skill alignment
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {selectedCandidate.matchScore}%
                    </span>
                  </div>
                </div>
              </div>

              <EnhancedSkillRadar
                data={mockSkillData.map(skill => ({
                  ...skill,
                  candidate: Math.floor(Math.random() * 10) + 1, // Mock candidate levels
                  job: skill.job
                }))}
                mode="overlay"
                title="Candidate Skills vs Job Requirements"
                showInsights={false}
                interactive={false}
              />

              {/* AI Conversational Assistant */}
              <ConversationalAIAssistant
                candidate={mockCandidateProfile}
                currentJob={selectedJob ? {
                  title: selectedJob.title,
                  company: typeof selectedJob.company === 'string' ? selectedJob.company : selectedJob.company.companyName,
                  requiredSkills: selectedJob.matchedSkills,
                  preferredSkills: selectedJob.missingSkills,
                  experience: 'Senior',
                  location: selectedJob.location
                } : undefined}
                skillMatches={mockSkillData}
                matchScore={selectedJob?.matchScore || 75}
                reasons={mockMatchReasons}
                onAction={(action, data) => {
                  console.log('AI Assistant Action:', action, data)
                  // Handle actions like updating profile, searching jobs, etc.
                }}
              />
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a candidate to see detailed analysis
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIMatchingDashboard