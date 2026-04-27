"use client";

import React from 'react';
import { EyeIcon, UserIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Card from '@/workcrew-ui/components/primitives/Card';
import Badge from '@/workcrew-ui/components/primitives/Badge';
import { Progress } from '@/workcrew-ui/components/primitives/Progress';

interface BehavioralSignals {
  faceVisible: boolean;
  faceVisiblePercentage: number;
  lookingAway: boolean;
  lookingAwayPercentage: number;
  multipleFaces: boolean;
  frameStability: number;
  lastFaceDetected: number;
}

interface BehavioralInsightsProps {
  signals: BehavioralSignals;
  interviewDuration: number; // in seconds
  className?: string;
}

export default function BehavioralInsights({
  signals,
  interviewDuration,
  className = ''
}: BehavioralInsightsProps) {
  // Calculate engagement score (0-100)
  const engagementScore = Math.round(
    (signals.faceVisiblePercentage * 0.4) +
    ((100 - signals.lookingAwayPercentage) * 0.4) +
    (signals.frameStability * 20 * 0.2)
  );

  // Calculate communication signals score
  const communicationScore = Math.round(
    signals.faceVisiblePercentage * 0.6 +
    (100 - signals.lookingAwayPercentage) * 0.4
  );

  // Get engagement level
  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'success' as const };
    if (score >= 60) return { level: 'Good', color: 'brand' as const };
    if (score >= 40) return { level: 'Fair', color: 'warning' as const };
    return { level: 'Poor', color: 'danger' as const };
  };

  const engagement = getEngagementLevel(engagementScore);

  // Format time since last face detection
  const timeSinceLastFace = signals.lastFaceDetected ?
    Math.floor((Date.now() - signals.lastFaceDetected) / 1000) : 0;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <EyeIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Behavioral Insights
        </h3>
        <Badge tone={engagement.color}>
          {engagement.level} Engagement
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Engagement Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Overall Engagement</span>
            <span className="text-lg font-bold text-gray-900">{engagementScore}%</span>
          </div>
          <Progress value={engagementScore} className="h-2" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Communication Signals</span>
            <span className="text-sm font-semibold text-gray-900">{communicationScore}%</span>
          </div>
          <Progress value={communicationScore} className="h-1" />
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Face Visibility</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {signals.faceVisiblePercentage.toFixed(1)}%
              </div>
              <div className={`text-xs ${signals.faceVisible ? 'text-green-600' : 'text-red-600'}`}>
                {signals.faceVisible ? 'Present' : 'Not detected'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Attention Focus</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {(100 - signals.lookingAwayPercentage).toFixed(1)}%
              </div>
              <div className={`text-xs ${!signals.lookingAway ? 'text-green-600' : 'text-orange-600'}`}>
                {signals.lookingAway ? 'Looking away' : 'Focused'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Frame Stability</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {(signals.frameStability * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {timeSinceLastFace > 10 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-700">Last Face Detected</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-orange-600">
                  {timeSinceLastFace}s ago
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warnings */}
      {signals.multipleFaces && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              Multiple faces detected in frame - ensure interview privacy
            </span>
          </div>
        </div>
      )}

      {signals.faceVisiblePercentage < 50 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <EyeIcon className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">
              Low face visibility may indicate engagement issues or technical problems
            </span>
          </div>
        </div>
      )}

      {/* Interview Duration Context */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Analysis based on {Math.floor(interviewDuration / 60)}:{(interviewDuration % 60).toString().padStart(2, '0')} of interview
        </div>
      </div>
    </Card>
  );
}