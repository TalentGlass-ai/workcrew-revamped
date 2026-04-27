"use client";

import React, { useState } from 'react';
import { ShieldCheckIcon, EyeIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import Button from '@/workcrew-ui/components/primitives/Button';
import Card from '@/workcrew-ui/components/primitives/Card';

interface PrivacyConsentProps {
  onConsent: (consented: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyConsent({ onConsent, isOpen, onClose }: PrivacyConsentProps) {
  const [hasRead, setHasRead] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (hasRead) {
      onConsent(true);
      onClose();
    }
  };

  const handleDecline = () => {
    onConsent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Privacy Consent for Video Interview
            </h2>
          </div>

          <div className="space-y-6 text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <VideoCameraIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Video and Audio Analysis
                  </h3>
                  <p className="text-sm text-blue-800">
                    This interview uses your camera and microphone to capture video and audio for analysis.
                    We use this data to evaluate your communication skills and interview performance.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <EyeIcon className="w-5 h-5" />
                What We Track
              </h3>
              <ul className="space-y-2 text-sm ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Face Presence:</strong> Whether your face is visible in the frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Attention Signals:</strong> Basic indicators of engagement (looking at camera)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Multiple Faces:</strong> Detection of additional people in frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Frame Stability:</strong> Video quality and stability metrics</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">
                What We DO NOT Track
              </h3>
              <ul className="space-y-1 text-sm text-red-800 ml-4">
                <li>❌ Facial expressions or emotions</li>
                <li>❌ Eye movement patterns beyond basic attention</li>
                <li>❌ Skin tone, age, or physical characteristics</li>
                <li>❌ Voice tone, accent, or speech patterns</li>
                <li>❌ Biometric data or personal identifiers</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Data Usage & Privacy
              </h3>
              <ul className="space-y-2 text-sm ml-4">
                <li>• Video data is processed in real-time and not stored permanently</li>
                <li>• Analysis results are aggregated for interview evaluation only</li>
                <li>• No video recordings are saved to disk</li>
                <li>• Behavioral signals are used to assess communication effectiveness</li>
                <li>• Data is deleted immediately after the interview session</li>
                <li>• We comply with privacy regulations and data protection laws</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Your Rights
              </h3>
              <ul className="space-y-2 text-sm ml-4">
                <li>• You can decline video analysis and continue with voice-only interview</li>
                <li>• You can stop video at any time during the interview</li>
                <li>• You have the right to request deletion of any stored data</li>
                <li>• Analysis is optional and does not affect your interview evaluation</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                id="privacy-read"
                checked={hasRead}
                onChange={(e) => setHasRead(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="privacy-read" className="text-sm text-gray-700">
                I have read and understood the privacy notice and consent to the use of video analysis for this interview.
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={handleDecline}
                tone="secondary"
                size="sm"
              >
                Decline Video Analysis
              </Button>
              <Button
                onClick={handleAccept}
                tone="primary"
                size="sm"
                disabled={!hasRead}
              >
                Accept & Continue
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}