'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserIcon,
  CpuChipIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import type { CandidateProfile, JobDetails, SkillMatch, MatchReason } from '../types'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  actions?: Array<{
    label: string
    action: string
    data?: any
  }>
}

interface ConversationalAIAssistantProps {
  candidate: CandidateProfile
  currentJob?: JobDetails
  skillMatches?: SkillMatch[]
  matchScore?: number
  reasons?: MatchReason[]
  onAction?: (action: string, data?: any) => void
  className?: string
}

const ConversationalAIAssistant: React.FC<ConversationalAIAssistantProps> = ({
  candidate,
  currentJob,
  skillMatches = [],
  matchScore,
  reasons = [],
  onAction,
  className = ""
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: `Hi ${candidate.name}! I'm your AI hiring assistant. I can help you understand your job matches, improve your profile, and find better opportunities. What would you like to know?`,
      timestamp: new Date(),
      suggestions: [
        "Why is my match score low?",
        "How can I improve my profile?",
        "Suggest better jobs for me",
        "What skills should I learn next?"
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // AI Response Generator
  const generateResponse = async (userMessage: string): Promise<Message> => {
    const message = userMessage.toLowerCase()

    // Analyze user intent
    if (message.includes('match') && (message.includes('low') || message.includes('why') || message.includes('score'))) {
      return generateMatchAnalysis()
    }

    if (message.includes('improve') || message.includes('profile') || message.includes('better')) {
      return generateImprovementSuggestions()
    }

    if (message.includes('job') && (message.includes('suggest') || message.includes('better') || message.includes('find'))) {
      return generateJobSuggestions()
    }

    if (message.includes('skill') && (message.includes('learn') || message.includes('next') || message.includes('develop'))) {
      return generateSkillDevelopmentPlan()
    }

    if (message.includes('interview') || message.includes('prepare')) {
      return generateInterviewPreparation()
    }

    if (message.includes('salary') || message.includes('pay') || message.includes('compensation')) {
      return generateSalaryInsights()
    }

    // Default conversational response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `I'd be happy to help you with that! Based on your profile as a ${candidate.experience} developer with expertise in ${candidate.topSkills.slice(0, 3).join(', ')}, I can provide insights about job matching, skill development, or career opportunities. What specific aspect would you like to explore?`,
      timestamp: new Date(),
      suggestions: [
        "Analyze my current match",
        "Suggest skill improvements",
        "Find better job opportunities",
        "Prepare for interviews"
      ]
    }
  }

  const generateMatchAnalysis = (): Message => {
    if (!currentJob || !matchScore) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I don't see a specific job selected. Could you tell me which job you're interested in, and I'll analyze your match potential?",
        timestamp: new Date()
      }
    }

    const strongMatches = skillMatches.filter(s => s.candidate >= s.job)
    const skillGaps = skillMatches.filter(s => s.job - s.candidate >= 2)

    let analysis = `Let me analyze your fit for the **${currentJob.title}** position at **${currentJob.company}**:\n\n`

    analysis += `📊 **Overall Match: ${matchScore}%**\n\n`

    if (strongMatches.length > 0) {
      analysis += `✅ **Your Strengths:**\n`
      strongMatches.slice(0, 3).forEach(skill => {
        analysis += `• ${skill.skill}: You score ${skill.candidate}/10 vs required ${skill.job}/10\n`
      })
      analysis += `\n`
    }

    if (skillGaps.length > 0) {
      analysis += `⚠️ **Areas for Improvement:**\n`
      skillGaps.slice(0, 3).forEach(skill => {
        const gap = skill.job - skill.candidate
        analysis += `• ${skill.skill}: Need ${gap} more point${gap > 1 ? 's' : ''} (you: ${skill.candidate}/10, required: ${skill.job}/10)\n`
      })
      analysis += `\n`
    }

    analysis += `💡 **My Recommendation:** ${matchScore >= 80 ? 'Strong candidate - apply now!' : matchScore >= 60 ? 'Good potential with some development' : 'Consider building required skills first'}`

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: analysis,
      timestamp: new Date(),
      actions: [
        {
          label: 'View Detailed Analysis',
          action: 'view_detailed_match',
          data: { job: currentJob, matches: skillMatches }
        },
        {
          label: 'Find Similar Jobs',
          action: 'find_similar_jobs',
          data: { skills: candidate.topSkills }
        }
      ]
    }
  }

  const generateImprovementSuggestions = (): Message => {
    const skillGaps = skillMatches.filter(s => s.job - s.candidate >= 2)
    const lowSkills = skillMatches.filter(s => s.candidate <= 5)

    let suggestions = `Here are personalized suggestions to improve your profile and increase match scores:\n\n`

    suggestions += `🎯 **Immediate Actions:**\n`
    suggestions += `1. **Complete your skill assessments** - Add proficiency levels for all technologies you know\n`
    suggestions += `2. **Add evidence** - Link GitHub repos, certifications, or project examples\n`
    suggestions += `3. **Update experience details** - Be specific about your accomplishments\n\n`

    if (skillGaps.length > 0) {
      suggestions += `📈 **Skill Development Priority:**\n`
      skillGaps.slice(0, 3).forEach((skill, index) => {
        const gap = skill.job - skill.candidate
        suggestions += `${index + 1}. **${skill.skill}** - Could increase matches by ~${gap * 3}%\n`
        suggestions += `   • Start with: Online courses, documentation, small projects\n`
        suggestions += `   • Timeline: ${gap <= 2 ? '2-4 weeks' : gap <= 4 ? '1-2 months' : '2-3 months'}\n\n`
      })
    }

    suggestions += `🚀 **Quick Wins:**\n`
    suggestions += `• Add ${candidate.topSkills.length < 5 ? 'more skills' : 'skill evidence'} to your profile\n`
    suggestions += `• Complete your professional summary\n`
    suggestions += `• Add specific achievements and metrics\n\n`

    suggestions += `💪 **Expected Impact:** Following these suggestions could increase your average match score by 15-25%.`

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: suggestions,
      timestamp: new Date(),
      actions: [
        {
          label: 'Update Profile Now',
          action: 'update_profile',
          data: { section: 'skills' }
        },
        {
          label: 'View Learning Resources',
          action: 'view_learning_resources',
          data: { skills: skillGaps.map(s => s.skill) }
        }
      ]
    }
  }

  const generateJobSuggestions = (): Message => {
    const topSkills = candidate.topSkills.slice(0, 5)
    const experienceLevel = candidate.experience

    let suggestions = `Based on your profile as a ${experienceLevel} developer with expertise in ${topSkills.join(', ')}, here are job opportunities that would be a great fit:\n\n`

    // Generate job suggestions based on skills
    const jobSuggestions = []

    if (topSkills.includes('React')) {
      jobSuggestions.push({
        title: 'Senior React Developer',
        company: 'Tech Innovators',
        match: 88,
        reason: 'Your React expertise is highly valued'
      })
    }

    if (topSkills.includes('Node.js')) {
      jobSuggestions.push({
        title: 'Full-Stack Developer',
        company: 'StartupXYZ',
        match: 82,
        reason: 'Strong backend and frontend combination'
      })
    }

    if (topSkills.includes('Python')) {
      jobSuggestions.push({
        title: 'Backend Developer',
        company: 'DataTech Corp',
        match: 85,
        reason: 'Python skills align with data-focused roles'
      })
    }

    if (topSkills.includes('AWS') || topSkills.includes('Docker')) {
      jobSuggestions.push({
        title: 'DevOps Engineer',
        company: 'CloudFirst Inc',
        match: 78,
        reason: 'Infrastructure skills are in high demand'
      })
    }

    // Add general suggestions
    if (jobSuggestions.length === 0) {
      jobSuggestions.push(
        {
          title: 'Software Engineer',
          company: 'Innovative Solutions',
          match: 75,
          reason: 'General development skills match well'
        },
        {
          title: 'Frontend Developer',
          company: 'UI Masters',
          match: 72,
          reason: 'Web development opportunities'
        }
      )
    }

    jobSuggestions.forEach((job, index) => {
      suggestions += `${index + 1}. **${job.title}** at ${job.company}\n`
      suggestions += `   • Match Score: ${job.match}%\n`
      suggestions += `   • Why it fits: ${job.reason}\n\n`
    })

    suggestions += `💡 **Pro Tip:** Focus on roles that leverage your strongest skills (${topSkills.slice(0, 2).join(' & ')}) for the highest success rate.`

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: suggestions,
      timestamp: new Date(),
      actions: [
        {
          label: 'Search These Jobs',
          action: 'search_jobs',
          data: { skills: topSkills, experience: experienceLevel }
        },
        {
          label: 'Refine My Preferences',
          action: 'update_job_preferences',
          data: {}
        }
      ]
    }
  }

  const generateSkillDevelopmentPlan = (): Message => {
    const currentSkills = skillMatches.filter(s => s.candidate > 0)
    const missingSkills = skillMatches.filter(s => s.candidate === 0)
    const weakSkills = skillMatches.filter(s => s.candidate > 0 && s.candidate < 6)

    let plan = `Here's a personalized skill development plan based on your current profile:\n\n`

    plan += `📊 **Your Current Skill Level:** ${currentSkills.length} skills assessed\n\n`

    if (weakSkills.length > 0) {
      plan += `🔧 **Skills to Strengthen (High Impact):**\n`
      weakSkills.slice(0, 3).forEach(skill => {
        plan += `• **${skill.skill}** (Current: ${skill.candidate}/10)\n`
        plan += `  → Target: ${Math.min(10, skill.candidate + 2)}/10\n`
        plan += `  → Resources: Official docs, Udemy courses, small projects\n\n`
      })
    }

    if (missingSkills.length > 0) {
      plan += `🆕 **Skills to Learn (Future Growth):**\n`
      missingSkills.slice(0, 3).forEach(skill => {
        plan += `• **${skill.skill}**\n`
        plan += `  → Priority: ${skill.job >= 8 ? 'High' : skill.job >= 6 ? 'Medium' : 'Low'}\n`
        plan += `  → Start with: Tutorials, documentation, beginner projects\n\n`
      })
    }

    plan += `📚 **Learning Strategy:**\n`
    plan += `1. **Focus on one skill at a time** - Deep learning beats shallow knowledge\n`
    plan += `2. **Build projects** - Apply new skills in real scenarios\n`
    plan += `3. **Join communities** - Stack Overflow, Reddit, LinkedIn groups\n`
    plan += `4. **Set measurable goals** - "Complete 3 projects using this skill"\n\n`

    plan += `⏰ **Timeline:** 3-6 months of consistent learning could increase your match scores by 20-30%.`

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: plan,
      timestamp: new Date(),
      actions: [
        {
          label: 'Create Learning Plan',
          action: 'create_learning_plan',
          data: { skills: weakSkills.concat(missingSkills.slice(0, 2)) }
        },
        {
          label: 'Find Courses',
          action: 'find_courses',
          data: { skills: weakSkills.map(s => s.skill) }
        }
      ]
    }
  }

  const generateInterviewPreparation = (): Message => {
    if (!currentJob) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I'd love to help you prepare for interviews! Which specific job or role are you targeting? I can provide tailored interview questions and preparation strategies.",
        timestamp: new Date()
      }
    }

    let preparation = `Let's prepare you for **${currentJob.title}** interviews at **${currentJob.company}**:\n\n`

    preparation += `🎯 **Key Interview Topics:**\n\n`

    // Technical questions based on required skills
    preparation += `**Technical Skills:**\n`
    currentJob.requiredSkills.slice(0, 3).forEach(skill => {
      const skillMatch = skillMatches.find(s => s.skill === skill)
      const level = skillMatch ? skillMatch.candidate : 5
      preparation += `• ${skill}: Prepare ${level >= 8 ? 'advanced' : level >= 6 ? 'intermediate' : 'fundamental'} questions\n`
    })

    preparation += `\n**Behavioral Questions:**\n`
    preparation += `• "Tell me about a challenging project and how you overcame obstacles"\n`
    preparation += `• "How do you handle tight deadlines and changing requirements?"\n`
    preparation += `• "Describe a time you learned a new technology quickly"\n\n`

    preparation += `📝 **Preparation Strategy:**\n`
    preparation += `1. **Review your experience** - Prepare 2-3 detailed project examples\n`
    preparation += `2. **Practice coding problems** - Focus on ${currentJob.requiredSkills[0]} specifically\n`
    preparation += `3. **Research the company** - Understand ${currentJob.company}'s products and culture\n`
    preparation += `4. **Prepare questions for them** - Show genuine interest\n\n`

    preparation += `💪 **Your Strengths to Highlight:**\n`
    const strengths = skillMatches.filter(s => s.candidate >= s.job)
    strengths.slice(0, 2).forEach(skill => {
      preparation += `• Your expertise in ${skill.skill} (rated ${skill.candidate}/10)\n`
    })

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: preparation,
      timestamp: new Date(),
      actions: [
        {
          label: 'Practice Interview',
          action: 'start_mock_interview',
          data: { job: currentJob, skills: currentJob.requiredSkills }
        },
        {
          label: 'View Sample Questions',
          action: 'view_interview_questions',
          data: { job: currentJob }
        }
      ]
    }
  }

  const generateSalaryInsights = (): Message => {
    const experienceLevel = candidate.experience
    const topSkills = candidate.topSkills.slice(0, 3)

    let insights = `Here's what you can expect salary-wise based on your ${experienceLevel} experience and skills in ${topSkills.join(', ')}:\n\n`

    // Salary ranges based on experience and skills
    let baseSalary = 0
    let bonus = 0

    if (experienceLevel === 'Senior') {
      baseSalary = 120000
      bonus = 20000
    } else if (experienceLevel === 'Mid-level') {
      baseSalary = 85000
      bonus = 15000
    } else {
      baseSalary = 65000
      bonus = 10000
    }

    // Adjust based on skills
    if (topSkills.includes('React') || topSkills.includes('TypeScript')) {
      baseSalary += 10000
    }
    if (topSkills.includes('AWS') || topSkills.includes('Docker')) {
      baseSalary += 8000
    }
    if (topSkills.includes('Python')) {
      baseSalary += 12000
    }

    insights += `💰 **Salary Range:** $${(baseSalary - 15000).toLocaleString()} - $${(baseSalary + bonus).toLocaleString()}\n\n`

    insights += `📊 **Breakdown:**\n`
    insights += `• Base Salary: $${baseSalary.toLocaleString()}\n`
    insights += `• Annual Bonus: $${bonus.toLocaleString()}\n`
    insights += `• Total Compensation: $${(baseSalary + bonus).toLocaleString()}\n\n`

    insights += `📍 **Location Impact:**\n`
    if (candidate.location) {
      if (candidate.location.includes('San Francisco') || candidate.location.includes('New York')) {
        insights += `• ${candidate.location}: +15-25% higher than national average\n`
      } else if (candidate.location.includes('Austin') || candidate.location.includes('Seattle')) {
        insights += `• ${candidate.location}: +5-15% higher than national average\n`
      } else {
        insights += `• ${candidate.location}: At or near national average\n`
      }
    }

    insights += `\n🚀 **Negotiation Tips:**\n`
    insights += `• Highlight your ${topSkills[0]} expertise\n`
    insights += `• Mention specific project achievements\n`
    insights += `• Research company-specific compensation data\n`
    insights += `• Consider total compensation, not just base salary\n\n`

    insights += `💡 **Pro Tip:** Your unique combination of skills could justify asking for the higher end of this range.`

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: insights,
      timestamp: new Date(),
      actions: [
        {
          label: 'View Salary Research',
          action: 'view_salary_data',
          data: { skills: topSkills, experience: experienceLevel, location: candidate.location }
        },
        {
          label: 'Update Salary Expectations',
          action: 'update_salary_preferences',
          data: {}
        }
      ]
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(async () => {
      const response = await generateResponse(input)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // 1-3 second delay
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleActionClick = (action: string, data?: any) => {
    if (onAction) {
      onAction(action, data)
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <CpuChipIcon className="h-6 w-6 text-white mr-2" />
          <div>
            <h3 className="text-white font-semibold">AI Assistant</h3>
            <p className="text-blue-100 text-sm">Your hiring intelligence companion</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white hover:bg-white/20 p-1 rounded transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.type === 'user' ? (
                  <UserIcon className="h-4 w-4 mr-1" />
                ) : (
                  <SparklesIcon className="h-4 w-4 mr-1" />
                )}
                <span className="text-xs font-medium">
                  {message.type === 'user' ? 'You' : 'AI Assistant'}
                </span>
              </div>
              <div
                className="text-sm whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }}
              />
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action.action, action.data)}
                      className="w-full text-left px-3 py-2 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <SparklesIcon className="h-4 w-4 mr-2 animate-pulse" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages[messages.length - 1]?.suggestions && !isTyping && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your job search..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConversationalAIAssistant