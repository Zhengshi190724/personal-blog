import postMetadata from 'virtual:post-metadata';
import { normalizePostRelativePath } from '../content/post-paths.js';

const contentModules = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
});

const contentLoaders = Object.fromEntries(
  Object.entries(contentModules).map(([filepath, loader]) => {
    const sourcePath = normalizePostRelativePath(filepath);
    return [sourcePath, loader];
  }),
);
const contentCache = new Map();

export function getAllPosts() {
  return postMetadata;
}

export function getPostBySlug(slug) {
  return postMetadata.find((post) => post.slug === slug) || null;
}

export async function loadPostBySlug(slug) {
  const post = getPostBySlug(slug);
  const loader = contentLoaders[post?.sourcePath];
  if (!post || !loader) return null;
  if (!contentCache.has(slug)) {
    contentCache.set(slug, Promise.all([
      loader(),
      import('../content/post-schema.js'),
    ]).then(([raw, { parseFrontmatter }]) => ({
      ...post,
      content: parseFrontmatter(raw).content,
    })));
  }
  return contentCache.get(slug);
}

export function loadAllPostContents() {
  return Promise.all(postMetadata.map((post) => loadPostBySlug(post.slug)));
}

export function getPostsByTag(tag) {
  return postMetadata.filter((post) => post.tags.includes(tag));
}

export function getPostsByCategory(category) {
  return postMetadata.filter((post) => post.category === category);
}

export function getPostsBySubcategory(category, subcategory) {
  return postMetadata.filter((post) => (
    post.category === category && post.subcategory === subcategory
  ));
}

export function getFeaturedPosts() {
  return postMetadata.filter((post) => post.featured);
}

export function getPostsBySeries(series) {
  if (!series) return [];
  return postMetadata
    .filter((post) => post.series === series)
    .sort((a, b) => a.seriesOrder - b.seriesOrder || new Date(a.date) - new Date(b.date));
}

export function getAllTags() {
  const tagMap = new Map();
  postMetadata.forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAdjacentPosts(slug) {
  const index = postMetadata.findIndex((post) => post.slug === slug);
  if (index === -1) return { previous: null, next: null };

  return {
    previous: postMetadata[index + 1] || null,
    next: postMetadata[index - 1] || null,
  };
}

export function getRelatedPosts(slug, limit = 3) {
  const current = getPostBySlug(slug);
  if (!current) return [];

  return postMetadata
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => current.tags.includes(tag)).length;
      const sameSeries = Boolean(current.series && post.series === current.series);
      const sameCategory = post.category === current.category;
      const sameSubcategory = Boolean(
        current.subcategory && post.subcategory === current.subcategory,
      );
      return {
        post,
        score: sharedTags * 2 + (sameCategory ? 3 : 0) + (sameSubcategory ? 4 : 0) + (sameSeries ? 8 : 0),
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.post.date) - new Date(a.post.date))
    .slice(0, limit)
    .map(({ post }) => post);
}
