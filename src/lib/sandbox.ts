import { spawn } from 'child_process';

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeUsed: number;
  passed: boolean;
}

export async function executeCode(code: string, language: 'python' | 'javascript' | 'java', testCases: TestCase[]): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];

  for (const testCase of testCases) {
    const start = Date.now();
    const args = ['run', '--rm', '--network', 'none', '--memory', '256m', '--cpus', '0.5', 'sandbox', '/bin/bash', '/home/sandbox/run.sh'];

    const proc = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, LANGUAGE: language, CODE: code } });

    proc.stdin.write(testCase.input);
    proc.stdin.end();

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => stdout += data.toString());
    proc.stderr.on('data', (data) => stderr += data.toString());

    const exitCode = await new Promise<number>((resolve) => {
      proc.on('close', resolve);
    });

    const timeUsed = Date.now() - start;

    const passed = stdout.trim() === testCase.expectedOutput.trim();

    results.push({ stdout, stderr, exitCode, timeUsed, passed });
  }

  return results;
}