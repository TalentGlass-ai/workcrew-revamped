import OpenAI from 'openai';

export interface InterviewSession {
  sessionId: string;
  mode: 'text' | 'voice';
  language: string;
  state: InterviewState;
  startTime: Date;
  messages: InterviewMessage[];
}

export interface InterviewState {
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
  questionCount: number;
  maxQuestions: number;
}

export interface InterviewMessage {
  id: string;
  type: 'question' | 'answer' | 'evaluation';
  content: string;
  timestamp: Date;
  evaluation?: AnswerEvaluation;
}

export interface AnswerEvaluation {
  score: number; // 0-10
  clarity: number; // 0-10
  depth: number; // 0-10
  correctness: number; // 0-10
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  followUpNeeded: boolean;
  missedPoints: string[];
}

export interface InterviewResult {
  evaluation: AnswerEvaluation;
  nextQuestion: string;
  isComplete: boolean;
  state: InterviewState;
}

export class RealtimeInterviewOrchestrator {
  private sessions: Map<string, InterviewSession> = new Map();
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    });
  }

  async startInterview(language: string, mode: 'text' | 'voice' = 'text'): Promise<{
    sessionId: string;
    state: InterviewState;
    firstQuestion: string;
  }> {
    const sessionId = `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const initialState: InterviewState = {
      currentQuestion: '',
      previousAnswers: [],
      depthLevel: 1,
      focusAreas: [],
      scores: { communication: 0, problemSolving: 0, depth: 0, confidence: 0 },
      isActive: true,
      questionCount: 0,
      maxQuestions: 8
    };

    const firstQuestion = await this.generateInitialQuestion(language);

    const session: InterviewSession = {
      sessionId,
      mode,
      language,
      state: { ...initialState, currentQuestion: firstQuestion },
      startTime: new Date(),
      messages: [{
        id: Date.now().toString(),
        type: 'question',
        content: firstQuestion,
        timestamp: new Date()
      }]
    };

    this.sessions.set(sessionId, session);

    return {
      sessionId,
      state: session.state,
      firstQuestion
    };
  }

  async processAnswer(sessionId: string, answer: string): Promise<InterviewResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Evaluate the answer
    const evaluation = await this.evaluateAnswer(session, answer);

    // Update session state
    session.state.previousAnswers.push(answer);
    session.state.questionCount++;

    // Update scores based on evaluation
    this.updateScores(session.state, evaluation);

    // Add messages to session
    session.messages.push({
      id: Date.now().toString(),
      type: 'answer',
      content: answer,
      timestamp: new Date()
    });

    session.messages.push({
      id: (Date.now() + 1).toString(),
      type: 'evaluation',
      content: evaluation.feedback,
      timestamp: new Date(),
      evaluation
    });

    // Check if interview is complete
    const isComplete = session.state.questionCount >= session.state.maxQuestions ||
                       this.shouldEndInterview(session.state, evaluation);

    let nextQuestion = '';
    if (!isComplete) {
      nextQuestion = await this.generateNextQuestion(session, evaluation);
      session.state.currentQuestion = nextQuestion;

      session.messages.push({
        id: (Date.now() + 2).toString(),
        type: 'question',
        content: nextQuestion,
        timestamp: new Date()
      });
    }

    // Update focus areas based on evaluation
    this.updateFocusAreas(session.state, evaluation);

    return {
      evaluation,
      nextQuestion,
      isComplete,
      state: session.state
    };
  }

  async evaluateAnswer(session: InterviewSession, answer: string): Promise<AnswerEvaluation> {
    const prompt = `
You are evaluating a candidate's answer in a technical interview. Analyze their response for:

Question: ${session.state.currentQuestion}
Answer: ${answer}

Previous context: ${session.state.previousAnswers.slice(-2).join(' | ')}

Evaluate on a scale of 0-10 for each category:
- score: Overall quality (0-10)
- clarity: How clear and well-structured the answer is (0-10)
- depth: Technical depth and understanding shown (0-10)
- correctness: Accuracy of technical information (0-10)

Also provide:
- feedback: 1-2 sentence constructive feedback
- strengths: Array of 1-3 key strengths
- weaknesses: Array of 1-3 areas for improvement
- followUpNeeded: Boolean - does this answer need follow-up?
- missedPoints: Array of important points they missed

Return as JSON with these exact keys.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      const evaluation = JSON.parse(content);
      return evaluation;
    } catch (error) {
      console.error('Evaluation error:', error);
      // Fallback evaluation
      return {
        score: 5,
        clarity: 5,
        depth: 5,
        correctness: 5,
        feedback: 'Answer received and processed.',
        strengths: ['Attempted to answer'],
        weaknesses: ['Could be more detailed'],
        followUpNeeded: true,
        missedPoints: []
      };
    }
  }

  async generateInitialQuestion(language: string): Promise<string> {
    const prompt = `
Generate an opening question for a technical interview in ${language}.

The question should:
- Be appropriate for a senior developer role
- Test fundamental understanding
- Be conversational and natural
- Allow for follow-up based on the answer

Make it sound like a real interviewer asking the question.
Return only the question text, no additional formatting.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0]?.message?.content?.trim() || 'Can you walk me through how you would approach solving a complex problem in code?';
    } catch (error) {
      console.error('Question generation error:', error);
      return 'Can you walk me through how you would approach solving a complex problem in code?';
    }
  }

  async generateNextQuestion(session: InterviewSession, evaluation: AnswerEvaluation): Promise<string> {
    const context = `
Current interview state:
- Questions asked: ${session.state.questionCount}
- Depth level: ${session.state.depthLevel}
- Focus areas: ${session.state.focusAreas.join(', ')}
- Last evaluation: Score ${evaluation.score}/10, ${evaluation.feedback}
- Previous answers: ${session.state.previousAnswers.slice(-1)}

Last answer evaluation:
- Strengths: ${evaluation.strengths.join(', ')}
- Weaknesses: ${evaluation.weaknesses.join(', ')}
- Missed points: ${evaluation.missedPoints.join(', ')}
- Follow-up needed: ${evaluation.followUpNeeded}
`;

    const prompt = `
${context}

Generate the next question for this technical interview. Consider:

1. If the candidate showed strong understanding, ask deeper/more complex questions
2. If they missed important points, follow up on those
3. If they struggled with clarity, ask for clarification
4. Keep questions conversational and natural
5. Progress toward evaluating: problem-solving, system design, communication

Return only the question text, no additional formatting.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0]?.message?.content?.trim() || 'Can you elaborate on that approach?';
    } catch (error) {
      console.error('Next question generation error:', error);
      return 'Can you elaborate on that approach?';
    }
  }

  async generateFinalEvaluation(sessionId: string): Promise<{
    communication: number;
    problemSolving: number;
    depth: number;
    confidence: number;
    finalScore: number;
    summary: string;
    skills: Array<{ name: string; score: number }>;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const prompt = `
Analyze this complete interview session and provide final evaluation:

Session duration: ${Math.round((Date.now() - session.startTime.getTime()) / 1000 / 60)} minutes
Questions answered: ${session.state.questionCount}
Language: ${session.language}

Scores throughout:
- Communication: ${session.state.scores.communication}
- Problem Solving: ${session.state.scores.problemSolving}
- Depth: ${session.state.scores.depth}
- Confidence: ${session.state.scores.confidence}

Focus areas covered: ${session.state.focusAreas.join(', ')}

Provide final evaluation as JSON with:
- communication: final score (0-10)
- problemSolving: final score (0-10)
- depth: final score (0-10)
- confidence: final score (0-10)
- finalScore: overall score (0-10)
- summary: 2-3 sentence summary
- skills: array of {name: string, score: number} for key technical skills
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      return JSON.parse(content);
    } catch (error) {
      console.error('Final evaluation error:', error);
      return {
        communication: session.state.scores.communication,
        problemSolving: session.state.scores.problemSolving,
        depth: session.state.scores.depth,
        confidence: session.state.scores.confidence,
        finalScore: Math.round((session.state.scores.communication + session.state.scores.problemSolving + session.state.scores.depth + session.state.scores.confidence) / 4),
        summary: 'Interview completed successfully.',
        skills: [
          { name: 'Problem Solving', score: session.state.scores.problemSolving },
          { name: 'Communication', score: session.state.scores.communication },
          { name: 'Technical Depth', score: session.state.scores.depth }
        ]
      };
    }
  }

  async speechToText(audioData: ArrayBuffer): Promise<string> {
    // For MVP, we'll use OpenAI Whisper API
    try {
      const audioBlob = new Blob([audioData], { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('STT error:', error);
      return 'Sorry, I couldn\'t understand the audio. Please try again or type your answer.';
    }
  }

  async generateSpeech(text: string): Promise<ArrayBuffer> {
    // For MVP, we'll use OpenAI TTS API
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy', // Can be alloy, echo, fable, onyx, nova, shimmer
        input: text,
        response_format: 'mp3'
      });

      const buffer = await response.arrayBuffer();
      return buffer;
    } catch (error) {
      console.error('TTS error:', error);
      // Return empty buffer if TTS fails
      return new ArrayBuffer(0);
    }
  }

  private updateScores(state: InterviewState, evaluation: AnswerEvaluation) {
    // Weighted average of evaluations
    const weight = 0.3; // How much new evaluation affects old score

    state.scores.communication = Math.round(
      (state.scores.communication * (1 - weight)) + (evaluation.clarity * weight)
    );

    state.scores.problemSolving = Math.round(
      (state.scores.problemSolving * (1 - weight)) + (evaluation.correctness * weight)
    );

    state.scores.depth = Math.round(
      (state.scores.depth * (1 - weight)) + (evaluation.depth * weight)
    );

    // Estimate confidence based on answer length and evaluation
    const confidenceEstimate = Math.min(10, Math.max(0,
      (evaluation.score + evaluation.clarity) / 2 +
      (state.previousAnswers.length > 0 ? 1 : 0) // Bonus for continuing
    ));

    state.scores.confidence = Math.round(
      (state.scores.confidence * (1 - weight)) + (confidenceEstimate * weight)
    );
  }

  private updateFocusAreas(state: InterviewState, evaluation: AnswerEvaluation) {
    // Add focus areas based on evaluation
    if (evaluation.correctness < 6) {
      if (!state.focusAreas.includes('technical_accuracy')) {
        state.focusAreas.push('technical_accuracy');
      }
    }

    if (evaluation.depth < 6) {
      if (!state.focusAreas.includes('technical_depth')) {
        state.focusAreas.push('technical_depth');
      }
    }

    if (evaluation.clarity < 6) {
      if (!state.focusAreas.includes('communication')) {
        state.focusAreas.push('communication');
      }
    }

    if (evaluation.missedPoints.length > 0) {
      if (!state.focusAreas.includes('attention_to_detail')) {
        state.focusAreas.push('attention_to_detail');
      }
    }
  }

  private shouldEndInterview(state: InterviewState, evaluation: AnswerEvaluation): boolean {
    // End interview if:
    // - Reached max questions
    // - Candidate is struggling significantly
    // - Or has shown strong understanding and covered key areas

    if (state.questionCount >= state.maxQuestions) return true;
    if (evaluation.score < 3 && state.questionCount > 3) return true; // Give up after poor performance
    if (evaluation.score > 8 && state.questionCount > 5) return true; // End early for strong candidates

    return false;
  }

  getSession(sessionId: string): InterviewSession | undefined {
    return this.sessions.get(sessionId);
  }

  endSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}