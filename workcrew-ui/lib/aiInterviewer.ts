import OpenAI from 'openai';

export interface CodeAnalysis {
  strengths: string[];
  weaknesses: string[];
  focusAreas: string[]; // 'edge_cases', 'performance', 'error_handling', 'trade_offs', 'clarification'
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'clarification' | 'edge_case' | 'optimization' | 'trade_off';
  context?: string; // Reference to code line/area
}

export interface AnswerEvaluation {
  score: number; // 0-10
  depth: number; // 0-10
  clarity: number; // 0-10
  correctness: number; // 0-10
  followUpNeeded: boolean;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  codeSubmission: string;
  language: string;
  codeAnalysis: CodeAnalysis;
  questions: InterviewQuestion[];
  answers: string[];
  evaluations: AnswerEvaluation[];
  currentQuestionIndex: number;
  isComplete: boolean;
  finalEvaluation?: InterviewEvaluation;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewEvaluation {
  communication: number; // 0-10
  problemSolving: number; // 0-10
  depthOfKnowledge: number; // 0-10
  confidence: number; // 0-10
  overall: number; // 0-10
  insight: string;
  skillSignals: SkillSignal[];
}

export interface SkillSignal {
  name: string;
  score: number; // 0-100
  evidence: string[];
}

export interface AIInterviewerConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxQuestions?: number;
}

export class AIInterviewer {
  private openai: OpenAI;
  private model: string;
  private temperature: number;
  private maxQuestions: number;

  constructor(config: AIInterviewerConfig = {}) {
    this.openai = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY || 'mock-key',
    });
    this.model = config.model || 'gpt-4';
    this.temperature = config.temperature || 0.7;
    this.maxQuestions = config.maxQuestions || 5;
  }

  async analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key') {
        return this.mockCodeAnalysis(code, language);
      }

      const prompt = `
Analyze this code like a senior interviewer preparing for a technical interview.

Code:
\`\`\`${language}
${code}
\`\`\`

Return a JSON object with:
- strengths: array of positive aspects
- weaknesses: array of areas needing improvement
- focus_areas: array of interview focus areas from: ["edge_cases", "performance", "error_handling", "trade_offs", "clarification"]

Be specific and actionable. Focus on areas that would make good interview questions.
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior software engineer conducting code analysis for technical interviews. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      const analysis = JSON.parse(content);
      return {
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
        weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
        focusAreas: Array.isArray(analysis.focus_areas) ? analysis.focus_areas : []
      };

    } catch (error) {
      console.error('Code analysis error:', error);
      return this.mockCodeAnalysis(code, language);
    }
  }

  async generateFollowUpQuestions(analysis: CodeAnalysis): Promise<InterviewQuestion[]> {
    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key') {
        return this.mockFollowUpQuestions(analysis);
      }

      const prompt = `
You are a senior backend engineer conducting an interview.

Based on this code analysis:

Weaknesses:
${analysis.weaknesses.map(w => `- ${w}`).join('\n')}

Focus Areas:
${analysis.focusAreas.join(', ')}

Generate exactly 5 follow-up questions that would be asked in a real technical interview:
- Mix of conceptual and practical questions
- Keep them conversational and natural
- Avoid generic questions like "explain your code"
- Focus on the weaknesses and focus areas identified
- Make them progressively deeper

Return a JSON array of objects with:
- question: the question text
- type: one of "clarification", "edge_case", "optimization", "trade_off"
- context: optional reference to what part of the code this relates to

Make these questions that a senior engineer would actually ask.
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior software engineer conducting technical interviews. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      const questions = JSON.parse(content);
      return questions.map((q: any, index: number) => ({
        id: `q_${Date.now()}_${index}`,
        question: q.question || q,
        type: q.type || 'clarification',
        context: q.context
      }));

    } catch (error) {
      console.error('Question generation error:', error);
      return this.mockFollowUpQuestions(analysis);
    }
  }

  async evaluateAnswer(question: InterviewQuestion, answer: string): Promise<AnswerEvaluation> {
    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key') {
        return this.mockAnswerEvaluation(question, answer);
      }

      const prompt = `
Evaluate this candidate's answer in a technical interview:

Question: ${question.question}

Answer: ${answer}

Return a JSON object with:
- score: overall quality (0-10)
- depth: technical depth shown (0-10)
- clarity: how clearly explained (0-10)
- correctness: technical accuracy (0-10)
- followUpNeeded: boolean - does this need more clarification?
- feedback: brief feedback on the answer
- strengths: array of what was good
- weaknesses: array of what was missing or unclear

Be honest but constructive. Consider this is an interview setting.
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are evaluating technical interview answers. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      const evaluation = JSON.parse(content);
      return {
        score: Math.max(0, Math.min(10, evaluation.score || 5)),
        depth: Math.max(0, Math.min(10, evaluation.depth || 5)),
        clarity: Math.max(0, Math.min(10, evaluation.clarity || 5)),
        correctness: Math.max(0, Math.min(10, evaluation.correctness || 5)),
        followUpNeeded: evaluation.followUpNeeded || false,
        feedback: evaluation.feedback || '',
        strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
        weaknesses: Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : []
      };

    } catch (error) {
      console.error('Answer evaluation error:', error);
      return this.mockAnswerEvaluation(question, answer);
    }
  }

  async generateFinalEvaluation(session: InterviewSession): Promise<InterviewEvaluation> {
    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key') {
        return this.mockFinalEvaluation(session);
      }

      const answersSummary = session.answers.map((answer, index) => ({
        question: session.questions[index]?.question,
        answer,
        evaluation: session.evaluations[index]
      }));

      const prompt = `
Based on this complete interview session, provide a final evaluation:

Code Analysis:
- Strengths: ${session.codeAnalysis.strengths.join(', ')}
- Weaknesses: ${session.codeAnalysis.weaknesses.join(', ')}

Interview Performance:
${answersSummary.map((item, i) => `
Question ${i + 1}: ${item.question}
Answer: ${item.answer.substring(0, 200)}...
Evaluation: Score ${item.evaluation.score}/10, Depth ${item.evaluation.depth}/10
`).join('\n')}

Return a JSON object with:
- communication: how well they explained concepts (0-10)
- problemSolving: ability to solve problems (0-10)
- depthOfKnowledge: technical depth (0-10)
- confidence: confidence in answers (0-10)
- overall: overall assessment (0-10)
- insight: brief summary paragraph
- skillSignals: array of skills with scores and evidence

Be comprehensive and provide actionable insights.
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are providing final technical interview evaluations. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      const evaluation = JSON.parse(content);
      return {
        communication: Math.max(0, Math.min(10, evaluation.communication || 5)),
        problemSolving: Math.max(0, Math.min(10, evaluation.problemSolving || 5)),
        depthOfKnowledge: Math.max(0, Math.min(10, evaluation.depthOfKnowledge || 5)),
        confidence: Math.max(0, Math.min(10, evaluation.confidence || 5)),
        overall: Math.max(0, Math.min(10, evaluation.overall || 5)),
        insight: evaluation.insight || 'Good technical foundation with room for growth',
        skillSignals: Array.isArray(evaluation.skillSignals) ? evaluation.skillSignals : []
      };

    } catch (error) {
      console.error('Final evaluation error:', error);
      return this.mockFinalEvaluation(session);
    }
  }

  // Mock implementations for development/testing
  private mockCodeAnalysis(code: string, language: string): CodeAnalysis {
    return {
      strengths: [
        'Clean code structure',
        'Good variable naming',
        'Readable logic flow'
      ],
      weaknesses: [
        'Missing error handling',
        'No input validation',
        'Potential performance issues with large datasets'
      ],
      focusAreas: ['edge_cases', 'error_handling', 'performance']
    };
  }

  private mockFollowUpQuestions(analysis: CodeAnalysis): InterviewQuestion[] {
    return [
      {
        id: 'q1',
        question: 'What happens if the input array is empty or null?',
        type: 'edge_case',
        context: 'Input validation'
      },
      {
        id: 'q2',
        question: 'How would this function perform with 1 million records?',
        type: 'optimization',
        context: 'Performance considerations'
      },
      {
        id: 'q3',
        question: 'Why did you choose this particular algorithm or data structure?',
        type: 'clarification',
        context: 'Design decisions'
      },
      {
        id: 'q4',
        question: 'What trade-offs did you consider when implementing this solution?',
        type: 'trade_off',
        context: 'Architecture choices'
      },
      {
        id: 'q5',
        question: 'How would you handle database connection failures or timeouts?',
        type: 'edge_case',
        context: 'Error handling'
      }
    ];
  }

  private mockAnswerEvaluation(question: InterviewQuestion, answer: string): AnswerEvaluation {
    const score = Math.floor(Math.random() * 6) + 5; // 5-10
    return {
      score,
      depth: Math.max(1, score - 1),
      clarity: Math.max(1, score - 1),
      correctness: score,
      followUpNeeded: score < 7,
      feedback: score >= 8 ? 'Good answer with solid reasoning' : 'Decent answer but could be more detailed',
      strengths: ['Clear explanation', 'Shows understanding'],
      weaknesses: score < 7 ? ['Could be more specific', 'Missing edge cases'] : []
    };
  }

  private mockFinalEvaluation(session: InterviewSession): InterviewEvaluation {
    const avgScore = session.evaluations.reduce((sum, e) => sum + e.score, 0) / session.evaluations.length;
    const normalizedScore = Math.max(0, Math.min(10, avgScore));

    return {
      communication: normalizedScore,
      problemSolving: normalizedScore - 0.5,
      depthOfKnowledge: normalizedScore - 1,
      confidence: normalizedScore + 0.5,
      overall: normalizedScore,
      insight: 'Strong technical foundation with good communication skills. Shows promise for development roles.',
      skillSignals: [
        {
          name: 'Problem Solving',
          score: Math.round(normalizedScore * 10),
          evidence: ['Clear thinking process', 'Logical approach']
        },
        {
          name: 'Communication',
          score: Math.round((normalizedScore + 0.5) * 10),
          evidence: ['Explains concepts well', 'Structured answers']
        },
        {
          name: 'System Thinking',
          score: Math.round((normalizedScore - 0.5) * 10),
          evidence: ['Considers edge cases', 'Performance awareness']
        }
      ]
    };
  }
}

// Singleton instance
export const aiInterviewer = new AIInterviewer();