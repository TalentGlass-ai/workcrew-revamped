// scripts/process-feedback-learning.ts
import { feedbackLearningEngine } from '../lib/services/feedback-learning-engine';

async function main() {
  console.log('🚀 Starting feedback learning batch processing...\n');

  try {
    await feedbackLearningEngine.processBatchFeedback();

    console.log('\n✅ Feedback learning processing completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error processing feedback learning:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as processFeedbackLearning };