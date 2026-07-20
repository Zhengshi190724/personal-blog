export function normalizeArticleMediaPath(value = '') {
  const source = String(value).trim();
  if (!source || /^(?:https?:|data:|blob:)/i.test(source)) return source;

  const normalized = source.replaceAll('\\', '/');
  const publicImageMatch = normalized.match(/(?:^|\/)public\/(images\/.+)$/);
  if (publicImageMatch) return `/${publicImageMatch[1]}`;
  if (normalized.startsWith('images/')) return `/${normalized}`;
  return normalized;
}
