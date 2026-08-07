#!/usr/bin/env node

import { getSkillOntologyService } from '../lib/services/skill-ontology';

async function seedOntology() {
  console.log('Initializing skill ontology service...');

  const ontologyService = getSkillOntologyService();
  await ontologyService.initialize();

  console.log('Seeding skill ontology...');
  await ontologyService.seedOntology();

  console.log('Getting ontology stats...');
  const stats = await ontologyService.getOntologyStats();
  console.log('Ontology seeding complete:', stats);

  process.exit(0);
}

seedOntology().catch(error => {
  console.error('Failed to seed ontology:', error);
  process.exit(1);
});