import OpenAI from 'openai';

export interface CodeReview {
  score: number; // 0-100
  issues: string[];
  strengths: string[];
  suggestions: string[];
  inlineComments: InlineComment[];
}

export interface InlineComment {
  line: number;
  severity: 'info' | 'warning' | 'critical';
  comment: string;
  suggestion?: string;
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
  "suggestions": [<array of improvement suggestions>],
  "inlineComments": [<array of inline comments with line numbers and feedback>]
}

Be constructive and specific in your feedback. Consider the context and difficulty level when scoring.
`;
  }

  private normalizeEvaluation(evaluation: any): CodeReview {
    return {
      score: Math.max(0, Math.min(100, evaluation.score || 50)),
      issues: Array.isArray(evaluation.issues) ? evaluation.issues : [],
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
      suggestions: Array.isArray(evaluation.suggestions) ? evaluation.suggestions : [],
      inlineComments: Array.isArray(evaluation.inlineComments) ? evaluation.inlineComments : []
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

    if (code.includes('function ') && language === 'javascript') {
      score += 5;
      strengths.push('Using named functions');
    }

    if (code.includes('try') && code.includes('catch')) {
      score += 10;
      strengths.push('Proper error handling implemented');
    }

    if (code.includes('if __name__ == "__main__":') && language === 'python') {
      score += 10;
      strengths.push('Proper script structure with main guard');
    }

    // Generate mock inline comments based on code analysis
    const inlineComments: InlineComment[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check for potential issues
      if (line.includes('var ') && language === 'javascript') {
        inlineComments.push({
          line: lineNumber,
          severity: 'warning',
          comment: 'Consider using let or const instead of var for better scoping',
          suggestion: 'Replace var with let or const'
        });
      }

      if (line.includes('console.log') && !line.includes('//')) {
        inlineComments.push({
          line: lineNumber,
          severity: 'info',
          comment: 'Debug statement found - consider removing for production code',
          suggestion: 'Remove or comment out console.log statements'
        });
      }

      if (line.includes('TODO') || line.includes('FIXME')) {
        inlineComments.push({
          line: lineNumber,
          severity: 'info',
          comment: 'TODO/FIXME comment found - ensure this is addressed',
          suggestion: 'Complete the TODO item or remove the comment'
        });
      }

      if (line.includes('for') && line.includes('length') && !line.includes('i <')) {
        inlineComments.push({
          line: lineNumber,
          severity: 'warning',
          comment: 'Potential infinite loop if length is not checked properly'
        });
      }
    });

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      strengths,
      suggestions,
      inlineComments
    };
  }
}

// Singleton instance
export const aiCodeEvaluator = new AICodeEvaluator();