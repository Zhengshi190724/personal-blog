import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { calculateReadingTime, extractHeadings, loadPostRecords } from '../build/postData.js';

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

test('loads nested posts and derives stable path-based slugs', () => {
  const contentDir = mkdtempSync(resolve(tmpdir(), 'blog-content-'));
  try {
    const folder = resolve(contentDir, 'AAT', '关键词');
    mkdirSync(folder, { recursive: true });
    writeFileSync(resolve(folder, '因果.md'), `---
title: "行测言语：因果关系"
date: "2026-07-20"
tags:
  - 行测
category: "学习"
subcategory: "AAT"
featured: "false"
draft: "false"
excerpt: "因果关系学习笔记。"
---

## 因果关系

正文。
`);
    const posts = loadPostRecords(contentDir);
    assert.equal(posts.length, 1);
    assert.equal(posts[0].slug, 'aat-关键词-因果');
    assert.equal(posts[0].sourcePath, 'AAT/关键词/因果.md');
  } finally {
    rmSync(contentDir, { recursive: true, force: true });
  }
});
