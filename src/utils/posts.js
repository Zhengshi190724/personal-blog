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

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const yamlBlock = match[1];
  const content = match[2];
  const data = {};

  for (const line of yamlBlock.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Parse arrays: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
    } else {
      value = [value];
    }

    data[key] = value;
  }

  return { data, content };
}

function loadPosts() {
  if (_posts) return _posts;

  _posts = Object.entries(modules)
    .map(([filepath, raw]) => {
      const { data, content } = parseFrontmatter(raw);
      const slug = filepath.split('/').pop().replace(/\.md$/, '');
      return {
        slug,
        title: data.title ? (Array.isArray(data.title) ? data.title[0] : data.title) : slug,
        date: data.date ? (Array.isArray(data.date) ? data.date[0] : data.date) : '',
        tags: data.tags || [],
        category: data.category?.[0] || '工具与工程实践',
        featured: data.featured?.[0] === 'true',
        excerpt: data.excerpt
          ? (Array.isArray(data.excerpt) ? data.excerpt[0] : data.excerpt)
          : content.replace(/^#.*$/m, '').trim().slice(0, 200) + '...',
        content,
        readingTime: Math.max(1, Math.ceil(content.replace(/[#*`>\[\]()_-]/g, '').length / 500)),
        headings: extractHeadings(content),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return _posts;
}

export function getAllPosts() {
  return loadPosts();
}

export function getPostBySlug(slug) {
  return getAllPosts().find((p) => p.slug === slug) || null;
}

export function getPostsByTag(tag) {
  return getAllPosts().filter((p) => p.tags.includes(tag));
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
