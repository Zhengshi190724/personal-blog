# Personal Blog - Project Documentation

## Overview

A personal blog site built with React 18 + Vite 6, deployed on Vercel. Content managed via Markdown files in `src/content/`. Supports dark mode, tag filtering, code syntax highlighting, and responsive design.

- **Live URL**: https://personal-blog-eight-ashen-54.vercel.app
- **GitHub**: https://github.com/Zhengshi190724/personal-blog
- **Vercel Project**: zhengshi190724s-projects/personal-blog

## Architecture

```
User Request → Vercel (vercel.json rewrites → index.html) → React Router (client-side) → Page Component
```

- SPA with client-side routing via `react-router-dom` v6
- `vercel.json` rewrites all paths to `index.html` — essential for SPA, without it sub-routes return 404
- No backend/server — fully static build

### Data Flow

```
Build Time:
  src/content/*.md → import.meta.glob(?raw, eager) → parseFrontmatter() → posts[]

Runtime:
  usePosts() hook → getAllPosts() / getPostBySlug() / getPostsByTag() → React Component
  ThemeContext → useTheme() → toggleTheme() → localStorage + data-theme attr
```

### Component Tree

```
<ThemeProvider>          ← owns theme state, persists to localStorage
  <BrowserRouter>
    <Header>             ← sticky, site title, nav, <ThemeToggle />
    <Routes>
      /          → <HomePage>     → <TagCloud> (sidebar) + <PostCard>* (main)
      /post/:slug → <PostPage>    → ReactMarkdown + rehype-highlight
      /tag/:tag   → <TagPage>     → filtered <PostCard>* + <TagCloud> (active)
    </Routes>
    <Footer />
```

## Key Design Decisions

### 1. Custom frontmatter parser instead of gray-matter
- **Why**: `gray-matter` depends on Node.js `Buffer`, which is not available in browser
- **Where**: `src/utils/posts.js:9-41`
- **How**: Regex-based YAML frontmatter parser, handles strings and arrays

### 2. import.meta.glob with ?raw for markdown loading
- **Why**: All posts baked into bundle at build time — no fetch, no loading states
- **Trade-off**: Bundle grows with number of posts (currently ~514KB with highlight.js)
- **Where**: `src/utils/posts.js:1-5`

### 3. CSS custom properties for theming (no CSS framework)
- **Why**: Zero-dependency dark mode, single `data-theme` attr on `<html>` switches all colors
- **Where**: `src/index.css` — `:root` (light) and `[data-theme="dark"]` (dark) variables
- **Persistence**: `localStorage.getItem('blog-theme')` in `ThemeContext.jsx`

### 4. No state management library
- Only React Context used for theme (cross-component)
- Post data is module-level cache, never changes at runtime

### 5. SPA rewrite rule in vercel.json
- **Why**: Without it, direct access to `/post/xxx` returns 404
- **Where**: `vercel.json` — `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`

## File Map

### Core Infrastructure
| File | Purpose |
|------|---------|
| `src/main.jsx` | Entry point, mounts React with BrowserRouter + ThemeProvider |
| `src/App.jsx` | Route definitions (/, /post/:slug, /tag/:tag) |
| `src/index.css` | CSS reset, theme variables, dark mode, highlight.js overrides |
| `vite.config.js` | Vite config, `assetsInclude: ['**/*.md']` |
| `vercel.json` | SPA rewrites for Vercel deployment |

### Data Layer
| File | Purpose |
|------|---------|
| `src/utils/posts.js` | `import.meta.glob` markdown loader + custom YAML parser |
| `src/hooks/usePosts.js` | Hook: `{ posts, allTags, getPostBySlug, getPostsByTag }` |
| `src/hooks/useTheme.js` | Hook: `{ theme, toggleTheme }` |
| `src/context/ThemeContext.jsx` | Theme provider, localStorage persistence, `data-theme` DOM attr |

### Components
| File | Purpose |
|------|---------|
| `src/components/Layout/Header.jsx` | Sticky header, site title, nav, theme toggle |
| `src/components/Layout/Footer.jsx` | Simple footer with copyright |
| `src/components/PostCard/PostCard.jsx` | Post preview card with title, date, tags, excerpt |
| `src/components/TagCloud/TagCloud.jsx` | Tag sidebar with counts, active state |
| `src/components/ThemeToggle/ThemeToggle.jsx` | Sun/moon icon button |

### Pages
| File | Purpose |
|------|---------|
| `src/pages/HomePage.jsx` | Post list + tag sidebar |
| `src/pages/PostPage.jsx` | Full post render (ReactMarkdown + rehype-highlight) |
| `src/pages/TagPage.jsx` | Filtered posts by tag |

### Content
| File | Purpose |
|------|---------|
| `src/content/*.md` | Blog posts with YAML frontmatter (title, date, tags, excerpt) |

## Completed
- [x] Project scaffolding (Vite + React)
- [x] Core infrastructure (theme, routing, post loader)
- [x] Layout components (Header, Footer, ThemeToggle)
- [x] Content components (PostCard, TagCloud)
- [x] Pages (HomePage, PostPage, TagPage)
- [x] 3 sample posts with code highlighting
- [x] Dark mode with localStorage persistence
- [x] Responsive design (mobile / tablet / desktop)
- [x] Vercel deployment with custom domain alias
- [x] SPA rewrite fix (vercel.json)

## TODO / Future
- [ ] Complete Vercel Git auto-deploy (connect GitHub repo in Vercel dashboard)
- [ ] Fix git push SSL issue (corporate network proxy)
- [ ] Add more content posts
- [ ] Consider code-splitting for highlight.js (currently ~514KB bundle)
- [ ] Add RSS feed
- [ ] Add SEO meta tags per post
- [ ] Add pagination for post list (if posts grow beyond ~20)
- [ ] Custom domain setup

## Commands

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Production build to dist/
npm run preview      # Preview production build
npx vercel --prod    # Deploy to Vercel (requires token)
```

## Adding a New Post

Create a `.md` file in `src/content/` with this format:

```md
---
title: "Post Title"
date: "2026-05-13"
tags: ["tag1", "tag2"]
excerpt: "Optional excerpt. Falls back to first 200 chars of content."
---
Post content in Markdown...
```

Then deploy: `npx vercel --prod --yes`
