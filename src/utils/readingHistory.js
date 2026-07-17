const STORAGE_KEY = 'sz-blog-reading-history-v2';
const LEGACY_STORAGE_KEY = 'shane-blog-analytics-v1';
const MAX_SEARCHES = 100;
let lastTrackedPath = null;
let lastSearchSignature = null;

function emptyHistory() {
  return {
    pageViews: {},
    completedArticles: {},
    searchQueries: [],
    totalLocalViews: 0,
    legacySearchCount: 0,
    lastVisitAt: null,
  };
}

function normalizeCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
}

function normalizeMap(value, mapValue) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [String(key), mapValue(item)])
      .filter(([key, item]) => key && item !== null),
  );
}

export function normalizeReadingHistory(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const pageViews = normalizeMap(source.pageViews, normalizeCount);
  const completedArticles = normalizeMap(source.completedArticles, (item) => (
    typeof item === 'string' && item ? item : null
  ));
  const searchQueries = Array.isArray(source.searchQueries)
    ? source.searchQueries
      .filter((item) => item && typeof item.query === 'string' && item.query.trim())
      .map((item) => ({
        query: item.query.trim(),
        resultCount: normalizeCount(item.resultCount),
        searchedAt: typeof item.searchedAt === 'string' ? item.searchedAt : null,
      }))
      .slice(-MAX_SEARCHES)
    : [];

  return {
    ...emptyHistory(),
    pageViews,
    completedArticles,
    searchQueries,
    totalLocalViews: normalizeCount(source.totalLocalViews ?? source.totalViews),
    legacySearchCount: normalizeCount(source.legacySearchCount ?? source.searches),
    lastVisitAt: typeof source.lastVisitAt === 'string' ? source.lastVisitAt : null,
  };
}

function readStoredValue(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readHistory() {
  if (typeof localStorage === 'undefined') return emptyHistory();

  const current = readStoredValue(STORAGE_KEY);
  if (current) return normalizeReadingHistory(current);

  const legacy = readStoredValue(LEGACY_STORAGE_KEY);
  const migrated = normalizeReadingHistory(legacy || {});
  if (legacy) writeHistory(migrated);
  return migrated;
}

function writeHistory(history) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    window.dispatchEvent(new CustomEvent('blog:reading-history', { detail: history }));
  } catch {
    // Reading history must never interrupt the site when storage is unavailable.
  }
}

export function recordLocalPageVisit(path) {
  if (!path || lastTrackedPath === path) return;
  lastTrackedPath = path;
  const history = readHistory();
  history.pageViews[path] = (history.pageViews[path] || 0) + 1;
  history.totalLocalViews += 1;
  history.lastVisitAt = new Date().toISOString();
  writeHistory(history);
}

export function recordArticleCompletion(slug) {
  if (!slug) return;
  const history = readHistory();
  if (history.completedArticles[slug]) return;
  history.completedArticles[slug] = new Date().toISOString();
  writeHistory(history);
}

export function recordSearchQuery(query, resultCount) {
  const normalizedQuery = String(query || '').replace(/\s+/g, ' ').trim();
  if (!normalizedQuery) return;

  const signature = `${normalizedQuery.toLocaleLowerCase('zh-CN')}|${normalizeCount(resultCount)}`;
  if (signature === lastSearchSignature) return;
  lastSearchSignature = signature;

  const history = readHistory();
  history.searchQueries = [
    ...history.searchQueries,
    {
      query: normalizedQuery,
      resultCount: normalizeCount(resultCount),
      searchedAt: new Date().toISOString(),
    },
  ].slice(-MAX_SEARCHES);
  writeHistory(history);
}

export function getReadingHistory() {
  return readHistory();
}

export function downloadReadingHistory() {
  if (typeof document === 'undefined') return;
  const blob = new Blob([`${JSON.stringify(readHistory(), null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sz-blog-reading-history-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
