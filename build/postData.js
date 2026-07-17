import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatPostErrors, isPublishedPost, validatePost } from '../src/content/post-schema.js';

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
  const posts = readdirSync(contentDir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const slug = name.replace(/\.md$/, '');
      const filepath = resolve(contentDir, name);
      const result = validatePost(readFileSync(filepath, 'utf8'), { slug });
      if (result.errors.length > 0) {
        failures.push(formatPostErrors(`src/content/${name}`, result.errors));
      }

      return {
        slug,
        ...result.metadata,
        readingTime: calculateReadingTime(result.content),
        headings: extractHeadings(result.content),
        ...(includeContent ? { content: result.content } : {}),
      };
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
