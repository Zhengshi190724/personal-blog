export const ALLOWED_CATEGORIES = ['技术', '生活', '娱乐', '杂项'];
export const PLACEHOLDER_EXCERPT = '请填写文章摘要。';
export const PLACEHOLDER_BODY = '从这里开始编写正文。';

const REQUIRED_FIELDS = ['title', 'date', 'tags', 'category', 'featured', 'draft', 'excerpt'];
const OPTIONAL_FIELDS = ['updated', 'cover', 'series', 'seriesOrder'];
const ALLOWED_FIELDS = new Set([...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]);

export function validateSlug(slug) {
  if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(slug || '')) {
    throw new Error('slug 只能包含小写英文字母、数字、连字符或兼容旧文章的下划线，例如 fpga-learning-note。');
  }
  return slug;
}

function splitInlineArray(value) {
  const items = [];
  let current = '';
  let quote = '';

  for (const character of value) {
    if ((character === '"' || character === "'") && (!quote || quote === character)) {
      quote = quote ? '' : character;
      current += character;
    } else if (character === ',' && !quote) {
      items.push(current);
      current = '';
    } else {
      current += character;
    }
  }

  if (quote) throw new Error('数组中存在未闭合的引号。');
  items.push(current);
  return items;
}

function unquote(value) {
  const trimmed = value.trim();
  const quoted = (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"));
  return quoted ? trimmed.slice(1, -1) : trimmed;
}

function parseValue(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('[')) return unquote(trimmed);
  if (!trimmed.endsWith(']')) throw new Error('数组必须以 ] 结束。');

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];
  return splitInlineArray(inner).map((item) => unquote(item));
}

export function parseFrontmatter(raw) {
  const source = String(raw).replace(/^\uFEFF/, '');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: source, hasFrontmatter: false, parseErrors: [] };
  }

  const data = {};
  const parseErrors = [];

  match[1].split(/\r?\n/).forEach((line, index) => {
    if (!line.trim() || line.trimStart().startsWith('#')) return;
    const separator = line.indexOf(':');
    if (separator === -1) {
      parseErrors.push(`Frontmatter 第 ${index + 1} 行缺少冒号。`);
      return;
    }

    const key = line.slice(0, separator).trim();
    if (!key) {
      parseErrors.push(`Frontmatter 第 ${index + 1} 行缺少字段名。`);
      return;
    }
    if (Object.hasOwn(data, key)) {
      parseErrors.push(`字段 ${key} 重复定义。`);
      return;
    }

    try {
      data[key] = parseValue(line.slice(separator + 1));
    } catch (error) {
      parseErrors.push(`字段 ${key} 无法解析：${error.message}`);
    }
  });

  return { data, content: match[2], hasFrontmatter: true, parseErrors };
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function presentString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeMetadata(data) {
  return {
    title: typeof data.title === 'string' ? data.title.trim() : '',
    date: typeof data.date === 'string' ? data.date : '',
    updated: typeof data.updated === 'string' && data.updated ? data.updated : '',
    tags: Array.isArray(data.tags) ? data.tags.map((tag) => tag.trim()) : [],
    category: typeof data.category === 'string' ? data.category : '',
    featured: data.featured === 'true',
    draft: data.draft === 'true',
    excerpt: typeof data.excerpt === 'string' ? data.excerpt.trim() : '',
    cover: typeof data.cover === 'string' ? data.cover.trim() : '',
    series: typeof data.series === 'string' ? data.series.trim() : '',
    seriesOrder: /^\d+$/.test(data.seriesOrder || '') ? Number(data.seriesOrder) : 0,
  };
}

export function validatePost(raw, { slug = '' } = {}) {
  const parsed = parseFrontmatter(raw);
  const { data, content, hasFrontmatter, parseErrors } = parsed;
  const errors = [...parseErrors];

  if (!hasFrontmatter) errors.push('缺少 Frontmatter（文件开头和结尾的 --- 区块）。');

  REQUIRED_FIELDS.forEach((field) => {
    if (!Object.hasOwn(data, field)) errors.push(`缺少 ${field}。`);
  });

  Object.keys(data).forEach((field) => {
    if (!ALLOWED_FIELDS.has(field)) errors.push(`不支持 Frontmatter 字段 ${field}。`);
  });

  if (slug) {
    try {
      validateSlug(slug);
    } catch (error) {
      errors.push(error.message);
    }
  }

  if (Object.hasOwn(data, 'title') && !presentString(data.title)) errors.push('title 必须是非空字符串。');
  if (Object.hasOwn(data, 'date') && !validDate(data.date)) errors.push('date 必须是有效的 YYYY-MM-DD 日期。');
  if (Object.hasOwn(data, 'updated')) {
    if (!validDate(data.updated)) errors.push('updated 必须是有效的 YYYY-MM-DD 日期。');
    if (validDate(data.updated) && validDate(data.date) && data.updated < data.date) {
      errors.push('updated 不能早于 date。');
    }
  }

  if (Object.hasOwn(data, 'tags')) {
    if (!Array.isArray(data.tags) || data.tags.length === 0) {
      errors.push('tags 至少需要一个标签，并使用 ["tag"] 数组格式。');
    } else {
      if (data.tags.some((tag) => !presentString(tag))) errors.push('tags 不能包含空标签。');
      const normalizedTags = data.tags.map((tag) => tag.trim().toLocaleLowerCase());
      if (new Set(normalizedTags).size !== normalizedTags.length) errors.push('tags 不能包含重复标签。');
    }
  }

  if (Object.hasOwn(data, 'category') && !ALLOWED_CATEGORIES.includes(data.category)) {
    errors.push(`category 必须是：${ALLOWED_CATEGORIES.join('、')}。`);
  }
  for (const field of ['featured', 'draft']) {
    if (Object.hasOwn(data, field) && !['true', 'false'].includes(data[field])) {
      errors.push(`${field} 必须是 "true" 或 "false"。`);
    }
  }

  if (Object.hasOwn(data, 'excerpt') && !presentString(data.excerpt)) errors.push('excerpt 必须是非空字符串。');
  if (data.excerpt === PLACEHOLDER_EXCERPT) errors.push('请将模板中的文章摘要替换为真实内容。');

  if (Object.hasOwn(data, 'cover')) {
    if (!presentString(data.cover)) {
      errors.push('cover 存在时不能为空。');
    } else if (!data.cover.startsWith('/') && !/^https:\/\//i.test(data.cover)) {
      errors.push('cover 必须是以 / 开头的站内路径或 HTTPS 地址。');
    } else if (data.cover.includes('\\') || data.cover.split('/').includes('..')) {
      errors.push('cover 路径不能包含反斜杠或 ..。');
    }
  }
  if (Object.hasOwn(data, 'series') && !presentString(data.series)) errors.push('series 存在时不能为空。');
  if (Object.hasOwn(data, 'seriesOrder') && !/^[1-9]\d*$/.test(data.seriesOrder || '')) {
    errors.push('seriesOrder 必须是从 1 开始的正整数。');
  }
  if (Object.hasOwn(data, 'series') && !Object.hasOwn(data, 'seriesOrder')) {
    errors.push('设置 series 时必须同时设置 seriesOrder。');
  }
  if (Object.hasOwn(data, 'seriesOrder') && !Object.hasOwn(data, 'series')) {
    errors.push('设置 seriesOrder 时必须同时设置 series。');
  }

  const body = content.trim();
  if (!body) errors.push('文章正文不能为空。');
  const meaningfulLines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (meaningfulLines.includes(PLACEHOLDER_BODY) && meaningfulLines.length <= 2) {
    errors.push('请删除正文模板提示并填写真实内容。');
  }

  return {
    ...parsed,
    metadata: normalizeMetadata(data),
    errors: [...new Set(errors)],
  };
}

export function formatPostErrors(label, errors) {
  return `${label}:\n${errors.map((error) => `  - ${error}`).join('\n')}`;
}

export function isPublishedPost(post) {
  return post?.draft === false;
}
