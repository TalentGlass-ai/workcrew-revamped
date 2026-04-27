import { generateQuestion } from '../src/lib/questionGenerator';

async function testQuestionGen() {
  try {
    console.log('Testing question generation...');

    // Test basic question
    const question1 = await generateQuestion('JavaScript');
    console.log('Generated question:', question1);

    // Test with performance
    const question2 = await generateQuestion('React', { correct: 8, total: 10 });
    console.log('Adaptive question:', question2);

    console.log('Question generation test passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testQuestionGen();