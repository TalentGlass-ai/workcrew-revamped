import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface Question {
  id: string;
  type: 'multiple-choice' | 'code' | 'text';
  question: string;
  options?: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skill: string;
}

export async function generateQuestion(
  skill: string,
  previousPerformance?: { correct: number; total: number },
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question> {
  const performance = previousPerformance || { correct: 0, total: 0 };
  const accuracy = performance.total > 0 ? performance.correct / performance.total : 0.5;

  // Adaptive difficulty
  let targetDifficulty = difficulty;
  if (!targetDifficulty) {
    if (accuracy > 0.8) targetDifficulty = 'hard';
    else if (accuracy > 0.6) targetDifficulty = 'medium';
    else targetDifficulty = 'easy';
  }

  const prompt = `Generate a ${targetDifficulty} difficulty multiple-choice question about ${skill}.

Return JSON in this format:
{
  "question": "The question text",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correctAnswer": "A) option1"
}

Make sure the question tests practical knowledge of ${skill}.`;

  // Use OpenAI if available, otherwise use mock data
  let parsed: any;

  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        parsed = JSON.parse(content);
      }
    } catch (error) {
      console.warn('OpenAI API error, falling back to mock:', error);
    }
  }

  // Fallback to mock data if OpenAI failed or not configured
  if (!parsed) {
    parsed = getMockQuestion(skill, targetDifficulty);
  }

  return {
    id: `q_${Date.now()}`,
    type: 'multiple-choice',
    question: parsed.question,
    options: parsed.options,
    correctAnswer: parsed.correctAnswer,
    difficulty: targetDifficulty,
    skill,
  };
}

// Mock question generator for development
function getMockQuestion(skill: string, difficulty: string) {
  const questions: Record<string, any> = {
    'Java': {
      easy: {
        question: "What is the correct way to declare a variable in Java?",
        options: ["A) var x = 5;", "B) int x = 5;", "C) x := 5;", "D) let x = 5;"],
        correctAnswer: "B) int x = 5;"
      },
      medium: {
        question: "Which of these is NOT a valid access modifier in Java?",
        options: ["A) public", "B) private", "C) protected", "D) internal"],
        correctAnswer: "D) internal"
      },
      hard: {
        question: "What does the 'volatile' keyword ensure in Java?",
        options: ["A) Thread safety", "B) Memory visibility", "C) Performance optimization", "D) Garbage collection"],
        correctAnswer: "B) Memory visibility"
      }
    },
    'Python': {
      easy: {
        question: "How do you create a list in Python?",
        options: ["A) list = []", "B) list = {}", "C) list = ()", "D) list = <>"],
        correctAnswer: "A) list = []"
      },
      medium: {
        question: "What does 'self' refer to in a Python class method?",
        options: ["A) The class itself", "B) The instance of the class", "C) The method name", "D) A global variable"],
        correctAnswer: "B) The instance of the class"
      },
      hard: {
        question: "What is a decorator in Python?",
        options: ["A) A design pattern", "B) A function that modifies another function", "C) A class attribute", "D) An import statement"],
        correctAnswer: "B) A function that modifies another function"
      }
    }
  };

  const skillQuestions = questions[skill] || questions['Java'];
  return skillQuestions[difficulty] || skillQuestions.medium;
}