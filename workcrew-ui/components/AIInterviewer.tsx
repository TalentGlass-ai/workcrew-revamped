'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/workcrew-ui/components/primitives/Button'
import { Textarea } from '@/workcrew-ui/components/primitives/Textarea'
import Card, { CardContent, CardHeader, CardTitle } from '@/workcrew-ui/components/primitives/Card'
import Badge from '@/workcrew-ui/components/primitives/Badge'
import { Progress } from '@/workcrew-ui/components/primitives/Progress'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

interface InterviewSession {
  sessionId: string
  codeAnalysis: {
    strengths: string[]
    weaknesses: string[]
    focusAreas: string[]
  }
  questions: Array<{
    id: string
    question: string
    type: string
    context?: string
  }>
  currentQuestionIndex: number
  totalQuestions: number
}

interface AnswerEvaluation {
  score: number
  depth: number
  clarity: number
  correctness: number
  followUpNeeded: boolean
  feedback: string
  strengths: string[]
  weaknesses: string[]
}

interface InterviewResponse {
  evaluation: AnswerEvaluation
  nextQuestion?: any
  isComplete: boolean
  finalEvaluation?: any
  progress: {
    current: number
    total: number
  }
}

export default function AIInterviewer({ candidateId }: { candidateId?: string }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [finalEvaluation, setFinalEvaluation] = useState<any>(null)
  const [conversation, setConversation] = useState<Array<{
    type: 'question' | 'answer' | 'evaluation'
    content: any
    timestamp: Date
  }>>([])

  const startInterview = async () => {
    if (!code.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, candidateId })
      })

      const data = await response.json()
      setSession(data)
      setConversation([{
        type: 'question',
        content: data.questions[0],
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Failed to start interview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!session || !currentAnswer.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          answer: currentAnswer
        })
      })

      const data: InterviewResponse = await response.json()

      // Add answer and evaluation to conversation
      setConversation(prev => [
        ...prev,
        {
          type: 'answer',
          content: currentAnswer,
          timestamp: new Date()
        },
        {
          type: 'evaluation',
          content: data.evaluation,
          timestamp: new Date()
        }
      ])

      setEvaluation(data.evaluation)
      setCurrentAnswer('')

      if (data.isComplete) {
        setIsComplete(true)
        setFinalEvaluation(data.finalEvaluation)
        if (session?.sessionId) router.push(`/ai-interviewer/${session.sessionId}`)
      } else if (data.nextQuestion) {
        setConversation(prev => [
          ...prev,
          {
            type: 'question',
            content: data.nextQuestion,
            timestamp: new Date()
          }
        ])
        setSession(prev => prev ? {
          ...prev,
          currentQuestionIndex: data.progress.current - 1
        } : null)
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'clarification': return 'bg-blue-100 text-blue-800'
      case 'edge_case': return 'bg-yellow-100 text-yellow-800'
      case 'optimization': return 'bg-green-100 text-green-800'
      case 'trade_off': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isComplete && finalEvaluation) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              Interview Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(finalEvaluation.communication)}`}>
                  {finalEvaluation.communication}/10
                </div>
                <div className="text-sm text-gray-600">Communication</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(finalEvaluation.problemSolving)}`}>
                  {finalEvaluation.problemSolving}/10
                </div>
                <div className="text-sm text-gray-600">Problem Solving</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(finalEvaluation.depthOfKnowledge)}`}>
                  {finalEvaluation.depthOfKnowledge}/10
                </div>
                <div className="text-sm text-gray-600">Technical Depth</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(finalEvaluation.confidence)}`}>
                  {finalEvaluation.confidence}/10
                </div>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Overall Assessment</h3>
              <p className="text-gray-700">{finalEvaluation.insight}</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Skill Analysis</h3>
              <div className="space-y-3">
                {finalEvaluation.skillSignals.map((skill: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{skill.name}</div>
                      <div className="text-sm text-gray-600">
                        {skill.evidence.join(' • ')}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(skill.score / 10)}`}>
                      {skill.score}/100
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {!session ? (
        <Card>
          <CardHeader>
            <CardTitle>AI Technical Interview</CardTitle>
            <p className="text-gray-600">
              Submit your code and engage in an interactive technical interview with our AI interviewer.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Programming Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Code</label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="min-h-64 font-mono text-sm"
              />
            </div>

            <Button
              onClick={startInterview}
              disabled={!code.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Analyzing Code...' : 'Start Interview'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Interview Progress</span>
                <span className="text-sm text-gray-600">
                  {session.currentQuestionIndex + 1} of {session.totalQuestions}
                </span>
              </div>
              <Progress
                value={(session.currentQuestionIndex + 1) / session.totalQuestions * 100}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Code Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Code Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                  <ul className="text-sm space-y-1">
                    {session.codeAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Areas for Discussion</h4>
                  <ul className="text-sm space-y-1">
                    {session.codeAnalysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <XCircleIcon className="w-4 h-4 text-red-600" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversation */}
          <div className="space-y-4">
            {conversation.map((item, index) => (
              <Card key={index} className={
                item.type === 'question' ? 'border-l-4 border-l-blue-500' :
                item.type === 'evaluation' ? 'border-l-4 border-l-green-500' :
                'border-l-4 border-l-gray-500'
              }>
                <CardContent className="pt-4">
                  {item.type === 'question' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600" />
                        <Badge className={getQuestionTypeColor(item.content.type)}>
                          {item.content.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-lg font-medium">{item.content.question}</p>
                      {item.content.context && (
                        <p className="text-sm text-gray-600">Context: {item.content.context}</p>
                      )}
                    </div>
                  )}

                  {item.type === 'answer' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">You</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">Your Answer</span>
                      </div>
                      <p className="text-gray-700">{item.content}</p>
                    </div>
                  )}

                  {item.type === 'evaluation' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">AI Feedback</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className={`font-bold ${getScoreColor(item.content.score)}`}>
                            {item.content.score}/10
                          </div>
                          <div className="text-gray-600">Overall</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold ${getScoreColor(item.content.depth)}`}>
                            {item.content.depth}/10
                          </div>
                          <div className="text-gray-600">Depth</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold ${getScoreColor(item.content.clarity)}`}>
                            {item.content.clarity}/10
                          </div>
                          <div className="text-gray-600">Clarity</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold ${getScoreColor(item.content.correctness)}`}>
                            {item.content.correctness}/10
                          </div>
                          <div className="text-gray-600">Correctness</div>
                        </div>
                      </div>

                      <p className="text-gray-700">{item.content.feedback}</p>

                      {item.content.strengths.length > 0 && (
                        <div>
                          <h5 className="font-medium text-green-700 mb-1">What was good:</h5>
                          <ul className="text-sm space-y-1">
                            {item.content.strengths.map((strength: string, i: number) => (
                              <li key={i} className="text-gray-700">• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.content.weaknesses.length > 0 && (
                        <div>
                          <h5 className="font-medium text-red-700 mb-1">Areas to improve:</h5>
                          <ul className="text-sm space-y-1">
                            {item.content.weaknesses.map((weakness: string, i: number) => (
                              <li key={i} className="text-gray-700">• {weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Answer Input */}
          {!isComplete && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium">Your Answer</label>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-32"
                  />
                  <Button
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim() || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Evaluating...' : 'Submit Answer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}