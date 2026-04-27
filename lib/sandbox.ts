import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface TestCase {
  input: any;
  expected: any;
  weight?: number;
  timeout?: number;
}

export interface TestResult {
  passed: boolean;
  output: any;
  expected: any;
  executionTime: number;
  memoryUsage: number;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  output: any;
  executionTime: number;
  memoryUsage: number;
  error?: string;
}

export interface GradingResult {
  score: number;
  breakdown: {
    correctness: number;
    efficiency: number;
    codeQuality: number;
    edgeCases: number;
  };
  testResults: TestResult[];
  aiReview: {
    score: number;
    issues: string[];
    strengths: string[];
    suggestions: string[];
  };
  metrics: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageExecutionTime: number;
    maxMemoryUsage: number;
  };
}

export class SandboxExecutor {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'workcrew-sandbox');
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  async executeCode(
    code: string,
    language: string,
    input?: any,
    timeout: number = 10000
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    let memoryUsage = 0;

    try {
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'node':
          return await this.executeJavaScript(code, input, timeout);
        case 'python':
          return await this.executePython(code, input, timeout);
        case 'java':
          return await this.executeJava(code, input, timeout);
        default:
          throw new Error(`Unsupported language: ${language}`);
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        executionTime: Date.now() - startTime,
        memoryUsage,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeJavaScript(
    code: string,
    input?: any,
    timeout: number = 10000
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    // Create a temporary file
    const tempFile = path.join(this.tempDir, `temp-${Date.now()}.js`);
    const inputJson = input ? JSON.stringify(input) : '{}';

    // Wrap code in a function that takes input and returns output
    const wrappedCode = `
const input = ${inputJson};

try {
  ${code}

  // If code defines a function called 'solution' or 'handler', call it
  if (typeof solution === 'function') {
    const result = typeof input === 'object' && input !== null
      ? solution(...Object.values(input))
      : solution(input);
    console.log(JSON.stringify(result));
  } else if (typeof handler === 'function') {
    const result = typeof input === 'object' && input !== null
      ? handler(...Object.values(input))
      : handler(input);
    console.log(JSON.stringify(result));
  } else if (typeof main === 'function') {
    const result = typeof input === 'object' && input !== null
      ? main(...Object.values(input))
      : main(input);
    console.log(JSON.stringify(result));
  } else {
    // Try to execute the code directly and capture any console.log output
    console.log('Code executed but no main function found');
  }
} catch (error) {
  console.error('Execution error:', error.message);
  process.exit(1);
}
`;

    await fs.writeFile(tempFile, wrappedCode);

    try {
      const { stdout, stderr } = await execAsync(`node ${tempFile}`, {
        timeout,
        maxBuffer: 1024 * 1024 // 1MB buffer
      });

      await fs.unlink(tempFile);

      const executionTime = Date.now() - startTime;

      if (stderr) {
        return {
          success: false,
          output: null,
          executionTime,
          memoryUsage: 0,
          error: stderr
        };
      }

      // Try to parse JSON output
      try {
        const output = JSON.parse(stdout.trim());
        return {
          success: true,
          output,
          executionTime,
          memoryUsage: 0
        };
      } catch {
        return {
          success: true,
          output: stdout.trim(),
          executionTime,
          memoryUsage: 0
        };
      }
    } catch (error: any) {
      await fs.unlink(tempFile);
      return {
        success: false,
        output: null,
        executionTime: Date.now() - startTime,
        memoryUsage: 0,
        error: error.message
      };
    }
  }

  private async executePython(
    code: string,
    input?: any,
    timeout: number = 10000
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    const tempFile = path.join(this.tempDir, `temp-${Date.now()}.py`);
    const inputJson = input ? JSON.stringify(input) : '{}';

    const wrappedCode = `
import json
import sys

input_data = ${inputJson}

try:
    ${code}

    # Try to call main functions
    if 'solution' in globals():
        result = solution(input_data)
        print(json.dumps(result))
    elif 'handler' in globals():
        result = handler(input_data)
        print(json.dumps(result))
    elif 'main' in globals():
        result = main(input_data)
        print(json.dumps(result))
    else:
        print("Code executed but no main function found")
except Exception as e:
    print(f"Execution error: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;

    await fs.writeFile(tempFile, wrappedCode);

    try {
      const { stdout, stderr } = await execAsync(`python3 ${tempFile}`, {
        timeout,
        maxBuffer: 1024 * 1024
      });

      await fs.unlink(tempFile);

      const executionTime = Date.now() - startTime;

      if (stderr) {
        return {
          success: false,
          output: null,
          executionTime,
          memoryUsage: 0,
          error: stderr
        };
      }

      try {
        const output = JSON.parse(stdout.trim());
        return {
          success: true,
          output,
          executionTime,
          memoryUsage: 0
        };
      } catch {
        return {
          success: true,
          output: stdout.trim(),
          executionTime,
          memoryUsage: 0
        };
      }
    } catch (error: any) {
      await fs.unlink(tempFile);
      return {
        success: false,
        output: null,
        executionTime: Date.now() - startTime,
        memoryUsage: 0,
        error: error.message
      };
    }
  }

  private async executeJava(
    code: string,
    input?: any,
    timeout: number = 10000
  ): Promise<ExecutionResult> {
    // Java execution would require more complex setup with compilation
    // For now, return a placeholder
    return {
      success: false,
      output: null,
      executionTime: 0,
      memoryUsage: 0,
      error: 'Java execution not yet implemented'
    };
  }

  async runTestCases(
    code: string,
    language: string,
    testCases: TestCase[]
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeCode(
        code,
        language,
        testCase.input,
        testCase.timeout || 10000
      );

      const passed = this.compareOutputs(result.output, testCase.expected);

      results.push({
        passed,
        output: result.output,
        expected: testCase.expected,
        executionTime: result.executionTime,
        memoryUsage: result.memoryUsage,
        error: result.error
      });
    }

    return results;
  }

  private compareOutputs(actual: any, expected: any): boolean {
    try {
      // Handle different types of comparisons
      if (typeof expected === 'number' && typeof actual === 'string') {
        return parseFloat(actual) === expected;
      }

      if (Array.isArray(expected) && Array.isArray(actual)) {
        return JSON.stringify(expected.sort()) === JSON.stringify(actual.sort());
      }

      if (typeof expected === 'object' && typeof actual === 'object') {
        return JSON.stringify(expected) === JSON.stringify(actual);
      }

      return actual === expected;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const sandboxExecutor = new SandboxExecutor();