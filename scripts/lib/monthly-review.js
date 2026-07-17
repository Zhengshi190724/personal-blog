function normalizeMonth(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error('月份必须使用 YYYY-MM 格式，例如 2026-07。');
  }
  return month;
}

function safeText(value) {
  return String(value).replace(/[\r\n|]/g, ' ').trim();
}

function sortedEntries(value = {}) {
  return Object.entries(value)
    .map(([key, count]) => [safeText(key), Number(count) || 0])
    .filter(([key, count]) => key && count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
}

function summarizeNoResultSearches(searchQueries = []) {
  const counts = new Map();
  searchQueries
    .filter((item) => item && Number(item.resultCount) === 0 && item.query)
    .forEach((item) => {
      const query = safeText(item.query);
      counts.set(query, (counts.get(query) || 0) + 1);
    });
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
}

function renderRows(entries, emptyLabel) {
  if (!entries.length) return `| ${emptyLabel} | - |`;
  return entries.slice(0, 10).map(([label, count]) => `| ${label} | ${count} |`).join('\n');
}

export function generateMonthlyReview({ month, history = {} }) {
  const normalizedMonth = normalizeMonth(month);
  const [year, monthNumber] = normalizedMonth.split('-');
  const pageViews = sortedEntries(history.pageViews);
  const noResultSearches = summarizeNoResultSearches(history.searchQueries);
  const completedCount = Object.keys(history.completedArticles || {}).length;

  return `# ${year} 年 ${Number(monthNumber)} 月博客复盘

> 本文档由 \`npm run review:month\` 生成。Cloudflare 数据需要从项目后台手动填写；本地阅读记录只代表导出该文件的浏览器。

## Cloudflare Web Analytics

| 指标 | 本月数据 | 环比 | 备注 |
|---|---:|---:|---|
| Visits | 待填写 | 待填写 | 去重访问趋势 |
| Page views | 待填写 | 待填写 | 页面浏览总量 |
| 平均加载时间 | 待填写 | 待填写 | 关注突增页面 |
| LCP | 待填写 | 待填写 | Core Web Vitals |
| INP | 待填写 | 待填写 | Core Web Vitals |
| CLS | 待填写 | 待填写 | Core Web Vitals |

### 热门内容与来源

- 热门文章：待填写
- 主要来源：待填写
- 主要设备：待填写
- 跳出或退出较高页面：待填写

## 本机阅读记录

- 本机累计页面访问：${Number(history.totalLocalViews) || 0}
- 本机标记读完文章：${completedCount}
- 最后访问时间：${safeText(history.lastVisitAt || '无记录')}

### 本机常访问路径

| 路径 | 次数 |
|---|---:|
${renderRows(pageViews, '无本机访问记录')}

### 无结果搜索词

| 搜索词 | 次数 |
|---|---:|
${renderRows(noResultSearches, '无记录')}

## 内容判断

- 本月表现最好的文章及原因：
- 值得补充或重写的文章：
- 无结果搜索词对应的新内容机会：
- 下月准备发布的主题：

## 行动项

- [ ] 修复高退出页面的标题、开头或内部链接
- [ ] 为热门文章补充系列导航和相关推荐
- [ ] 处理有价值的无结果搜索词
- [ ] 检查移动端 Core Web Vitals
- [ ] 记录下月可验证的一个改进假设
`;
}

export function defaultReviewMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
