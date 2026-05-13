const modules = import.meta.glob('../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

let _posts = null;

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
        excerpt: data.excerpt
          ? (Array.isArray(data.excerpt) ? data.excerpt[0] : data.excerpt)
          : content.replace(/^#.*$/m, '').trim().slice(0, 200) + '...',
        content,
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
