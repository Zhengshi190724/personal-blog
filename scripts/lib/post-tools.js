import { basename, dirname, isAbsolute, relative, resolve } from 'node:path';
import {
  ALLOWED_CATEGORIES,
  PLACEHOLDER_BODY,
  PLACEHOLDER_EXCERPT,
  isPublishedPost,
  parseFrontmatter,
  validatePost,
  validateSlug,
} from '../../src/content/post-schema.js';

export {
  ALLOWED_CATEGORIES,
  PLACEHOLDER_BODY,
  PLACEHOLDER_EXCERPT,
  isPublishedPost,
  parseFrontmatter,
  validatePost,
  validateSlug,
};

export function titleFromSlug(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function yamlString(value) {
  return JSON.stringify(String(value));
}

export function createPostTemplate({ title, date, category }) {
  return `---
title: ${yamlString(title)}
date: ${yamlString(date)}
updated: ${yamlString(date)}
tags: []
category: ${yamlString(category)}
featured: "false"
draft: "true"
excerpt: ${yamlString(PLACEHOLDER_EXCERPT)}
# series: "可选系列名称"
# seriesOrder: "1"
---

# ${title}

${PLACEHOLDER_BODY}
`;
}

export function resolvePostTarget(repoRoot, input) {
  if (!input?.trim()) throw new Error('请提供文章 slug 或 Markdown 文件路径。');

  const contentDir = resolve(repoRoot, 'src', 'content');
  const normalizedInput = input.trim().replace(/\\/g, '/');
  const candidate = normalizedInput.endsWith('.md') || normalizedInput.includes('/')
    ? resolve(repoRoot, normalizedInput)
    : resolve(contentDir, `${normalizedInput}.md`);

  if (dirname(candidate) !== contentDir || isAbsolute(relative(contentDir, candidate)) || relative(contentDir, candidate).startsWith('..')) {
    throw new Error('文章必须直接位于 src/content 目录中。');
  }

  const slug = basename(candidate, '.md');
  validateSlug(slug);
  return {
    absolutePath: candidate,
    repoPath: `src/content/${slug}.md`,
    slug,
  };
}

export function parseGitStatus(output) {
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => ({ status: line.slice(0, 2), path: line.slice(3).replace(/^"|"$/g, '') }));
}

export function analyzePublicationChanges(entries, targetRepoPath) {
  return {
    targetChanged: entries.some((entry) => entry.path === targetRepoPath),
    unrelated: entries.filter((entry) => entry.path !== targetRepoPath),
  };
}
