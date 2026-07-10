# TODO - Personal Blog

## Blockers
- [ ] **Vercel Git auto-deploy** — Need to connect GitHub repo in Vercel dashboard: https://vercel.com/zhengshi190724s-projects/personal-blog/settings/git
- [ ] **Git push failing** — SSL certificate error (`unable to get local issuer certificate`), likely corporate network proxy issue. Workaround: `git -c http.sslVerify=false push`

## Content
- [ ] Add more blog posts to `src/content/`
- [ ] Fix `hello-world.md` line 19 has a stray `2` character

## Enhancements
- [ ] Code-split highlight.js (~514KB bundle) — use dynamic import for `rehype-highlight`
- [ ] Add `<meta>` tags per post for SEO (description, og:title, etc.)
- [ ] RSS/Atom feed generation
- [ ] Pagination for post list (if >20 posts)
- [ ] Custom domain (e.g., blog.zhengshi.dev)
- [ ] Post search functionality
- [ ] Estimated reading time per post
- [ ] Sitemap.xml generation
