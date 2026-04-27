"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon, VideoCameraIcon, VideoCameraSlashIcon } from '@heroicons/react/24/outline';
import Button from '@/workcrew-ui/components/primitives/Button';

interface BehavioralSignals {
  faceVisible: boolean;
  faceVisiblePercentage: number;
  lookingAway: boolean;
  lookingAwayPercentage: number;
  multipleFaces: boolean;
  frameStability: number; // 0-1, higher is more stable
  lastFaceDetected: number; // timestamp
}

interface VideoCaptureProps {
  onBehavioralSignals: (signals: BehavioralSignals) => void;
  onVideoStream: (stream: MediaStream | null) => void;
  isRecording: boolean;
  className?: string;
}

export default function VideoCapture({
  onBehavioralSignals,
  onVideoStream,
  isRecording,
  className = ''
}: VideoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faceDetectionModel, setFaceDetectionModel] = useState<any>(null);

  // Behavioral tracking state
  const [behavioralData, setBehavioralData] = useState({
    totalFrames: 0,
    faceVisibleFrames: 0,
    lookingAwayFrames: 0,
    multipleFacesFrames: 0,
    startTime: Date.now()
  });

  // Initialize face detection model
  useEffect(() => {
    const initFaceDetection = async () => {
      try {
        // Import TensorFlow.js and face detection model
        const tf = await import('@tensorflow/tfjs');
        const faceDetection = await import('@tensorflow-models/face-detection');

        // Initialize the model
        const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
        const detector = await faceDetection.createDetector(model, {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection'
        });

        setFaceDetectionModel(detector);
        console.log('Face detection model initialized');
      } catch (error) {
        console.error('Failed to initialize face detection:', error);
      }
    };

    initFaceDetection();
  }, []);

  // Analyze video frames for behavioral signals
  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !faceDetectionModel || !isVideoEnabled) {
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detect faces
      const faces = await faceDetectionModel.estimateFaces(canvas);

      const now = Date.now();
      let faceVisible = false;
      let multipleFaces = false;
      let lookingAway = false;

      if (faces.length > 0) {
        faceVisible = true;
        multipleFaces = faces.length > 1;

        // Basic gaze detection (simplified)
        // In a real implementation, you'd use more sophisticated eye tracking
        if (faces.length === 1) {
          const face = faces[0];
          // Simple heuristic: if face is not centered, might be looking away
          const faceCenterX = (face.box.xMin + face.box.xMax) / 2;
          const videoCenterX = canvas.width / 2;
          const offset = Math.abs(faceCenterX - videoCenterX) / (canvas.width / 2);

          lookingAway = offset > 0.3; // 30% offset from center
        }
      }

      // Update behavioral tracking
      setBehavioralData(prev => ({
        ...prev,
        totalFrames: prev.totalFrames + 1,
        faceVisibleFrames: prev.faceVisibleFrames + (faceVisible ? 1 : 0),
        lookingAwayFrames: prev.lookingAwayFrames + (lookingAway ? 1 : 0),
        multipleFacesFrames: prev.multipleFacesFrames + (multipleFaces ? 1 : 0)
      }));

      // Calculate percentages
      const totalFrames = behavioralData.totalFrames + 1;
      const faceVisiblePercentage = ((behavioralData.faceVisibleFrames + (faceVisible ? 1 : 0)) / totalFrames) * 100;
      const lookingAwayPercentage = ((behavioralData.lookingAwayFrames + (lookingAway ? 1 : 0)) / totalFrames) * 100;

      // Calculate frame stability (simplified - in real implementation, track movement)
      const frameStability = faceVisible ? 0.8 : 0.2; // Placeholder

      const signals: BehavioralSignals = {
        faceVisible,
        faceVisiblePercentage,
        lookingAway,
        lookingAwayPercentage,
        multipleFaces,
        frameStability,
        lastFaceDetected: faceVisible ? now : behavioralData.startTime
      };

      onBehavioralSignals(signals);

    } catch (error) {
      console.error('Frame analysis error:', error);
    }
  }, [faceDetectionModel, isVideoEnabled, behavioralData, onBehavioralSignals]);

  // Start/stop frame analysis
  useEffect(() => {
    if (isRecording && isVideoEnabled && faceDetectionModel) {
      setIsAnalyzing(true);
      analysisIntervalRef.current = setInterval(analyzeFrame, 1000); // Analyze every second
    } else {
      setIsAnalyzing(false);
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isRecording, isVideoEnabled, faceDetectionModel, analyzeFrame]);

  // Start video stream
  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false // Audio handled separately
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsVideoEnabled(true);
        setHasPermission(true);
        onVideoStream(stream);
      }
    } catch (error) {
      console.error('Failed to start video:', error);
      setHasPermission(false);

      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          alert('Camera permission denied. Please allow camera access to use video features.');
        } else if (error.name === 'NotFoundError') {
          alert('No camera found on this device.');
        }
      }
    }
  }, [onVideoStream]);

  // Stop video stream
  const stopVideo = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsVideoEnabled(false);
    onVideoStream(null);
  }, [onVideoStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, [stopVideo]);

  return (
    <div className={`relative ${className}`}>
      {/* Video Element */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-48 object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
        />

        {/* Placeholder when video is disabled */}
        {!isVideoEnabled && (
          <div className="w-full h-48 flex items-center justify-center bg-gray-800 text-gray-400">
            <div className="text-center">
              <VideoCameraSlashIcon className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Video disabled</p>
            </div>
          </div>
        )}

        {/* Analysis indicator */}
        {isAnalyzing && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Analyzing
          </div>
        )}
      </div>

      {/* Hidden canvas for frame analysis */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={isVideoEnabled ? stopVideo : startVideo}
            tone={isVideoEnabled ? "danger" : "primary"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isVideoEnabled ? (
              <>
                <VideoCameraSlashIcon className="w-4 h-4" />
                Stop Video
              </>
            ) : (
              <>
                <VideoCameraIcon className="w-4 h-4" />
                Start Video
              </>
            )}
          </Button>

          {hasPermission === false && (
            <span className="text-red-500 text-sm">
              Camera access denied
            </span>
          )}
        </div>

        {/* Behavioral signals display */}
        {isVideoEnabled && (
          <div className="text-xs text-gray-600 space-y-1">
            <div>Face: {behavioralData.faceVisibleFrames}/{behavioralData.totalFrames} frames</div>
            <div>Multiple faces: {behavioralData.multipleFacesFrames} detections</div>
          </div>
        )}
      </div>
    </div>
  );
}