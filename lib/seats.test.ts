// Run: npx tsx lib/seats.test.ts
import assert from 'node:assert';
import { seatLimit, hasSeatAvailable } from './seats';

// tier → limit
assert.equal(seatLimit('free'), 2);
assert.equal(seatLimit('growth'), 5);
assert.equal(seatLimit('pro'), 15);
assert.equal(seatLimit('enterprise'), Infinity);

// unknown / null → free (fail closed to the smallest allowance)
assert.equal(seatLimit(null), 2);
assert.equal(seatLimit(undefined), 2);
assert.equal(seatLimit('mystery'), 2);

// boundary: free plan, 2 seats
assert.equal(hasSeatAvailable('free', 0), true);
assert.equal(hasSeatAvailable('free', 1), true);
assert.equal(hasSeatAvailable('free', 2), false); // full
assert.equal(hasSeatAvailable('free', 3), false);

// enterprise is effectively unlimited
assert.equal(hasSeatAvailable('enterprise', 10_000), true);

console.log('seats: all assertions passed');
