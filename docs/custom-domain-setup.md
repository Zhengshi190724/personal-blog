# Cloudflare Pages 自定义域名迁移

## 当前状态

网站当前正式地址为：

```text
https://personal-blog-ot6.pages.dev
```

仓库现在只使用一个正式地址配置：`VITE_SITE_URL`。它会同时影响运行时 Canonical、静态文章 HTML、JSON-LD、Sitemap、RSS、robots.txt 和分享链接。

在域名尚未购买和确定前，不应修改默认地址，也不应提前启用 `pages.dev` 重定向。

## 1. 选择地址

建议确定一个长期不变的主地址，例如：

```text
https://blog.example.com
```

只选择一个主版本。不要同时把根域名、`www` 和 `blog` 子域都作为可索引主站。

## 2. 在 Pages 中关联域名

1. 登录 Cloudflare Dashboard。
2. 进入 **Workers & Pages**，选择博客项目。
3. 打开 **Custom domains**，选择 **Set up a domain**。
4. 输入准备使用的完整域名并继续。
5. 根域名需要把域名作为 Cloudflare zone 并使用 Cloudflare nameserver。
6. 子域名可以使用 CNAME 指向 `personal-blog-ot6.pages.dev`；即使手动管理 DNS，也必须先完成 Pages 项目内的域名关联。
7. 等待域名状态变为 Active，并确认 HTTPS 证书正常。

不要只添加一条 CNAME 而跳过 Pages 的 Custom domains 流程；Cloudflare 官方说明这种方式可能返回 522。

官方说明：[Cloudflare Pages Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)

## 3. 设置唯一构建变量

进入 Pages 项目的 **Settings > Environment variables**，在 Production 环境添加：

```text
VITE_SITE_URL=https://blog.example.com
```

值必须：

- 使用 `https://`。
- 只包含域名，不带文章路径、查询参数或 `#` 片段。
- 末尾有无 `/` 均可，构建时会归一化。

保存后重新部署生产分支。Cloudflare Pages 的 Vite 项目继续使用 `npm run build` 和 `dist` 输出目录。

官方说明：[Cloudflare Pages Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)

## 4. 验证正式地址

部署后检查：

```text
https://blog.example.com/
https://blog.example.com/posts/
https://blog.example.com/posts/markdown_note/
https://blog.example.com/sitemap.xml
https://blog.example.com/rss.xml
https://blog.example.com/robots.txt
```

文章源代码中的 Canonical、Open Graph、JSON-LD 和分享按钮都应指向新域名。Sitemap 与 RSS 中不得再出现 `personal-blog-ot6.pages.dev`。

## 5. 重定向 pages.dev

只有新域名验证完成后再建立永久重定向：

1. 打开 Cloudflare **Bulk Redirects**。
2. 创建从 `personal-blog-ot6.pages.dev` 到新域名的 301 规则。
3. 启用 Preserve query string、Subpath matching 和 Preserve path suffix。
4. 创建并启用使用该列表的 Bulk Redirect rule。
5. 分别访问首页和一篇旧文章地址，确认路径完整保留并只跳转一次。

不要使用仓库中的 `_redirects` 实现这一步。Cloudflare Pages 的 `_redirects` 不支持域名级匹配，硬编码目标还可能影响预览部署。

官方说明：[Redirecting pages.dev to a custom domain](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/)

## 6. 搜索引擎迁移

1. 在 Google Search Console 添加并验证新域名。
2. 提交新域名的 `sitemap.xml`。
3. 抽查文章 Canonical 与索引状态。
4. 保留 301 重定向，不要删除旧 `pages.dev` 项目。
5. 更新 GitHub 仓库主页、个人资料和友情链接中的旧地址。

域名购买、DNS 所有权验证、Cloudflare 后台开关和 Google 账号验证都需要站点所有者操作；代码仓库无法替代这些账户步骤。
