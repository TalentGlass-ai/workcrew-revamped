import { evaluateAnswer } from '../src/lib/evaluator';

async function testEvaluator() {
  try {
    console.log('Testing answer evaluation...');

    // Test multiple-choice
    const mcQuestion = {
      id: 'q1',
      questionType: 'multiple-choice',
      expectedAnswer: 'A) Option 1',
      weightage: 1.0
    };

    const mcResult1 = await evaluateAnswer(mcQuestion, 'A) Option 1');
    console.log('MC correct:', mcResult1);

    const mcResult2 = await evaluateAnswer(mcQuestion, 'B) Option 2');
    console.log('MC incorrect:', mcResult2);

    // Test code question (mock)
    const codeQuestion = {
      id: 'q2',
      questionType: 'code',
      weightage: 1.0,
      testCases: [
        { input: '2\n3\n', expectedOutput: '5' },
        { input: '10\n20\n', expectedOutput: '30' }
      ]
    };

    const codeResult = await evaluateAnswer(codeQuestion, 'const sum = (a, b) => a + b; console.log(sum(parseInt(process.argv[2]), parseInt(process.argv[3])));');
    console.log('Code evaluation:', codeResult);

    console.log('Evaluator test passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testEvaluator();