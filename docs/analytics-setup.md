# 博客统计与月度复盘

## 数据边界

博客使用两类用途不同的数据：

- **Cloudflare Web Analytics**：用于观察整个线上网站的访问次数、来源、设备、加载性能和 Core Web Vitals。
- **浏览器本地阅读记录**：仅保存在当前设备的 `localStorage`，用于记录本机访问路径、读完的文章和搜索词。它不是全站访问统计，也不会自动上传。

旧版 `shane-blog-analytics-v1` 数据会在首次访问新版网站时迁移到 `sz-blog-reading-history-v2`。

## 启用 Cloudflare Web Analytics

1. 登录 Cloudflare Dashboard。
2. 进入 **Workers & Pages**，选择博客项目。
3. 打开 **Metrics**，选择 **Enable Web Analytics**。
4. 重新触发一次生产部署，让 Cloudflare 为 Pages 响应注入统计脚本。
5. 访问线上首页和一篇文章，随后检查 Metrics 中是否出现访问与页面性能数据。

本项目使用 `BrowserRouter` 和 History API。Cloudflare Web Analytics 会处理 `pushState`、`replaceState` 与 `popstate` 产生的单页应用导航，不需要在 React 路由中重复发送访问事件。

官方说明：

- [Cloudflare Web Analytics 入门](https://developers.cloudflare.com/web-analytics/get-started/)
- [单页应用统计](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/)
- [指标说明](https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/)

## 导出本机阅读记录

在线上网站打开浏览器开发者工具，在 Console 中执行：

```js
blogReadingHistory.download()
```

浏览器会下载一个 `sz-blog-reading-history-YYYY-MM-DD.json` 文件。也可以执行 `blogReadingHistory.snapshot()` 直接查看当前数据。

搜索词只保留最近 100 条。请在分享导出文件前检查其中是否包含不希望公开的内容。

## 创建月度复盘

不带阅读记录时：

```powershell
npm run review:month -- 2026-07
```

带本机阅读记录时：

```powershell
npm run review:month -- 2026-07 --history "C:\Users\你的用户名\Downloads\sz-blog-reading-history-2026-07-31.json"
```

命令会创建 `docs/reviews/2026-07.md`，并拒绝覆盖已有文件。随后从 Cloudflare Metrics 填写 Visits、Page views、来源、设备、热门路径和 Core Web Vitals，再记录本月内容判断与下月行动项。

建议每月固定复盘一次，不要用单日波动判断内容方向。优先关注连续趋势、无结果搜索词，以及高访问但阅读体验较差的页面。
