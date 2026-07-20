import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { formatPostErrors, isPublishedPost, validatePost } from '../src/content/post-schema.js';
import { postSlugFromRelativePath } from '../src/content/post-paths.js';
import { getContentClassification } from '../src/config/navigation.js';

export function findMarkdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.')) return [];
    const filepath = resolve(directory, entry.name);
    if (entry.isDirectory()) return findMarkdownFiles(filepath);
    return entry.isFile() && entry.name.endsWith('.md') ? [filepath] : [];
  });
}

function cleanHeadingText(value) {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .trim();
}

export function extractHeadings(content) {
  const headings = [];
  const slugCounts = new Map();
  let inCodeBlock = false;

  content.split(/\r?\n/).forEach((line) => {
    if (/^```/.test(line.trim())) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) return;

    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*$/);
    if (!match) return;

    const text = cleanHeadingText(match[2]);
    const baseSlug = text
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section';
    const count = slugCounts.get(baseSlug) || 0;
    slugCounts.set(baseSlug, count + 1);

    headings.push({
      level: match[1].length,
      text,
      id: count === 0 ? baseSlug : `${baseSlug}-${count + 1}`,
    });
  });

  return headings;
}

export function calculateReadingTime(content) {
  const textLength = content.replace(/[#*`>\[\]()_-]/g, '').length;
  return Math.max(1, Math.ceil(textLength / 500));
}

export function loadPostRecords(contentDir, { includeContent = false } = {}) {
  const failures = [];
  const posts = findMarkdownFiles(contentDir)
    .map((filepath) => {
      const sourcePath = relative(contentDir, filepath).replaceAll('\\', '/');
      const slug = postSlugFromRelativePath(sourcePath);
      const result = validatePost(readFileSync(filepath, 'utf8'), { slug });
      const classification = getContentClassification(sourcePath);
      if (classification && (
        result.metadata.category !== classification.category.name
        || result.metadata.subcategory !== classification.subcategory.name
      )) {
        result.errors.push(
          `文件夹 ${sourcePath.split('/')[0]} 要求 category 为“${classification.category.name}”、subcategory 为“${classification.subcategory.name}”。`,
        );
      }
      if (result.errors.length > 0) {
        failures.push(formatPostErrors(`src/content/${sourcePath}`, result.errors));
      }

      return {
        slug,
        sourcePath,
        ...result.metadata,
        readingTime: calculateReadingTime(result.content),
        headings: extractHeadings(result.content),
        ...(includeContent ? { content: result.content } : {}),
      };
    });

  const slugOwners = new Map();
  posts.forEach((post) => {
    if (slugOwners.has(post.slug)) {
      failures.push(`文章 slug 重复：${post.slug}\n  - ${slugOwners.get(post.slug)}\n  - src/content/${post.sourcePath}`);
    } else {
      slugOwners.set(post.slug, `src/content/${post.sourcePath}`);
    }
  });

  if (failures.length > 0) {
    throw new Error(`Content validation failed:\n\n${failures.join('\n\n')}`);
  }

  const publishedPosts = posts.filter(isPublishedPost);
  const seriesOrders = new Map();
  publishedPosts.filter((post) => post.series).forEach((post) => {
    const key = `${post.series}\0${post.seriesOrder}`;
    if (seriesOrders.has(key)) {
      throw new Error(`系列“${post.series}”的顺序 ${post.seriesOrder} 同时用于 ${seriesOrders.get(key)} 和 ${post.slug}。`);
    }
    seriesOrders.set(key, post.slug);
  });

  return publishedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
}
