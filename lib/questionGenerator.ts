import { ASSESSMENT_PACKS, AssessmentPack, AssessmentQuestion, getPackByRole, getQuestionsByDifficulty } from './assessmentPacks';

export interface Question {
  id: string;
  questionType: string;
  question: string;
  correctAnswer?: string;
  weightage: number;
  options?: string[];
  codeTemplate?: string;
  testCases?: any[];
  skills: string[];
}

// Updated question generation to use assessment packs
export async function generateQuestion(skill: string, difficulty: number = 1, role?: string): Promise<Question> {
  try {
    // If role is specified, use the assessment pack for that role
    if (role) {
      const pack = getPackByRole(role);
      if (pack) {
        const level = difficulty === 1 ? 'easy' : difficulty === 2 ? 'medium' : 'hard';
        const questions = getQuestionsByDifficulty(pack, level);

        if (questions.length > 0) {
          const randomIndex = Math.floor(Math.random() * questions.length);
          const q = questions[randomIndex];

          return {
            id: `${q.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            questionType: q.level === 'easy' ? 'coding' : 'system-design',
            question: q.title + '\n\n' + q.task + (q.constraints ? '\n\nConstraints:\n' + q.constraints.join('\n') : ''),
            correctAnswer: q.expected || 'Implementation should meet requirements',
            weightage: 1.0,
            codeTemplate: q.code_template,
            testCases: q.test_cases,
            skills: q.skills
          };
        }
      }
    }

    // Fallback to skill-based generation
    return generateQuestionBySkill(skill, difficulty);
  } catch (error) {
    console.error('Question generation error:', error);
    return generateFallbackQuestion();
  }
}

// Generate questions based on skill (legacy fallback)
function generateQuestionBySkill(skill: string, difficulty: number): Question {
  const skillQuestions = getMockQuestionsBySkill(skill);
  const randomIndex = Math.floor(Math.random() * skillQuestions.length);

  return {
    ...skillQuestions[randomIndex],
    id: `${skill.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
}

// Legacy mock questions (kept for fallback)
function getMockQuestionsBySkill(skill: string): Question[] {
  const mockQuestions: Record<string, Question[]> = {
    JavaScript: [
      {
        id: 'js-1',
        questionType: 'coding',
        question: 'Write a function that reverses a string in JavaScript.',
        correctAnswer: 'function reverseString(str) { return str.split("").reverse().join(""); }',
        weightage: 1.0,
        skills: ['JavaScript', 'String Manipulation']
      },
      {
        id: 'js-2',
        questionType: 'coding',
        question: 'Write a function that checks if a number is prime.',
        correctAnswer: 'function isPrime(num) { if (num <= 1) return false; for (let i = 2; i <= Math.sqrt(num); i++) { if (num % i === 0) return false; } return true; }',
        weightage: 1.0,
        skills: ['JavaScript', 'Algorithms']
      }
    ],
    Python: [
      {
        id: 'py-1',
        questionType: 'coding',
        question: 'Write a function that calculates the factorial of a number.',
        correctAnswer: 'def factorial(n): return 1 if n == 0 else n * factorial(n-1)',
        weightage: 1.0,
        skills: ['Python', 'Recursion']
      }
    ],
    Java: [
      {
        id: 'java-1',
        questionType: 'coding',
        question: 'Write a Java method that reverses a string.',
        correctAnswer: 'public static String reverseString(String str) { return new StringBuilder(str).reverse().toString(); }',
        weightage: 1.0,
        skills: ['Java', 'String Manipulation']
      }
    ]
  };

  return mockQuestions[skill] || mockQuestions.JavaScript;
}

function generateFallbackQuestion(): Question {
  return {
    id: `fallback-${Date.now()}`,
    questionType: 'coding',
    question: 'Write a simple "Hello World" program.',
    correctAnswer: 'console.log("Hello World");',
    weightage: 1.0,
    skills: ['Programming Basics']
  };
}

export async function generateAssessmentQuestions(skill: string, count: number = 5, role?: string): Promise<Question[]> {
  const questions: Question[] = [];

  // If role is specified, use assessment pack
  if (role) {
    const pack = getPackByRole(role);
    if (pack) {
      // Generate questions from different difficulty levels
      const easyQuestions = getQuestionsByDifficulty(pack, 'easy');
      const mediumQuestions = getQuestionsByDifficulty(pack, 'medium');
      const hardQuestions = getQuestionsByDifficulty(pack, 'hard');

      // Adaptive selection based on count
      const selectedQuestions: AssessmentQuestion[] = [];

      if (count >= 3) {
        // Include one from each level
        if (easyQuestions.length > 0) selectedQuestions.push(easyQuestions[0]);
        if (mediumQuestions.length > 0) selectedQuestions.push(mediumQuestions[0]);
        if (hardQuestions.length > 0) selectedQuestions.push(hardQuestions[0]);
      }

      // Fill remaining slots
      const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
      while (selectedQuestions.length < count && allQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        const question = allQuestions.splice(randomIndex, 1)[0];
        if (!selectedQuestions.find(q => q.id === question.id)) {
          selectedQuestions.push(question);
        }
      }

      // Convert to Question format
      for (const q of selectedQuestions) {
        questions.push({
          id: `${q.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          questionType: q.level === 'easy' ? 'coding' : 'system-design',
          question: q.title + '\n\n' + q.task + (q.constraints ? '\n\nConstraints:\n' + q.constraints.join('\n') : ''),
          correctAnswer: q.expected || 'Implementation should meet requirements',
          weightage: 1.0,
          codeTemplate: q.code_template,
          testCases: q.test_cases,
          skills: q.skills
        });
      }

      return questions;
    }
  }

  // Fallback to skill-based generation
  for (let i = 0; i < count; i++) {
    const question = await generateQuestion(skill, Math.floor(i / 2) + 1);
    questions.push(question);
  }

  return questions;
}

// Get available roles/assessment packs
export function getAvailableRoles(): string[] {
  return Object.keys(ASSESSMENT_PACKS);
}

// Get pack details
export function getPackDetails(role: string): AssessmentPack | null {
  return getPackByRole(role);
}