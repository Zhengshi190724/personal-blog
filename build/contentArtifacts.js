import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadPostRecords } from './postData.js';
import { createStaticPostHtml } from './staticPostHtml.js';

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

export function contentArtifactsPlugin({
  siteUrl,
  siteTitle,
  siteName,
  description,
  author,
  socialImage,
  socialImageAlt,
  categories = [],
  contentMaps = [],
}) {
  let contentDirectory = resolve(process.cwd(), 'src/content');
  let outputDirectory = resolve(process.cwd(), 'dist');

  return {
    name: 'blog-content-artifacts',
    apply: 'build',
    configResolved(config) {
      contentDirectory = resolve(config.root, 'src/content');
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      const homepageUrl = absoluteUrl(siteUrl, '/');
      const socialImageUrl = absoluteUrl(siteUrl, socialImage);
      return html
        .replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${homepageUrl}" />`)
        .replace(/<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${homepageUrl}" />`)
        .replace(/<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${socialImageUrl}" />`)
        .replace(/<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${socialImageUrl}" />`);
    },
    generateBundle() {
      const posts = loadPostRecords(contentDirectory);
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
        ...contentMaps.map((contentMap) => ({ path: `/maps/${contentMap.slug}/`, lastmod: latestModified })),
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
    closeBundle() {
      const indexPath = resolve(outputDirectory, 'index.html');
      const indexHtml = readFileSync(indexPath, 'utf8');
      const posts = loadPostRecords(contentDirectory, { includeContent: true });

      posts.forEach((post) => {
        const articleDirectory = resolve(outputDirectory, 'posts', post.slug);
        mkdirSync(articleDirectory, { recursive: true });
        writeFileSync(
          resolve(articleDirectory, 'index.html'),
          createStaticPostHtml(indexHtml, post, {
            siteUrl,
            siteName,
            author,
            socialImage,
            socialImageAlt,
          }),
          'utf8',
        );
      });
    },
  };
}
