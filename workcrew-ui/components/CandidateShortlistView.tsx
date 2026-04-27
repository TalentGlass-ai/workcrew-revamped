'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/workcrew-ui/components/primitives/Card';
import Badge from '@/workcrew-ui/components/primitives/Badge';
import Button from '@/workcrew-ui/components/primitives/Button';
import { Progress } from '@/workcrew-ui/components/primitives/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/workcrew-ui/components/primitives/Tabs';
import { Alert, AlertDescription } from '@/workcrew-ui/components/primitives/Alert';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
  Code,
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';

interface DecisionResult {
  candidateId: string;
  jobId: string;
  fitScore: number;
  recommendation: 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'NOT_RECOMMENDED';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  breakdown: {
    profileSignals: number;
    assessmentSignals: number;
    codeIntelligence: number;
    interviewSignals: number;
    behaviorSignals: number;
    confidenceBoost: number;
  };
  signals: {
    skillsMatch: number;
    codingScore: number;
    communication: number;
    suspicionScore: number;
    attentionConsistency: number;
    [key: string]: number;
  };
  explanation: {
    strengths: string[];
    weaknesses: string[];
    summary: string;
    riskFactors: string[];
  };
  metadata: {
    processedAt: Date;
    signalCompleteness: number;
    confidenceFactors: string[];
  };
}

interface CandidateShortlistViewProps {
  jobId: string;
  onCandidateAction?: (candidateId: string, action: 'accept' | 'reject' | 'review') => void;
}

export function CandidateShortlistView({ jobId, onCandidateAction }: CandidateShortlistViewProps) {
  const [candidates, setCandidates] = useState<DecisionResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const handleCandidateAction = async (candidateId: string, action: 'accept' | 'reject' | 'review') => {
    try {
      // Map UI actions to feedback actions
      const feedbackAction = action === 'accept' ? 'accepted' :
                           action === 'reject' ? 'rejected' : 'shortlisted';

      const response = await fetch(`/api/jobs/${jobId}/candidates/${candidateId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: feedbackAction,
          confidence: 'medium', // Could be made configurable in UI
          notes: `Action taken via shortlist view: ${action}`,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // Refresh the rankings to reflect the feedback
        loadCandidates();
        // Could show a success toast here
      } else {
        console.error('Failed to record feedback');
        // Could show an error toast here
      }
    } catch (error) {
      console.error('Error recording feedback:', error);
      // Could show an error toast here
    }

    // Call the original callback if provided
    onCandidateAction?.(candidateId, action);
  };

  useEffect(() => {
    loadCandidates();
  }, [jobId]);

  const loadCandidates = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/decision-rankings`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      }
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONGLY_RECOMMENDED': return 'bg-green-100 text-green-800 border-green-200';
      case 'RECOMMENDED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NOT_RECOMMENDED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONGLY_RECOMMENDED': return <CheckCircle className="w-4 h-4" />;
      case 'RECOMMENDED': return <TrendingUp className="w-4 h-4" />;
      case 'NOT_RECOMMENDED': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Analyzing candidates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI-Powered Shortlist</h2>
          <p className="text-gray-600 mt-1">
            Multi-signal analysis with {candidates.length} candidates evaluated
          </p>
        </div>
        <Button onClick={loadCandidates} variant="outline">
          Refresh Rankings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Ranked Candidates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidates.map((candidate, index) => (
                <div
                  key={candidate.candidateId}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedCandidate?.candidateId === candidate.candidateId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      #{index + 1} Candidate
                    </span>
                    <Badge className={getRecommendationColor(candidate.recommendation)}>
                      {getRecommendationIcon(candidate.recommendation)}
                      <span className="ml-1 capitalize">
                        {candidate.recommendation.replace('_', ' ').toLowerCase()}
                      </span>
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fit Score</span>
                      <span className="font-semibold">{candidate.fitScore}/100</span>
                    </div>
                    <Progress value={candidate.fitScore} className="h-2" />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Confidence</span>
                      <span className={`font-medium ${getConfidenceColor(candidate.confidence)}`}>
                        {candidate.confidence}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {candidates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No candidates evaluated yet</p>
                  <p className="text-sm">Run the decision engine to see rankings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Candidate Details */}
        <div className="lg:col-span-2">
          {selectedCandidate ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="signals">Signals</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Candidate Overview</span>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRecommendationColor(selectedCandidate.recommendation)}>
                          {getRecommendationIcon(selectedCandidate.recommendation)}
                          <span className="ml-1 capitalize">
                            {selectedCandidate.recommendation.replace('_', ' ').toLowerCase()}
                          </span>
                        </Badge>
                        <Badge tone="success" soft={false} className={getConfidenceColor(selectedCandidate.confidence)}>
                          {selectedCandidate.confidence} Confidence
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Fit Score</h4>
                        <div className="text-3xl font-bold text-blue-600">
                          {selectedCandidate.fitScore}/100
                        </div>
                        <Progress value={selectedCandidate.fitScore} className="mt-2" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Signal Completeness</h4>
                        <div className="text-3xl font-bold text-green-600">
                          {selectedCandidate.metadata.signalCompleteness.toFixed(0)}%
                        </div>
                        <Progress value={selectedCandidate.metadata.signalCompleteness} className="mt-2" />
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {selectedCandidate.explanation.summary}
                      </AlertDescription>
                    </Alert>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Score Breakdown</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              Profile Signals
                            </span>
                            <span className="font-medium">
                              {selectedCandidate.breakdown.profileSignals.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center">
                              <Code className="w-4 h-4 mr-1" />
                              Assessment Signals
                            </span>
                            <span className="font-medium">
                              {selectedCandidate.breakdown.assessmentSignals.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              Code Intelligence
                            </span>
                            <span className="font-medium">
                              {selectedCandidate.breakdown.codeIntelligence.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Interview Signals
                            </span>
                            <span className="font-medium">
                              {selectedCandidate.breakdown.interviewSignals.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Behavior Signals
                            </span>
                            <span className="font-medium">
                              {selectedCandidate.breakdown.behaviorSignals.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              Confidence Boost
                            </span>
                            <span className="font-medium">
                              {selectedCandidate.breakdown.confidenceBoost.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="signals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Raw Signal Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Skills Match</span>
                          <span className="font-medium">{selectedCandidate.signals.skillsMatch.toFixed(1)}/100</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Coding Score</span>
                          <span className="font-medium">{selectedCandidate.signals.codingScore.toFixed(1)}/100</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Communication</span>
                          <span className="font-medium">{selectedCandidate.signals.communication.toFixed(1)}/100</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Suspicion Score</span>
                          <span className="font-medium">{selectedCandidate.signals.suspicionScore.toFixed(1)}/100</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Attention Consistency</span>
                          <span className="font-medium">{selectedCandidate.signals.attentionConsistency.toFixed(1)}/100</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Experience Relevance</span>
                          <span className="font-medium">{(selectedCandidate.signals as any).experienceRelevance?.toFixed(1) || 'N/A'}/100</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-700 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedCandidate.explanation.strengths.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedCandidate.explanation.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No significant strengths identified</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-700 flex items-center">
                        <XCircle className="w-5 h-5 mr-2" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedCandidate.explanation.weaknesses.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedCandidate.explanation.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start">
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-sm">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No significant weaknesses identified</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {selectedCandidate.explanation.riskFactors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-yellow-700 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Risk Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedCandidate.explanation.riskFactors.map((risk, index) => (
                          <li key={index} className="flex items-start">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recruiter Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleCandidateAction(selectedCandidate.candidateId, 'accept')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Accept Candidate
                      </Button>
                      <Button
                        onClick={() => handleCandidateAction(selectedCandidate.candidateId, 'reject')}
                        tone="danger"
                        className="flex-1"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Reject Candidate
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleCandidateAction(selectedCandidate.candidateId, 'review')}
                      variant="outline"
                      className="w-full"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Request Additional Review
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Candidate
                  </h3>
                  <p className="text-gray-600">
                    Choose a candidate from the list to view detailed analysis and signals
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}