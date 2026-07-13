const STORAGE_KEY = 'shane-blog-analytics-v1';
let lastTrackedPath = null;

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      pageViews: {},
      completedArticles: {},
      searches: 0,
      totalViews: 0,
    };
  } catch {
    return { pageViews: {}, completedArticles: {}, searches: 0, totalViews: 0 };
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent('blog:analytics', { detail: store }));
  } catch {
    // Analytics must never interrupt reading when storage is unavailable.
  }
}

export function trackPageView(path) {
  if (lastTrackedPath === path) return;
  lastTrackedPath = path;
  const store = readStore();
  store.pageViews[path] = (store.pageViews[path] || 0) + 1;
  store.totalViews = (store.totalViews || 0) + 1;
  store.lastVisitAt = new Date().toISOString();
  writeStore(store);
}

export function trackArticleCompletion(slug) {
  const store = readStore();
  if (store.completedArticles[slug]) return;
  store.completedArticles[slug] = new Date().toISOString();
  writeStore(store);
}

export function trackSearchUse() {
  const store = readStore();
  store.searches = (store.searches || 0) + 1;
  writeStore(store);
}

export function getLocalAnalytics() {
  return readStore();
}
