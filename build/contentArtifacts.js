import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function parseValue(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''));
  }
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function parsePost(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const data = {};

  if (match) {
    match[1].split(/\r?\n/).forEach((line) => {
      const separator = line.indexOf(':');
      if (separator === -1) return;
      data[line.slice(0, separator).trim()] = parseValue(line.slice(separator + 1));
    });
  }

  return data;
}

function absoluteUrl(siteUrl, path = '/') {
  return new URL(path, `${siteUrl.replace(/\/$/, '')}/`).toString();
}

export function contentArtifactsPlugin({ siteUrl, siteTitle, description, categories = [] }) {
  return {
    name: 'blog-content-artifacts',
    apply: 'build',
    generateBundle() {
      const contentDir = resolve(process.cwd(), 'src/content');
      const posts = readdirSync(contentDir)
        .filter((name) => name.endsWith('.md'))
        .map((name) => ({
          ...parsePost(resolve(contentDir, name)),
          slug: name.replace(/\.md$/, ''),
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const tags = [...new Set(posts.flatMap((post) => post.tags || []))];
      const sitemapEntries = [
        { path: '/', lastmod: posts[0]?.date },
        ...['/posts/', '/archive/', '/about/', '/friends/'].map((path) => ({ path, lastmod: posts[0]?.date })),
        ...posts.map((post) => ({ path: `/posts/${post.slug}/`, lastmod: post.date })),
        ...categories.map((category) => ({ path: `/categories/${category.slug}/`, lastmod: posts[0]?.date })),
        ...tags.map((tag) => ({ path: `/tags/${encodeURIComponent(tag)}/`, lastmod: posts[0]?.date })),
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
${(post.tags || []).map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')}
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
