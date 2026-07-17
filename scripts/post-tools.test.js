import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import {
  analyzePublicationChanges,
  createPostTemplate,
  formatLocalDate,
  isPublishedPost,
  parseGitStatus,
  parseFrontmatter,
  resolvePostTarget,
  titleFromSlug,
  validatePost,
  validateSlug,
} from './lib/post-tools.js';

const validPost = `---
title: "FPGA 学习笔记"
date: "2026-07-14"
updated: "2026-07-15"
tags: ["FPGA", "note"]
category: "技术"
featured: "false"
draft: "false"
excerpt: "记录 FPGA 学习过程。"
---

# FPGA 学习笔记

这里是完整正文。
`;

test('validates and formats slugs', () => {
  assert.equal(validateSlug('fpga-learning-note'), 'fpga-learning-note');
  assert.equal(titleFromSlug('fpga-learning-note'), 'Fpga Learning Note');
  assert.throws(() => validateSlug('../secret'), /slug/);
  assert.throws(() => validateSlug('FPGA Note'), /slug/);
});

test('formats local dates', () => {
  assert.equal(formatLocalDate(new Date(2026, 6, 14)), '2026-07-14');
});

test('parses and validates a complete post', () => {
  const parsed = parseFrontmatter(validPost);
  assert.equal(parsed.data.title, 'FPGA 学习笔记');
  assert.deepEqual(parsed.data.tags, ['FPGA', 'note']);
  const result = validatePost(validPost, { slug: 'fpga-learning-note' });
  assert.deepEqual(result.errors, []);
  assert.equal(result.metadata.featured, false);
  assert.equal(result.metadata.draft, false);
  assert.equal(result.metadata.updated, '2026-07-15');
});

test('rejects template placeholders and invalid metadata', () => {
  const invalidPost = validPost
    .replace('2026-07-14', '2026-02-31')
    .replace('技术', '未知分类')
    .replace('记录 FPGA 学习过程。', '请填写文章摘要。');
  const errors = validatePost(invalidPost).errors.join(' ');
  assert.match(errors, /date/);
  assert.match(errors, /category/);
  assert.match(errors, /摘要/);
});

test('rejects unknown fields, duplicate tags, and invalid update dates', () => {
  const invalidPost = validPost
    .replace('updated: "2026-07-15"', 'updated: "2026-07-13"\nauthor: "Shane"')
    .replace('["FPGA", "note"]', '["FPGA", "fpga"]');
  const errors = validatePost(invalidPost).errors.join(' ');
  assert.match(errors, /updated 不能早于 date/);
  assert.match(errors, /不支持 Frontmatter 字段 author/);
  assert.match(errors, /重复标签/);
});

test('normalizes optional cover and series metadata', () => {
  const extendedPost = validPost.replace(
    'excerpt: "记录 FPGA 学习过程。"',
    'excerpt: "记录 FPGA 学习过程。"\ncover: "/images/posts/fpga/cover.webp"\nseries: "FPGA 入门"\nseriesOrder: "1"',
  );
  const result = validatePost(extendedPost);
  assert.deepEqual(result.errors, []);
  assert.equal(result.metadata.cover, '/images/posts/fpga/cover.webp');
  assert.equal(result.metadata.series, 'FPGA 入门');
  assert.equal(result.metadata.seriesOrder, 1);
});

test('requires a positive order for series posts', () => {
  const missingOrder = validPost.replace(
    'excerpt: "记录 FPGA 学习过程。"',
    'excerpt: "记录 FPGA 学习过程。"\nseries: "FPGA 入门"',
  );
  assert.match(validatePost(missingOrder).errors.join(' '), /seriesOrder/);

  const orphanOrder = validPost.replace(
    'excerpt: "记录 FPGA 学习过程。"',
    'excerpt: "记录 FPGA 学习过程。"\nseriesOrder: "0"',
  );
  const errors = validatePost(orphanOrder).errors.join(' ');
  assert.match(errors, /正整数/);
  assert.match(errors, /同时设置 series/);
});

test('excludes drafts from every shared publication pipeline', () => {
  assert.equal(isPublishedPost({ draft: false }), true);
  assert.equal(isPublishedPost({ draft: true }), false);
  assert.equal(isPublishedPost({}), false);
});

test('resolves posts only inside src/content', () => {
  const root = resolve('D:/example-blog');
  const target = resolvePostTarget(root, 'fpga-learning-note');
  assert.equal(target.repoPath, 'src/content/fpga-learning-note.md');
  assert.throws(() => resolvePostTarget(root, '../outside.md'), /src\/content/);
});

test('creates a safe template that must be completed before publishing', () => {
  const template = createPostTemplate({
    title: '发布脚本测试',
    date: '2026-07-14',
    category: '杂项',
  });
  const templateErrors = validatePost(template).errors.join(' ');
  assert.match(templateErrors, /tags/);
  assert.match(templateErrors, /摘要/);
  assert.match(templateErrors, /正文模板提示/);

  const completed = template
    .replace('tags: []', 'tags: ["test"]')
    .replace('draft: "true"', 'draft: "false"')
    .replace('请填写文章摘要。', '验证发布脚本。')
    .replace('从这里开始编写正文。', '这里是测试正文。');
  assert.deepEqual(validatePost(completed).errors, []);
});

test('detects unrelated Git changes without staging them', () => {
  const entries = parseGitStatus(' M src/content/fpga-note.md\n?? docs/draft.md\n');
  const analysis = analyzePublicationChanges(entries, 'src/content/fpga-note.md');
  assert.equal(analysis.targetChanged, true);
  assert.deepEqual(analysis.unrelated, [{ status: '??', path: 'docs/draft.md' }]);
});
