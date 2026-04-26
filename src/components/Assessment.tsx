'use client';

import { useState, useEffect, useRef } from 'react';

interface Question {
  id: string;
  questionText: string;
  options?: string[];
  questionType: string;
}

interface Assessment {
  id: string;
  candidateId: string;
  questions: Question[];
}

export default function Assessment({ assessmentId }: { assessmentId: string }) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lastKeyTime = useRef<number>(0);
  const keyCount = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/assessments?id=${assessmentId}`)
      .then(res => res.json())
      .then(data => {
        setAssessment(data);
        setLoading(false);
        // Request fullscreen after assessment loads
        requestFullscreen();
        setupProctoringListeners(data.candidateId);
      })
      .catch(error => {
        console.error('Error fetching assessment:', error);
        setLoading(false);
      });
  }, [assessmentId]);

  const requestFullscreen = async () => {
    try {
      if (containerRef.current && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        logProctoringEvent('fullscreen_entered');
      }
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
    }
  };

  const setupProctoringListeners = (candidateId: string) => {
    // Prevent right-click context menu
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      logProctoringEvent('right_click', { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY });
    };

    // Detect tab visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logProctoringEvent('tab_switch', { hidden: true });
      }
    };

    // Detect fullscreen exit attempts
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        logProctoringEvent('fullscreen_exit');
        // Re-request fullscreen
        setTimeout(() => requestFullscreen(), 1000);
      } else {
        setIsFullscreen(true);
      }
    };

    // Monitor keystrokes for rapid typing detection
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      keyCount.current++;

      if (now - lastKeyTime.current < 100) { // Within 100ms
        if (keyCount.current > 5) { // More than 5 keys rapidly
          logProctoringEvent('rapid_keystrokes', { rate: keyCount.current / ((now - lastKeyTime.current) / 1000) });
          keyCount.current = 0;
        }
      } else {
        keyCount.current = 1;
      }

      lastKeyTime.current = now;

      // Detect copy/paste attempts
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
        logProctoringEvent(e.key === 'c' ? 'copy_attempt' : 'paste_attempt');
      }
    };

    // Monitor mouse movements for unusual patterns
    let lastMouseMove = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMove < 10) { // Very rapid mouse movements
        logProctoringEvent('rapid_mouse_movement', { x: e.clientX, y: e.clientY });
      }
      lastMouseMove = now;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  };

  const logProctoringEvent = async (eventType: string, details?: any) => {
    if (!assessment) return;

    try {
      await fetch('/api/proctoring/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          candidateId: assessment.candidateId,
          eventType,
          details,
        }),
      });
    } catch (error) {
      console.error('Error logging proctoring event:', error);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitCurrentAnswer = async () => {
    if (!assessment) return;

    const question = assessment.questions[currentQuestionIndex];
    const answer = answers[question.id];

    if (!answer) {
      alert('Please select an answer');
      return;
    }

    try {
      await fetch('/api/assessments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: assessmentId,
          answers: [{ questionId: question.id, answerText: answer }]
        })
      });

      if (currentQuestionIndex < assessment.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error submitting answer');
    }
  };

  if (loading) return <div className="p-4">Loading assessment...</div>;
  if (!assessment) return <div className="p-4">Assessment not found</div>;
  if (submitted) return <div className="p-4">Assessment completed! Thank you for participating.</div>;

  const question = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Assessment</h1>
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {assessment.questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{question.questionText}</h2>

        {question.options && question.options.length > 0 ? (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            className="w-full p-3 border rounded-lg"
            placeholder="Enter your answer..."
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
          />
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={submitCurrentAnswer}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {currentQuestionIndex === assessment.questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}