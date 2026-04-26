// workcrew-ui/components/RecruiterFeedback.tsx
'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Eye, UserX, CheckCircle, XCircle } from 'lucide-react';

interface RecruiterFeedbackProps {
  candidateId: string;
  jobId: string;
  candidateName: string;
  onFeedbackSubmitted?: (actionType: string) => void;
}

export function RecruiterFeedback({
  candidateId,
  jobId,
  candidateName,
  onFeedbackSubmitted
}: RecruiterFeedbackProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAction, setSubmittedAction] = useState<string | null>(null);

  const submitFeedback = async (actionType: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          jobId,
          actionType,
          metadata: {
            source: 'recruiter_ui',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmittedAction(actionType);
      onFeedbackSubmitted?.(actionType);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackOptions = [
    {
      type: 'VIEWED',
      label: 'Viewed Profile',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      description: 'I reviewed this candidate\'s profile',
    },
    {
      type: 'SHORTLISTED',
      label: 'Shortlisted',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      description: 'This candidate moves to the next round',
    },
    {
      type: 'REJECTED',
      label: 'Rejected',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
      description: 'This candidate is not a good fit',
    },
    {
      type: 'INTERVIEWED',
      label: 'Interviewed',
      icon: UserX,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      description: 'This candidate was interviewed',
    },
  ];

  if (submittedAction) {
    const submittedOption = feedbackOptions.find(opt => opt.type === submittedAction);
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Feedback Submitted</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          You marked {candidateName} as "{submittedOption?.label.toLowerCase()}".
          This helps improve our AI ranking system.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Provide feedback on {candidateName}
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Your feedback helps our AI learn what makes a great candidate match.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {feedbackOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.type}
              onClick={() => submitFeedback(option.type)}
              disabled={isSubmitting}
              className={`
                flex flex-col items-center p-3 rounded-lg border transition-all
                ${option.bgColor} ${option.color} border-gray-200
                hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
              `}
              title={option.description}
            >
              <Icon className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium text-center">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {isSubmitting && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
            Submitting feedback...
          </div>
        </div>
      )}
    </div>
  );
}

// Quick feedback buttons for candidate cards
export function QuickFeedbackButtons({
  candidateId,
  jobId,
  candidateName,
  compact = false
}: RecruiterFeedbackProps & { compact?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const submitQuickFeedback = async (actionType: string) => {
    setIsSubmitting(actionType);
    try {
      await fetch('/api/feedback/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          jobId,
          actionType,
          metadata: {
            source: 'quick_feedback',
            compact: true,
          },
        }),
      });
    } catch (error) {
      console.error('Quick feedback error:', error);
    } finally {
      setIsSubmitting(null);
    }
  };

  if (compact) {
    return (
      <div className="flex space-x-1">
        <button
          onClick={() => submitQuickFeedback('SHORTLISTED')}
          disabled={isSubmitting === 'SHORTLISTED'}
          className="p-1 text-green-600 hover:bg-green-50 rounded"
          title="Shortlist candidate"
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => submitQuickFeedback('REJECTED')}
          disabled={isSubmitting === 'REJECTED'}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
          title="Reject candidate"
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => submitQuickFeedback('SHORTLISTED')}
        disabled={isSubmitting === 'SHORTLISTED'}
        className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 disabled:opacity-50"
      >
        <ThumbsUp className="w-4 h-4" />
        <span className="text-sm">Good Fit</span>
      </button>
      <button
        onClick={() => submitQuickFeedback('REJECTED')}
        disabled={isSubmitting === 'REJECTED'}
        className="flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 disabled:opacity-50"
      >
        <ThumbsDown className="w-4 h-4" />
        <span className="text-sm">Not Interested</span>
      </button>
    </div>
  );
}