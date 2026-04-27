"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface InterviewMessage {
  id: string;
  type: 'question' | 'answer' | 'evaluation' | 'system';
  content: string;
  timestamp: Date;
  evaluation?: {
    score: number;
    clarity: number;
    depth: number;
    correctness: number;
    feedback: string;
  };
}

interface InterviewState {
  sessionId: string;
  currentQuestion: string;
  previousAnswers: string[];
  depthLevel: number;
  focusAreas: string[];
  scores: {
    communication: number;
    problemSolving: number;
    depth: number;
    confidence: number;
  };
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

interface BehavioralSignals {
  faceVisible: boolean;
  faceVisiblePercentage: number;
  lookingAway: boolean;
  lookingAwayPercentage: number;
  multipleFaces: boolean;
  frameStability: number;
  lastFaceDetected: number;
}

interface UseRealtimeInterviewReturn {
  messages: InterviewMessage[];
  interviewState: InterviewState | null;
  isLoading: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  startInterview: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  sendAudioData: (audioBlob: Blob) => Promise<void>;
  sendBehavioralSignals: (signals: BehavioralSignals) => void;
  endInterview: () => void;
}

export function useRealtimeInterview(): UseRealtimeInterviewReturn {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket('ws://localhost:3001/interview');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        wsRef.current = null;

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connectWebSocket();
          }, 2000 * reconnectAttemptsRef.current); // Exponential backoff
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, []);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'interview_started':
        setInterviewState(data.state);
        addMessage('question', data.question);
        break;
      case 'evaluation':
        addMessage('evaluation', data.feedback, data.evaluation);
        break;
      case 'next_question':
        addMessage('question', data.question);
        setInterviewState(prev => prev ? { ...prev, currentQuestion: data.question } : null);
        break;
      case 'interview_complete':
        addMessage('system', 'Interview completed! Generating final evaluation...');
        setInterviewState(prev => prev ? { ...prev, isActive: false } : null);
        break;
      case 'final_evaluation':
        addMessage('system', `Final Evaluation: ${data.summary}`, undefined, true);
        setInterviewState(prev => prev ? {
          ...prev,
          scores: {
            communication: data.communication || prev.scores.communication,
            problemSolving: data.problemSolving || prev.scores.problemSolving,
            depth: data.depth || prev.scores.depth,
            confidence: data.confidence || prev.scores.confidence
          }
        } : null);
        break;
      case 'audio_response':
        playAudioResponse(data.audioData);
        break;
      case 'error':
        addMessage('system', `Error: ${data.message}`);
        break;
    }
  }, []);

  const addMessage = useCallback((type: InterviewMessage['type'], content: string, evaluation?: any, isFinal = false) => {
    const message: InterviewMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      evaluation
    };
    setMessages(prev => [...prev, message]);

    if (isFinal && evaluation) {
      // Update final scores
      setInterviewState(prev => prev ? {
        ...prev,
        scores: {
          communication: evaluation.communication || prev.scores.communication,
          problemSolving: evaluation.problemSolving || prev.scores.problemSolving,
          depth: evaluation.depth || prev.scores.depth,
          confidence: evaluation.confidence || prev.scores.confidence
        }
      } : null);
    }
  }, []);

  const playAudioResponse = useCallback(async (audioData: ArrayBuffer) => {
    try {
      setIsPlaying(true);
      setInterviewState(prev => prev ? { ...prev, isSpeaking: true } : null);

      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsPlaying(false);
        setInterviewState(prev => prev ? { ...prev, isSpeaking: false } : null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setInterviewState(prev => prev ? { ...prev, isSpeaking: false } : null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
      setInterviewState(prev => prev ? { ...prev, isSpeaking: false } : null);
    }
  }, []);

  // Initialize WebSocket connection on mount
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const startInterview = useCallback(async () => {
    setIsLoading(true);
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'start_interview',
          language: 'javascript',
          mode: 'voice'
        }));
      } else {
        // Fallback to HTTP API
        const response = await fetch('/api/realtime-interview/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: 'javascript',
            mode: 'voice'
          })
        });

        const data = await response.json();
        if (data.sessionId) {
          setInterviewState({
            sessionId: data.sessionId,
            currentQuestion: '',
            previousAnswers: [],
            depthLevel: 1,
            focusAreas: [],
            scores: { communication: 0, problemSolving: 0, depth: 0, confidence: 0 },
            isActive: true,
            isListening: false,
            isSpeaking: false
          });
          addMessage('question', data.firstQuestion);
        }
      }
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!answer.trim() || !interviewState) return;

    setIsLoading(true);
    addMessage('answer', answer);

    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'text_answer',
          sessionId: interviewState.sessionId,
          answer
        }));
      } else {
        // Fallback to HTTP API
        const response = await fetch('/api/realtime-interview/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: interviewState.sessionId,
            answer
          })
        });

        const data = await response.json();
        // Handle HTTP response similar to WebSocket
        if (data.evaluation) {
          addMessage('evaluation', data.evaluation.feedback, data.evaluation);
        }
        if (data.isComplete) {
          addMessage('system', 'Interview completed!');
        } else if (data.nextQuestion) {
          addMessage('question', data.nextQuestion);
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
    }
  }, [interviewState, addMessage]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioData(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setInterviewState(prev => prev ? { ...prev, isListening: true } : null);
    } catch (error) {
      console.error('Failed to start recording:', error);
      addMessage('system', 'Microphone access denied. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setInterviewState(prev => prev ? { ...prev, isListening: false } : null);
    }
  }, [isRecording]);

  const sendAudioData = useCallback(async (audioBlob: Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && interviewState) {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        wsRef.current.send(JSON.stringify({
          type: 'audio_input',
          sessionId: interviewState.sessionId,
          audioData: Array.from(new Uint8Array(arrayBuffer))
        }));
      } catch (error) {
        console.error('Failed to send audio data:', error);
      }
    }
  }, [interviewState]);

  const sendBehavioralSignals = useCallback((signals: BehavioralSignals) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && interviewState) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'behavioral_signals',
          sessionId: interviewState.sessionId,
          signals
        }));
      } catch (error) {
        console.error('Failed to send behavioral signals:', error);
      }
    }
  }, [interviewState]);

  const endInterview = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && interviewState) {
      wsRef.current.send(JSON.stringify({
        type: 'end_interview',
        sessionId: interviewState.sessionId
      }));
    }
    setInterviewState(null);
    setMessages([]);
  }, [interviewState]);

  return {
    messages,
    interviewState,
    isLoading,
    isRecording,
    isPlaying,
    startInterview,
    submitAnswer,
    startRecording,
    stopRecording,
    sendAudioData,
    sendBehavioralSignals,
    endInterview
  };
}