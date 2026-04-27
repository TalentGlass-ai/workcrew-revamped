import { InterviewSession } from '@/lib/aiInterviewer';

// In-memory storage for demo (replace with database in production)
export const interviewSessions = new Map<string, InterviewSession>();