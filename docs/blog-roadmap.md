# SZ Blog 后续扩展路线图

## 目标

在保留 React、Vite、Markdown 和 Cloudflare Pages 架构的前提下，优先降低文章发布成本，随后改善性能、内容组织、SEO、统计和互动能力。

## 当前能力基线

网站目前已经具备：

- 首页、文章列表、文章详情、分类、标签、归档、关于、友情链接和 404 页面。
- Markdown 渲染、GFM、代码高亮、阅读时长、阅读进度和文章目录。
- 上一篇、下一篇和基于标签的相关文章。
- 全文搜索、深浅主题和移动端导航。
- 动态标题、描述、Canonical、Open Graph、JSON-LD。
- 自动生成 Sitemap、RSS 和 robots.txt。
- GitHub 推送触发 Cloudflare Pages 自动部署。

当前主要短板：

- 主 JavaScript 已从约 708 kB 降至约 332 kB，文章正文和代码高亮按需加载。
- 生产统计仍需在 Cloudflare 后台启用；源码中的 localStorage 数据已明确为单台设备的个人阅读记录。
- 正文图片已经具备 AVIF/WebP、多尺寸、宽高、懒加载、说明、放大和失败回退流程。

## 优先级说明

- `P0`：现在就做，直接降低维护成本或阻止错误上线。
- `P1`：文章达到 10 至 20 篇前完成，改善增长和阅读体验。
- `P2`：有稳定内容和访问量后再做，避免过早增加系统复杂度。

## P0：发布与质量基础

### 1. 一键创建和发布文章（已实现）

工作量：小到中

新增以下命令：

```text
npm run new-post -- article-slug --title "文章标题" --category 技术
npm run publish -- article-slug --dry-run
npm run publish -- article-slug
```

能力范围：

- 自动创建带完整 Frontmatter 的 Markdown 模板。
- 自动从标题或 slug 生成提交说明。
- 发布前执行内容校验和生产构建。
- 自动提交、同步远程分支并推送。
- 推送后输出本地地址和线上文章地址。
- 失败时停止，不使用强制推送。

### 2. Frontmatter 校验和草稿机制（已实现）

工作量：中

建议字段：

```yaml
title: "文章标题"
date: "2026-07-14"
updated: "2026-07-14"
tags: ["FPGA"]
category: "技术"
featured: "false"
draft: "false"
excerpt: "文章摘要"
cover: "/images/posts/example/cover.webp"
series: "可选系列名称"
```

校验要求：

- 缺少标题、日期、摘要或分类时构建失败。
- 分类必须属于技术、生活、娱乐或杂项。
- slug 和文件名不能重复，日期必须有效。
- `draft: "true"` 的文章不得进入列表、搜索、RSS 和 Sitemap。

### 3. GitHub Actions 质量门禁（已实现）

工作量：小

每次推送或 Pull Request 自动执行：

- `npm ci`
- Frontmatter 校验
- `npm run build`
- 内部链接和关键路由检查
- 基础桌面端、移动端冒烟测试

生产分支只接受通过检查的提交。非生产分支交给 Cloudflare Pages 生成预览网址，确认后再合并。

### 4. 修正站点身份信息（已实现）

工作量：小

- 更新 `siteConfig.description`、首页和页脚文案，使其与 IC、FPGA、技术学习和生活记录一致。
- 为首页设置默认社交分享图。
- 给文章增加 `og:image` 和封面字段。
- 更新已经过时的 `CLAUDE.md` 和 `TODO.md`。

## P1：性能、内容组织与增长

### 5. 路由和 Markdown 内容拆包（已实现）

工作量：中到大

- 使用 React `lazy` 和 `Suspense` 延迟加载文章页、归档页和关于页。
- 首页只加载文章元数据，不把全部 Markdown 正文打入主包。
- 打开文章时再加载对应正文。
- 代码高亮只在文章页加载。
- 将主 JavaScript 压缩前体积控制在 500 kB 以下，并记录 gzip 体积基线。

### 6. 图片与媒体工作流（已实现）

工作量：中

- 约定 `public/images/posts/<slug>/` 目录。
- 构建时生成 WebP/AVIF 和多尺寸图片。
- Markdown 图片默认懒加载，并显示宽高以避免页面跳动。
- 增加图片说明、点击放大和失败占位状态。
- 给首页背景视频增加本地封面、移动端降级和 `prefers-reduced-motion` 处理。

### 7. 系列文章和内容地图（已实现）

工作量：中

- 新增 `series` 和系列顺序字段。
- 文章页显示系列进度和系列目录。
- 为 FPGA、SystemVerilog、DSP 等专题建立“从哪里开始”的内容地图。
- 相关文章排序同时考虑分类、标签、系列和发布时间。

### 8. 真实统计与内容复盘（代码与文档已实现，Cloudflare 开关待账号操作）

工作量：小到中

- 在 Cloudflare 后台确认 Web Analytics 已启用。
- 观察访问路径、来源、设备和 Core Web Vitals。
- 每月记录热门文章、无结果搜索词和跳出较高的页面。
- localStorage 统计只保留为个人阅读历史，不再称为全站访问统计。

### 9. SEO 静态化与分享能力（代码已实现，Search Console 待账号操作）

工作量：中到大

- 在构建阶段为文章生成可直接被抓取的 HTML，而不是只依赖运行时修改 `<head>`。
- 每篇文章输出唯一标题、描述、Canonical、JSON-LD 和社交分享图。
- 接入 Google Search Console，并提交 Sitemap。
- 增加复制链接和系统分享按钮。

### 10. 自定义域名（配置与迁移文档已实现，购买和绑定待账号操作）

工作量：小，另有域名成本

- 购买并绑定个人域名，例如 `blog.example.com`。
- 将 `pages.dev` 地址重定向到正式域名。
- 更新 Canonical、Sitemap、RSS 和站点配置。

## P2：有稳定读者后再做

### 11. 评论与反馈

可选方案：Giscus + GitHub Discussions。

优点：不需要自建数据库，可以在 GitHub 管理评论。

限制：读者必须登录 GitHub，更适合技术读者；访问量很低时可先使用 GitHub Issues 反馈。

### 12. 订阅系统

- 在页脚重新提供 RSS 入口。
- 有稳定更新频率后再接入邮件订阅服务。
- 邮件只发送摘要和原文链接，不维护两套正文。

### 13. PWA 与离线阅读

- 安装到桌面或手机主屏幕。
- 缓存最近阅读文章和静态资源。
- 新版本发布时提示刷新。

博客不是高频离线工具，因此优先级低于性能和内容质量。

### 14. 网页管理后台

当 PowerShell 一键发布仍不能满足需求时，再考虑 Git-based CMS。

- 网页中编辑 Frontmatter 和 Markdown。
- 上传封面和正文图片。
- 保存草稿、预览并提交到 GitHub。

这会引入 OAuth、权限和后台维护成本，不建议作为当前第一阶段任务。

### 15. 多语言、书签与阅读历史

- 中英文文章映射和语言切换。
- 本地书签、最近阅读和阅读完成状态。
- 标签订阅或个性化推荐。

只有在内容数量和读者需求明确后再实施。

## 暂时不做

- 分页：当前只有 3 篇文章，达到约 20 篇后再评估。
- 自建评论后端：维护和安全成本高于当前收益。
- 复杂账户系统：博客暂时没有需要登录才能完成的核心任务。
- 保存即自动发布：容易把未完成文章推送到生产环境。
- 整站迁移框架：现有 React/Vite 架构仍可满足近期目标。

## 推荐实施顺序

1. 一键创建/发布文章。
2. Frontmatter 校验、草稿和 `updated` 字段。
3. GitHub Actions 构建门禁与 Cloudflare 预览分支。
4. 更新站点描述、关于页、社交分享图和项目文档。
5. 路由拆包、Markdown 按需加载和媒体优化。
6. 系列文章、内容地图和真实统计。
7. 静态 SEO、自定义域名。
8. 根据真实读者反馈决定评论、订阅、PWA 或 CMS。

## 第一阶段验收标准

- 新文章可以通过一条命令创建，通过一条命令发布。
- Frontmatter 错误会在本地和 CI 中阻止构建。
- 草稿不会出现在任何公开入口或生成文件中。
- Pull Request 自动获得 Cloudflare 预览网址。
- 主分支每次提交都通过构建和关键路由检查。
- 发布脚本不会暂存无关文件，也不会执行强制推送。
- 项目文档准确反映当前功能和发布方式。

## 官方参考

- Vite Glob Import: https://vite.dev/guide/features#glob-import
- React lazy: https://react.dev/reference/react/lazy
- Cloudflare Pages Preview Deployments: https://developers.cloudflare.com/pages/configuration/preview-deployments/
- Cloudflare Web Analytics: https://developers.cloudflare.com/web-analytics/
- Google JavaScript SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- GitHub Actions for Node.js: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
- Dependabot Security Updates: https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates
- Giscus: https://github.com/giscus/giscus
- Cloudflare Pages Custom Domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
