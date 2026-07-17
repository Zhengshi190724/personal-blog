# Google Search Console 接入

构建流程会为每篇已发布文章生成独立静态 HTML，并同步输出 Canonical、Open Graph、Twitter Card、BlogPosting JSON-LD、`sitemap.xml` 和 `robots.txt`。Google Search Console 仍需要使用站点所有者的 Google 账号完成外部验证。

## 接入步骤

1. 打开 [Google Search Console](https://search.google.com/search-console/)。
2. 添加当前正式站点地址。尚未绑定自定义域名时，可先使用 `https://personal-blog-ot6.pages.dev/` 的网址前缀资源。
3. 按 Google 提供的方式完成所有权验证。绑定自定义域名后，优先使用 DNS TXT 记录验证“网域”资源。
4. 在 **站点地图** 中提交 `sitemap.xml`，完整地址为 `https://你的域名/sitemap.xml`。
5. 使用 **网址检查** 分别检查首页和一篇文章，确认 Google 读取到文章标题、正文和 Canonical。
6. 每次域名变更后，更新 Cloudflare 构建环境变量并重新构建，再检查 Sitemap、RSS 和文章静态 HTML 中的正式地址。

## 本地检查

执行生产构建：

```powershell
npm run build
```

构建门禁会确认每篇文章都存在以下文件：

```text
dist/posts/<slug>/index.html
```

文件必须包含可直接读取的正文、Canonical 和 JSON-LD。可以直接用文本编辑器打开该 HTML，确认正文并非只在 JavaScript 中出现。

## 发布后检查

- 文章地址返回 HTTP 200，而不是依赖 404 回退。
- 页面源代码中有唯一的 `<title>`、描述、Canonical 和 `BlogPosting` JSON-LD。
- Sitemap 只包含已发布文章，不包含草稿。
- 社交分享图使用绝对 HTTPS 地址并可以直接访问。
- Search Console 没有重复网页、错误 Canonical 或“已抓取但未编入索引”的持续异常。

Google 重新抓取和编入索引需要时间。单次提交后不要频繁修改同一 URL；优先保持地址稳定并持续发布有内部链接的内容。
