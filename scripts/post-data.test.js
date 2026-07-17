import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateReadingTime, extractHeadings } from '../build/postData.js';

test('extracts stable article headings while ignoring fenced code', () => {
  const headings = extractHeadings(`
## Overview
### Details
\`\`\`
## Not a heading
\`\`\`
## Overview
  `);

  assert.deepEqual(headings, [
    { level: 2, text: 'Overview', id: 'overview' },
    { level: 3, text: 'Details', id: 'details' },
    { level: 2, text: 'Overview', id: 'overview-2' },
  ]);
});

test('calculates a minimum one-minute reading time', () => {
  assert.equal(calculateReadingTime('short note'), 1);
  assert.equal(calculateReadingTime('a'.repeat(1001)), 3);
});
