// Run: npx tsx lib/capabilities.test.ts
import assert from 'node:assert';
import { test } from 'vitest';
import { can } from './capabilities';

test('capability matrix', () => {
// interviewer: view + interviews only — NOT jobs/pipeline/team
assert.equal(can('interviewer', 'manageInterviews'), true);
assert.equal(can('interviewer', 'managePipeline'), false);
assert.equal(can('interviewer', 'manageJobs'), false);
assert.equal(can('interviewer', 'manageTeam'), false);

// hiring_manager: everything except team
assert.equal(can('hiring_manager', 'manageJobs'), true);
assert.equal(can('hiring_manager', 'managePipeline'), true);
assert.equal(can('hiring_manager', 'manageInterviews'), true);
assert.equal(can('hiring_manager', 'manageTeam'), false);

// recruiter + admin: full
for (const r of ['recruiter', 'admin']) {
  assert.equal(can(r, 'manageJobs'), true);
  assert.equal(can(r, 'managePipeline'), true);
  assert.equal(can(r, 'manageInterviews'), true);
  assert.equal(can(r, 'manageTeam'), true);
}

// unknown role / candidate / null: nothing
for (const r of ['candidate', 'nonsense', null, undefined]) {
  assert.equal(can(r, 'manageJobs'), false);
  assert.equal(can(r, 'manageInterviews'), false);
}
});
