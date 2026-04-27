import { autoGradingEngine } from '../lib/autoGradingEngine';

async function testAutoGrading() {
  console.log('Testing auto-grading engine...');

  // Test submission
  const submission = {
    candidateId: 'test-candidate',
    questionId: 'test-question',
    language: 'javascript',
    code: `
function solution(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
    `,
    testCases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        expected: [0, 1]
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        expected: [1, 2]
      },
      {
        input: { nums: [3, 3], target: 6 },
        expected: [0, 1]
      }
    ],
    context: {
      question: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      expectedApproach: 'Use a hash map to store numbers and their indices, checking for complements on each iteration.',
      difficulty: 'easy'
    }
  };

  try {
    const result = await autoGradingEngine.gradeSubmission(submission);
    console.log('Grading result:', JSON.stringify(result, null, 2));

    // Validate the result structure
    if (result.score >= 0 && result.score <= 100) {
      console.log('✅ Score is within valid range');
    } else {
      console.log('❌ Score is out of range');
    }

    if (result.breakdown.correctness >= 0 && result.breakdown.correctness <= 100) {
      console.log('✅ Correctness score is valid');
    } else {
      console.log('❌ Correctness score is invalid');
    }

    console.log('✅ Auto-grading test completed successfully');
  } catch (error) {
    console.error('❌ Auto-grading test failed:', error);
  }
}

testAutoGrading();