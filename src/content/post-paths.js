export function normalizePostRelativePath(value = '') {
  return String(value)
    .replaceAll('\\', '/')
    .replace(/^.*\/content\//, '')
    .replace(/^\/+/, '');
}

function slugSegment(value) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function postSlugFromRelativePath(value) {
  const relativePath = normalizePostRelativePath(value).replace(/\.md$/i, '');
  const segments = relativePath.split('/').filter(Boolean);
  if (segments.length === 1) return segments[0];
  return slugSegment(segments.join('-'));
}
