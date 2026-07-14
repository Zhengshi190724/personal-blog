import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatPostErrors, isPublishedPost, validatePost } from '../src/content/post-schema.js';

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function absoluteUrl(siteUrl, path = '/') {
  return new URL(path, `${siteUrl.replace(/\/$/, '')}/`).toString();
}

function loadPosts(contentDir) {
  const failures = [];
  const posts = readdirSync(contentDir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const slug = name.replace(/\.md$/, '');
      const result = validatePost(readFileSync(resolve(contentDir, name), 'utf8'), { slug });
      if (result.errors.length > 0) {
        failures.push(formatPostErrors(`src/content/${name}`, result.errors));
      }
      return { slug, ...result.metadata };
    });

  if (failures.length > 0) {
    throw new Error(`Content validation failed:\n\n${failures.join('\n\n')}`);
  }

  return posts
    .filter(isPublishedPost)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function contentArtifactsPlugin({ siteUrl, siteTitle, description, categories = [] }) {
  return {
    name: 'blog-content-artifacts',
    apply: 'build',
    generateBundle() {
      const posts = loadPosts(resolve(process.cwd(), 'src/content'));
      const latestModified = posts
        .map((post) => post.updated || post.date)
        .sort()
        .at(-1);
      const tags = [...new Set(posts.flatMap((post) => post.tags))];
      const sitemapEntries = [
        { path: '/', lastmod: latestModified },
        ...['/posts/', '/archive/', '/about/', '/friends/'].map((path) => ({ path, lastmod: latestModified })),
        ...posts.map((post) => ({ path: `/posts/${post.slug}/`, lastmod: post.updated || post.date })),
        ...categories.map((category) => ({ path: `/categories/${category.slug}/`, lastmod: latestModified })),
        ...tags.map((tag) => ({ path: `/tags/${encodeURIComponent(tag)}/`, lastmod: latestModified })),
      ];

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(({ path, lastmod }) => `  <url>
    <loc>${escapeXml(absoluteUrl(siteUrl, path))}</loc>${lastmod ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>zh-CN</language>
    <atom:link href="${escapeXml(absoluteUrl(siteUrl, '/rss.xml'))}" rel="self" type="application/rss+xml" />
${posts.map((post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(absoluteUrl(siteUrl, `/posts/${post.slug}/`))}</link>
      <guid isPermaLink="true">${escapeXml(absoluteUrl(siteUrl, `/posts/${post.slug}/`))}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')}
    </item>`).join('\n')}
  </channel>
</rss>`;

      const robots = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}\n`;

      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: 'rss.xml', source: rss });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
    },
  };
}
