import { formatPostErrors, isPublishedPost, validatePost } from '../content/post-schema.js';

const modules = import.meta.glob('../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

let _posts = null;

function cleanHeadingText(value) {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .trim();
}

function extractHeadings(content) {
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

function loadPosts() {
  if (_posts) return _posts;

  _posts = Object.entries(modules)
    .map(([filepath, raw]) => {
      const slug = filepath.split('/').pop().replace(/\.md$/, '');
      const result = validatePost(raw, { slug });
      if (result.errors.length > 0) {
        throw new Error(formatPostErrors(filepath, result.errors));
      }

      return {
        slug,
        ...result.metadata,
        content: result.content,
        readingTime: Math.max(1, Math.ceil(result.content.replace(/[#*`>\[\]()_-]/g, '').length / 500)),
        headings: extractHeadings(result.content),
      };
    })
    .filter(isPublishedPost)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return _posts;
}

export function getAllPosts() {
  return loadPosts();
}

export function getPostBySlug(slug) {
  return getAllPosts().find((post) => post.slug === slug) || null;
}

export function getPostsByTag(tag) {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function getPostsByCategory(category) {
  return getAllPosts().filter((post) => post.category === category);
}

export function getFeaturedPosts() {
  return getAllPosts().filter((post) => post.featured);
}

export function getAllTags() {
  const tagMap = new Map();
  getAllPosts().forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAdjacentPosts(slug) {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { previous: null, next: null };

  return {
    previous: posts[index + 1] || null,
    next: posts[index - 1] || null,
  };
}

export function getRelatedPosts(slug, limit = 3) {
  const posts = getAllPosts();
  const current = posts.find((post) => post.slug === slug);
  if (!current) return [];

  return posts
    .filter((post) => post.slug !== slug)
    .map((post) => ({
      post,
      score: post.tags.filter((tag) => current.tags.includes(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.post.date) - new Date(a.post.date))
    .slice(0, limit)
    .map(({ post }) => post);
}
