import OpenAI from 'openai';

export interface CodeReview {
  score: number; // 0-100
  issues: string[];
  strengths: string[];
  suggestions: string[];
}

export interface AICodeEvaluatorConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
}

export class AICodeEvaluator {
  private openai: OpenAI;
  private model: string;
  private temperature: number;

  constructor(config: AICodeEvaluatorConfig = {}) {
    this.openai = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY || 'mock-key',
    });
    this.model = config.model || 'gpt-4';
    this.temperature = config.temperature || 0.3;
  }

  async evaluateCode(
    code: string,
    language: string,
    context?: {
      question?: string;
      expectedApproach?: string;
      difficulty?: string;
    }
  ): Promise<CodeReview> {
    try {
      // If no real API key, return mock evaluation
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key') {
        return this.mockEvaluation(code, language);
      }

      const prompt = this.buildEvaluationPrompt(code, language, context);

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior software engineer conducting a code review. Evaluate the code quality, readability, best practices, and provide constructive feedback. Return your analysis in JSON format.'
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
      return this.normalizeEvaluation(evaluation);

    } catch (error) {
      console.error('AI Code evaluation error:', error);
      return this.mockEvaluation(code, language);
    }
  }

  private buildEvaluationPrompt(
    code: string,
    language: string,
    context?: { question?: string; expectedApproach?: string; difficulty?: string }
  ): string {
    return `
Please evaluate the following ${language} code submission. Provide a detailed assessment of code quality, readability, and adherence to best practices.

${context?.question ? `Question: ${context.question}` : ''}
${context?.expectedApproach ? `Expected Approach: ${context.expectedApproach}` : ''}
${context?.difficulty ? `Difficulty Level: ${context.difficulty}` : ''}

Code to evaluate:
\`\`\`${language}
${code}
\`\`\`

Please analyze:
1. Code structure and organization
2. Variable naming and readability
3. Algorithm efficiency and correctness
4. Error handling and edge cases
5. Following language-specific best practices
6. Code maintainability and modularity

Return your evaluation in the following JSON format:
{
  "score": <number 0-100>,
  "issues": [<array of specific issues found>],
  "strengths": [<array of positive aspects>],
  "suggestions": [<array of improvement suggestions>]
}

Be constructive and specific in your feedback. Consider the context and difficulty level when scoring.
`;
  }

  private normalizeEvaluation(evaluation: any): CodeReview {
    return {
      score: Math.max(0, Math.min(100, evaluation.score || 50)),
      issues: Array.isArray(evaluation.issues) ? evaluation.issues : [],
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
      suggestions: Array.isArray(evaluation.suggestions) ? evaluation.suggestions : []
    };
  }

  private mockEvaluation(code: string, language: string): CodeReview {
    // Simple heuristic-based evaluation for development/testing
    let score = 70; // Base score
    const issues: string[] = [];
    const strengths: string[] = [];
    const suggestions: string[] = [];

    // Basic checks
    if (code.length < 50) {
      score -= 20;
      issues.push('Code is too short - may not implement complete solution');
    }

    if (code.includes('var ')) {
      score -= 10;
      issues.push('Using var instead of let/const');
      suggestions.push('Use let/const for variable declarations');
    }

    if (code.includes('console.log')) {
      score -= 5;
      issues.push('Debug console.log statements left in code');
      suggestions.push('Remove debug statements before submission');
    }

    if (code.includes('try') || code.includes('catch')) {
      score += 10;
      strengths.push('Includes error handling');
    }

    if (code.includes('function') || code.includes('def ') || code.includes('class')) {
      score += 5;
      strengths.push('Uses functions/classes for organization');
    }

    if (code.includes('//') || code.includes('#') || code.includes('/*')) {
      score += 5;
      strengths.push('Includes comments for clarity');
    }

    // Language-specific checks
    if (language === 'javascript') {
      if (code.includes('async') || code.includes('await')) {
        score += 10;
        strengths.push('Properly handles asynchronous operations');
      }
      if (code.includes('=>')) {
        score += 5;
        strengths.push('Uses modern arrow function syntax');
      }
    }

    if (language === 'python') {
      if (code.includes('def ')) {
        score += 5;
        strengths.push('Proper function definitions');
      }
      if (code.includes('if __name__')) {
        score += 10;
        strengths.push('Proper script structure with main guard');
      }
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      strengths,
      suggestions
    };
  }
}

// Singleton instance
export const aiCodeEvaluator = new AICodeEvaluator();