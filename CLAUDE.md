# Shane Blog Project Guide

## Overview

Shane Blog is a static React 18 and Vite 6 site deployed by Cloudflare Pages from the `master` branch.

- Live site: `https://personal-blog-ot6.pages.dev`
- Repository: `https://github.com/Zhengshi190724/personal-blog`
- Content: `src/content/*.md`
- Production output: `dist/`

## Architecture

Markdown files are imported as raw text by Vite. `src/content/post-schema.js` is the single source of truth for parsing and validating Frontmatter in the browser, publication scripts, CI, and the Vite content-artifact plugin.

Published posts are available through `/posts/:slug/`. Draft posts are validated but excluded from all public lists, search, archives, article routes, RSS, and Sitemap output.

Current routes:

```text
/                              Home
/posts/                        Post index
/posts/:slug/                  Post detail
/categories/:category/         Category
/tags/:tag/                    Tag
/archive/                      Archive
/about/                        About
/friends/                      Friends
/404/                          Not found
```

## Post Schema

Required fields:

```yaml
title: "Post title"
date: "2026-07-14"
tags: ["FPGA"]
category: "技术"
featured: "false"
draft: "false"
excerpt: "Post summary"
```

Optional fields are `updated`, `cover`, and `series`. Categories are limited to `技术`, `生活`, `娱乐`, and `杂项`. Local covers use an absolute public path such as `/images/posts/example/cover.webp`.

## Commands

```bash
npm run dev
npm run validate:content
npm test
npm run test:e2e
npm run build
npm run preview
npm run new-post -- <slug> --title "Post title" --category 技术
npm run publish -- <slug> --dry-run
npm run publish -- <slug>
```

`npm run new-post` creates a draft. Complete the metadata and body, then set `draft: "false"` before publishing. The publish command validates and builds the article, commits only that article, rebases onto `origin/master`, and pushes without force.

## Quality and Deployment

`.github/workflows/quality-gate.yml` runs unit tests, strict content validation, the production build, and Playwright smoke tests at desktop and mobile viewports. Cloudflare Pages Git integration owns pull-request previews and production deployments; the workflow does not store deployment tokens.

See `docs/deployment.md`, `docs/publish-markdown-post.md`, and `docs/blog-roadmap.md` for operational details and future work.
