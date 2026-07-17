import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeReadingHistory } from '../src/utils/readingHistory.js';

test('migrates legacy local analytics into reading-history fields', () => {
  const history = normalizeReadingHistory({
    pageViews: { '/': 2 },
    completedArticles: { example: '2026-07-16T00:00:00.000Z' },
    searches: 5,
    totalViews: 3,
    lastVisitAt: '2026-07-16T00:00:00.000Z',
  });

  assert.deepEqual(history.pageViews, { '/': 2 });
  assert.equal(history.totalLocalViews, 3);
  assert.equal(history.legacySearchCount, 5);
  assert.deepEqual(history.searchQueries, []);
});

test('normalizes malformed reading-history values', () => {
  const history = normalizeReadingHistory({
    pageViews: { '/posts/': '4', broken: -1 },
    completedArticles: { valid: 'now', invalid: false },
    searchQueries: [{ query: '  FPGA  ', resultCount: '2' }, { query: '' }],
  });

  assert.deepEqual(history.pageViews, { '/posts/': 4, broken: 0 });
  assert.deepEqual(history.completedArticles, { valid: 'now' });
  assert.deepEqual(history.searchQueries, [{ query: 'FPGA', resultCount: 2, searchedAt: null }]);
});
