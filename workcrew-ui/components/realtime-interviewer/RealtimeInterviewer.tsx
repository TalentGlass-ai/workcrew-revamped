"use client";

import React, { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/workcrew-ui/components/primitives/Card';
import Button from '@/workcrew-ui/components/primitives/Button';
import { Textarea } from '@/workcrew-ui/components/primitives/Textarea';
import Badge from '@/workcrew-ui/components/primitives/Badge';
import { Progress } from '@/workcrew-ui/components/primitives/Progress';
import { CheckCircleIcon, XCircleIcon, ClockIcon, MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useRealtimeInterview } from './useRealtimeInterview';

export default function RealtimeInterviewer() {
  const [currentAnswer, setCurrentAnswer] = useState('');

  const {
    messages,
    interviewState,
    isLoading,
    isRecording,
    isPlaying,
    startInterview,
    submitAnswer,
    startRecording,
    stopRecording,
    endInterview
  } = useRealtimeInterview();

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    await submitAnswer(currentAnswer);
    setCurrentAnswer('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Real-Time AI Interviewer
          </h1>
          <p className="text-lg text-gray-600">
            Experience a live technical interview with voice interaction
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Interview Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <MicrophoneIcon className="w-5 h-5" />
                  Interview Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!interviewState?.isActive ? (
                  <div className="text-center py-8">
                    <Button
                      onClick={startInterview}
                      disabled={isLoading}
                      className="px-8 py-3"
                    >
                      {isLoading ? 'Starting Interview...' : 'Start Voice Interview'}
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Click to begin your real-time AI interview
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Audio Controls */}
                    <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        tone={isRecording ? "danger" : "primary"}
                        className="flex items-center gap-2"
                      >
                        <MicrophoneIcon className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </Button>

                      {isPlaying && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <SpeakerWaveIcon className="w-4 h-4 animate-pulse" />
                          AI Speaking...
                        </div>
                      )}

                      <Button
                        onClick={endInterview}
                        tone="neutral"
                        className="flex items-center gap-2"
                      >
                        End Interview
                      </Button>
                    </div>

                    {/* Text Input Fallback */}
                    <div className="space-y-2">
                      <Textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your answer here (or use voice)..."
                        className="min-h-24"
                      />
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={!currentAnswer.trim() || isLoading}
                        className="w-full"
                      >
                        {isLoading ? 'Submitting...' : 'Submit Answer'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Start an interview to begin the conversation
                    </p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.type === 'question'
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : message.type === 'answer'
                            ? 'bg-green-50 border-l-4 border-green-500'
                            : message.type === 'evaluation'
                            ? 'bg-yellow-50 border-l-4 border-yellow-500'
                            : 'bg-gray-50 border-l-4 border-gray-500'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.type === 'question' && <MicrophoneIcon className="w-4 h-4 text-blue-600 mt-0.5" />}
                          {message.type === 'answer' && <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5" />}
                          {message.type === 'evaluation' && <ClockIcon className="w-4 h-4 text-yellow-600 mt-0.5" />}
                          {message.type === 'system' && <XCircleIcon className="w-4 h-4 text-gray-600 mt-0.5" />}

                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {message.type === 'question' ? 'AI Interviewer' :
                               message.type === 'answer' ? 'Your Answer' :
                               message.type === 'evaluation' ? 'Evaluation' : 'System'}
                            </p>
                            <p className="text-gray-700">{message.content}</p>

                            {message.evaluation && (
                              <div className="mt-2 space-y-1">
                                <div className="flex gap-2 text-xs">
                                  <Badge tone="neutral">Score: {message.evaluation.score}/10</Badge>
                                  <Badge tone="neutral">Clarity: {message.evaluation.clarity}/10</Badge>
                                  <Badge tone="neutral">Depth: {message.evaluation.depth}/10</Badge>
                                </div>
                                <p className="text-xs text-gray-600">{message.evaluation.feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Interview Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {interviewState ? (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Communication</span>
                        <span>{interviewState.scores.communication}/10</span>
                      </div>
                      <Progress value={interviewState.scores.communication * 10} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Problem Solving</span>
                        <span>{interviewState.scores.problemSolving}/10</span>
                      </div>
                      <Progress value={interviewState.scores.problemSolving * 10} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Depth</span>
                        <span>{interviewState.scores.depth}/10</span>
                      </div>
                      <Progress value={interviewState.scores.depth * 10} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Confidence</span>
                        <span>{interviewState.scores.confidence}/10</span>
                      </div>
                      <Progress value={interviewState.scores.confidence * 10} />
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Start an interview to see progress
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Focus Areas</CardTitle>
              </CardHeader>
              <CardContent>
                {interviewState?.focusAreas.length ? (
                  <div className="flex flex-wrap gap-2">
                    {interviewState.focusAreas.map((area, index) => (
                      <Badge key={index} tone="neutral">
                        {area.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Areas will appear as interview progresses
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Questions:</span>
                  <span className="text-sm font-medium">{interviewState?.previousAnswers.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Depth Level:</span>
                  <span className="text-sm font-medium">{interviewState?.depthLevel || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge tone={interviewState?.isActive ? "success" : "neutral"}>
                    {interviewState?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}