export function normalizeArticleMediaPath(value = '') {
  const source = String(value).trim();
  if (!source || /^(?:https?:|data:|blob:)/i.test(source)) return source;

  const normalized = source.replaceAll('\\', '/');
  const publicImagesIndex = normalized.indexOf('public/images/');
  if (publicImagesIndex >= 0) {
    return `/${normalized.slice(publicImagesIndex + 'public/'.length)}`;
  }
  if (normalized.startsWith('images/')) return `/${normalized}`;
  return normalized;
}
