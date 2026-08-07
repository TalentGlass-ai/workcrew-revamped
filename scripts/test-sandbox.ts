import { sandboxExecutor } from '../lib/sandbox';

async function test() {
  // Test Python
  const pythonCode = 'print(input())';
  const pythonTests = [{ input: 'hello', expected: 'hello' }];
  const pythonResults = await sandboxExecutor.runTestCases(pythonCode, 'python', pythonTests);
  console.log('Python results:', pythonResults);

  // Test JavaScript
  const jsCode = 'console.log(require("fs").readFileSync(0, "utf-8").trim())';
  const jsTests = [{ input: 'world', expected: 'world' }];
  const jsResults = await sandboxExecutor.runTestCases(jsCode, 'javascript', jsTests);
  console.log('JS results:', jsResults);

  // Test Java
  const javaCode = `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner s = new Scanner(System.in);
    System.out.println(s.nextLine());
  }
}`;
  const javaTests = [{ input: 'test', expected: 'test' }];
  const javaResults = await sandboxExecutor.runTestCases(javaCode, 'java', javaTests);
  console.log('Java results:', javaResults);
}

test();