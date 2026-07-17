# TODO - SZ Blog

Deployed at: `https://personal-blog-ot6.pages.dev`

## P0 completed

- [x] One-command article creation and publication
- [x] Strict Frontmatter validation and draft exclusion
- [x] GitHub Actions quality gate and Cloudflare preview workflow
- [x] Current site identity, social metadata, manifest, and project documentation

## P1 code completed

- [x] Split routes and Markdown content so article bodies do not enter the initial bundle
- [x] Load syntax highlighting only on article routes
- [x] Add an image pipeline for WebP/AVIF, responsive sizes, dimensions, captions, zoom, and fallback handling
- [x] Add series navigation, improved related ranking, and topic learning maps
- [x] Separate personal reading history from production analytics and add a monthly review workflow
- [x] Generate static per-article HTML metadata and add copy/share actions
- [x] Make canonical URLs configurable through one validated `VITE_SITE_URL`

## P1 account actions

- [ ] Enable Cloudflare Web Analytics and confirm data appears after a production deployment
- [ ] Verify the site in Google Search Console and submit `sitemap.xml`
- [ ] Purchase/choose a custom domain, bind it in Cloudflare Pages, set `VITE_SITE_URL`, and enable the `pages.dev` Bulk Redirect

## Later

- [ ] Add pagination when the site has roughly 20 posts
- [ ] Evaluate comments, email subscriptions, PWA support, or a Git-based CMS after reader demand is clear
