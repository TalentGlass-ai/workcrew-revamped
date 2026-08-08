import { sandboxExecutor, TestCase, TestResult, GradingResult } from './sandbox';
import { aiCodeEvaluator, CodeReview } from './aiCodeEvaluator';
import { prisma } from './prisma';

export interface Submission {
  candidateId: string;
  questionId: string;
  language: string;
  code: string;
  testCases: TestCase[];
  context?: {
    question?: string;
    expectedApproach?: string;
    difficulty?: string;
  };
}

export interface BehaviorSignals {
  tabSwitches: number;
  copyPaste: boolean;
  typingPattern: 'normal' | 'suspicious' | 'automated';
  timeSpent: number;
  focusTime: number;
}

export interface ProctoringResult {
  suspicionScore: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high';
  signals: string[];
}

export class AutoGradingEngine {
  private weights = {
    correctness: 0.5,
    efficiency: 0.2,
    codeQuality: 0.2,
    edgeCases: 0.1
  };

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    await sandboxExecutor.initialize();
  }

  async gradeSubmission(submission: Submission): Promise<GradingResult> {
    try {
      // Step 1: Run test cases
      const testResults = await sandboxExecutor.runTestCases(
        submission.code,
        submission.language,
        submission.testCases
      );

      // Step 2: Calculate metrics
      const metrics = this.calculateMetrics(testResults);

      // Step 3: AI code evaluation
      const aiReview = await aiCodeEvaluator.evaluateCode(
        submission.code,
        submission.language,
        submission.context
      );

      // Step 4: Calculate component scores
      const correctness = this.calculateCorrectness(testResults);
      const efficiency = this.calculateEfficiency(testResults);
      const codeQuality = aiReview.score;
      const edgeCases = this.calculateEdgeCases(testResults, submission.testCases);

      // Step 5: Calculate final weighted score
      const finalScore = this.calculateFinalScore({
        correctness,
        efficiency,
        codeQuality,
        edgeCases
      });

      return {
        score: finalScore,
        breakdown: {
          correctness,
          efficiency,
          codeQuality,
          edgeCases
        },
        testResults,
        aiReview,
        metrics
      };

    } catch (error) {
      console.error('Auto-grading error:', error);
      throw new Error('Failed to grade submission');
    }
  }

  private calculateMetrics(testResults: TestResult[]) {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;

    const executionTimes = testResults.map(t => t.executionTime);
    const averageExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;

    const memoryUsages = testResults.map(t => t.memoryUsage);
    const maxMemoryUsage = Math.max(...memoryUsages);

    return {
      totalTests,
      passedTests,
      failedTests,
      averageExecutionTime,
      maxMemoryUsage
    };
  }

  private calculateCorrectness(testResults: TestResult[]): number {
    if (testResults.length === 0) return 0;

    const passedTests = testResults.filter(t => t.passed).length;
    return (passedTests / testResults.length) * 100;
  }

  private calculateEfficiency(testResults: TestResult[]): number {
    if (testResults.length === 0) return 50; // Neutral score

    let score = 100;

    // Penalize based on execution time
    const avgTime = testResults.reduce((sum, t) => sum + t.executionTime, 0) / testResults.length;
    if (avgTime > 2000) score -= 30; // > 2 seconds
    else if (avgTime > 1000) score -= 20; // > 1 second
    else if (avgTime > 500) score -= 10; // > 0.5 seconds

    // Penalize based on memory usage (MB)
    const maxMemory = Math.max(...testResults.map(t => t.memoryUsage));
    if (maxMemory > 100) score -= 20; // > 100MB
    else if (maxMemory > 50) score -= 10; // > 50MB

    return Math.max(0, Math.min(100, score));
  }

  private calculateEdgeCases(testResults: TestResult[], testCases: TestCase[]): number {
    // Identify edge case tests (those with special markers or extreme inputs)
    const edgeCaseTests = testCases.filter(tc =>
      this.isEdgeCase(tc.input) ||
      tc.weight && tc.weight > 1 // Weighted tests are often edge cases
    );

    if (edgeCaseTests.length === 0) {
      return this.calculateCorrectness(testResults); // Fallback to overall correctness
    }

    // Find results for edge case tests
    const edgeResults = testResults.filter((result, index) =>
      edgeCaseTests.some(tc => testCases.indexOf(tc) === index)
    );

    return this.calculateCorrectness(edgeResults);
  }

  private isEdgeCase(input: any): boolean {
    if (typeof input === 'object' && input !== null) {
      // Check for empty objects, arrays, or extreme values
      if (Array.isArray(input) && (input.length === 0 || input.length > 1000)) return true;
      if (Object.keys(input).length === 0) return true;

      // Check for extreme numeric values
      for (const value of Object.values(input)) {
        if (typeof value === 'number' && (value > 1000000 || value < -1000000)) return true;
        if (value === null || value === undefined) return true;
      }
    }

    if (typeof input === 'string' && (input.length === 0 || input.length > 10000)) return true;
    if (typeof input === 'number' && (input > 1000000 || input < -1000000)) return true;

    return false;
  }

  private calculateFinalScore(components: {
    correctness: number;
    efficiency: number;
    codeQuality: number;
    edgeCases: number;
  }): number {
    return (
      this.weights.correctness * components.correctness +
      this.weights.efficiency * components.efficiency +
      this.weights.codeQuality * components.codeQuality +
      this.weights.edgeCases * components.edgeCases
    );
  }

  async evaluateBehaviorSignals(signals: BehaviorSignals): Promise<ProctoringResult> {
    let suspicionScore = 0;
    const riskSignals: string[] = [];

    // Tab switching analysis
    if (signals.tabSwitches > 5) {
      suspicionScore += 0.4;
      riskSignals.push('Excessive tab switching detected');
    } else if (signals.tabSwitches > 2) {
      suspicionScore += 0.2;
      riskSignals.push('Multiple tab switches');
    }

    // Copy-paste detection
    if (signals.copyPaste) {
      suspicionScore += 0.3;
      riskSignals.push('Copy-paste activity detected');
    }

    // Typing pattern analysis
    if (signals.typingPattern === 'suspicious') {
      suspicionScore += 0.3;
      riskSignals.push('Suspicious typing pattern');
    } else if (signals.typingPattern === 'automated') {
      suspicionScore += 0.5;
      riskSignals.push('Automated input detected');
    }

    // Time analysis
    const focusRatio = signals.focusTime / signals.timeSpent;
    if (focusRatio < 0.3) {
      suspicionScore += 0.2;
      riskSignals.push('Low focus time ratio');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (suspicionScore >= 0.7) {
      riskLevel = 'high';
    } else if (suspicionScore >= 0.4) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    return {
      suspicionScore: Math.min(1, suspicionScore),
      riskLevel,
      signals: riskSignals
    };
  }

  async saveGradingResult(
    submission: Submission,
    result: GradingResult,
    behaviorResult?: ProctoringResult
  ): Promise<void> {
    try {
      await prisma.submission.create({
        data: {
          candidateId: submission.candidateId,
          questionId: submission.questionId,
          language: submission.language,
          code: submission.code,
          score: result.score,
          breakdown: result.breakdown as unknown as any,
          feedback: result.aiReview as unknown as any,
          metrics: result.metrics as unknown as any,
          testResults: result.testResults as unknown as any,
          behaviorSignals: behaviorResult ? {
            suspicionScore: behaviorResult.suspicionScore,
            riskLevel: behaviorResult.riskLevel,
            signals: behaviorResult.signals
          } as unknown as any : undefined
        }
      });
    } catch (error) {
      console.error('Failed to save grading result:', error);
      throw new Error('Failed to save grading result');
    }
  }

  // Skill mapping based on grading results
  generateSkillMapping(
    result: GradingResult,
    questionSkills: string[]
  ): Array<{ name: string; score: number; confidence: number }> {
    const skillScores: Array<{ name: string; score: number; confidence: number }> = [];

    for (const skill of questionSkills) {
      let skillScore = result.score;
      let confidence = 0.8; // Base confidence

      // Adjust score based on breakdown
      if (skill.toLowerCase().includes('efficiency') || skill.toLowerCase().includes('performance')) {
        skillScore = result.breakdown.efficiency;
        confidence = 0.9;
      } else if (skill.toLowerCase().includes('quality') || skill.toLowerCase().includes('readability')) {
        skillScore = result.breakdown.codeQuality;
        confidence = 0.9;
      } else if (skill.toLowerCase().includes('testing') || skill.toLowerCase().includes('edge')) {
        skillScore = result.breakdown.edgeCases;
        confidence = 0.9;
      }

      // Penalize for code quality issues
      if (result.aiReview.issues.length > 2) {
        skillScore *= 0.8;
        confidence *= 0.9;
      }

      skillScores.push({
        name: skill,
        score: Math.round(skillScore),
        confidence: Math.round(confidence * 100) / 100
      });
    }

    return skillScores;
  }
}

// Singleton instance
export const autoGradingEngine = new AutoGradingEngine();