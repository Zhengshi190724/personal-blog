import { basename, dirname, isAbsolute, relative, resolve } from 'node:path';

export const ALLOWED_CATEGORIES = ['技术', '生活', '娱乐', '杂项'];
export const PLACEHOLDER_EXCERPT = '请填写文章摘要。';
export const PLACEHOLDER_BODY = '从这里开始编写正文。';

export function validateSlug(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('slug 只能包含小写英文字母、数字和单个连字符，例如 fpga-learning-note。');
  }
  return slug;
}

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
tags: []
category: ${yamlString(category)}
featured: "false"
excerpt: ${yamlString(PLACEHOLDER_EXCERPT)}
---

# ${title}

${PLACEHOLDER_BODY}
`;
}

function parseValue(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, ''));
  }
  return trimmed.replace(/^['"]|['"]$/g, '');
}

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw, hasFrontmatter: false };

  const data = {};
  match[1].split(/\r?\n/).forEach((line) => {
    const separator = line.indexOf(':');
    if (separator === -1) return;
    const key = line.slice(0, separator).trim();
    if (!key) return;
    data[key] = parseValue(line.slice(separator + 1));
  });

  return { data, content: match[2], hasFrontmatter: true };
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validatePost(raw) {
  const { data, content, hasFrontmatter } = parseFrontmatter(raw);
  const errors = [];

  if (!hasFrontmatter) errors.push('缺少 Frontmatter（文件开头和结尾的 --- 区块）。');
  if (!data.title) errors.push('缺少 title。');
  if (!validDate(data.date)) errors.push('date 必须是有效的 YYYY-MM-DD 日期。');
  if (!Array.isArray(data.tags) || data.tags.length === 0) errors.push('tags 至少需要一个标签。');
  if (!ALLOWED_CATEGORIES.includes(data.category)) errors.push(`category 必须是：${ALLOWED_CATEGORIES.join('、')}。`);
  if (!['true', 'false'].includes(data.featured)) errors.push('featured 必须是 "true" 或 "false"。');
  if (!data.excerpt) errors.push('缺少 excerpt。');
  if (data.excerpt === PLACEHOLDER_EXCERPT) errors.push('请将模板中的文章摘要替换为真实内容。');

  const body = content.trim();
  if (!body) errors.push('文章正文不能为空。');
  if (body.includes(PLACEHOLDER_BODY)) errors.push('请删除正文模板提示并填写真实内容。');

  return { data, content, errors };
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
