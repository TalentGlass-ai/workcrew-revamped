import { executeCode } from '../src/lib/sandbox';

async function test() {
  // Test Python
  const pythonCode = 'print(input())';
  const pythonTests = [{ input: 'hello', expectedOutput: 'hello' }];
  const pythonResults = await executeCode(pythonCode, 'python', pythonTests);
  console.log('Python results:', pythonResults);

  // Test JavaScript
  const jsCode = 'console.log(require("fs").readFileSync(0, "utf-8").trim())';
  const jsTests = [{ input: 'world', expectedOutput: 'world' }];
  const jsResults = await executeCode(jsCode, 'javascript', jsTests);
  console.log('JS results:', jsResults);

  // Test Java
  const javaCode = `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner s = new Scanner(System.in);
    System.out.println(s.nextLine());
  }
}`;
  const javaTests = [{ input: 'test', expectedOutput: 'test' }];
  const javaResults = await executeCode(javaCode, 'java', javaTests);
  console.log('Java results:', javaResults);
}

test();