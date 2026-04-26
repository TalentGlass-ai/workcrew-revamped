#!/usr/bin/env node

import { getSkillService } from '../lib/services/skill-normalization';

async function seedSkills() {
  console.log('Initializing skill normalization service...');

  const skillService = getSkillService();
  await skillService.initialize();

  console.log('Seeding skills...');
  await skillService.seedSkills();

  console.log('Getting skill stats...');
  const stats = await skillService.getSkillStats();
  console.log('Skill seeding complete:', stats);

  process.exit(0);
}

seedSkills().catch(error => {
  console.error('Failed to seed skills:', error);
  process.exit(1);
});