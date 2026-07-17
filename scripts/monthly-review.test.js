import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultReviewMonth, generateMonthlyReview } from './lib/monthly-review.js';

test('generates a monthly review with local paths and zero-result searches', () => {
  const output = generateMonthlyReview({
    month: '2026-07',
    history: {
      pageViews: { '/posts/example/': 3, '/': 1 },
      completedArticles: { example: '2026-07-16T00:00:00.000Z' },
      searchQueries: [
        { query: 'FPGA 时序', resultCount: 0 },
        { query: 'FPGA 时序', resultCount: 0 },
        { query: 'Markdown', resultCount: 2 },
      ],
      totalLocalViews: 4,
      lastVisitAt: '2026-07-16T00:00:00.000Z',
    },
  });

  assert.match(output, /2026 年 7 月博客复盘/);
  assert.match(output, /\| \/posts\/example\/ \| 3 \|/);
  assert.match(output, /\| FPGA 时序 \| 2 \|/);
  assert.match(output, /本机标记读完文章：1/);
});

test('rejects invalid months and formats the default month', () => {
  assert.throws(() => generateMonthlyReview({ month: '2026-13' }), /YYYY-MM/);
  assert.equal(defaultReviewMonth(new Date(2026, 6, 16)), '2026-07');
});
