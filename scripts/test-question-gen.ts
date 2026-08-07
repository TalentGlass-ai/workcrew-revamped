import { generateQuestion } from '../lib/questionGenerator';

async function testQuestionGen() {
  try {
    console.log('Testing question generation...');

    const question1 = await generateQuestion('JavaScript');
    console.log('Generated question:', question1);

    const question2 = await generateQuestion('React', 2);
    console.log('Harder question:', question2);

    console.log('Question generation test passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testQuestionGen();