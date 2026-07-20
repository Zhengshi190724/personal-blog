import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { loadPostRecords } from '../build/postData.js';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = resolve(projectRoot, 'dist');
const assetsDir = resolve(distDir, 'assets');
const manifestPath = resolve(distDir, '.vite', 'manifest.json');
const maxMainBytes = 500_000;

if (!existsSync(resolve(distDir, 'index.html'))) {
  throw new Error('未找到 dist/index.html，请先执行 vite build。');
}

const html = readFileSync(resolve(distDir, 'index.html'), 'utf8');
const expectedSiteUrl = process.env.VITE_SITE_URL || 'https://personal-blog-ot6.pages.dev';
const expectedHomepage = `${expectedSiteUrl.replace(/\/$/, '')}/`;
if (!html.includes(`rel="canonical" href="${expectedHomepage}"`)
  || !html.includes(`property="og:url" content="${expectedHomepage}"`)) {
  throw new Error(`首页静态 SEO 未使用 VITE_SITE_URL：${expectedHomepage}`);
}
const entryMatch = html.match(/<script[^>]+src="([^"]+\.js)"/);
if (!entryMatch) throw new Error('无法从 dist/index.html 找到主 JavaScript 入口。');

const entryPath = resolve(distDir, entryMatch[1].replace(/^\//, ''));
const entrySource = readFileSync(entryPath);
const entryBytes = statSync(entryPath).size;
const gzipBytes = gzipSync(entrySource).length;

if (entryBytes > maxMainBytes) {
  throw new Error(`主 JavaScript 为 ${(entryBytes / 1000).toFixed(2)} kB，超过 ${maxMainBytes / 1000} kB 限制。`);
}

const posts = loadPostRecords(resolve(projectRoot, 'src/content'));
if (!existsSync(manifestPath)) throw new Error('未找到 Vite 构建 manifest。');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const missingChunks = posts
  .filter((post) => {
    const expectedSource = `src/content/${post.sourcePath}`.replaceAll('\\', '/');
    return !Object.entries(manifest).some(([key, entry]) => {
      const candidates = [key, entry.src]
        .filter(Boolean)
        .map((value) => value.replaceAll('\\', '/').split('?')[0]);
      return candidates.some((value) => value.endsWith(expectedSource))
        && entry.file?.endsWith('.js');
    });
  })
  .map((post) => post.slug);

if (missingChunks.length > 0) {
  throw new Error(`以下文章没有独立正文 chunk：${missingChunks.join('、')}`);
}

const invalidStaticPages = posts
  .filter((post) => {
    const staticPath = resolve(distDir, 'posts', post.slug, 'index.html');
    if (!existsSync(staticPath)) return true;
    const source = readFileSync(staticPath, 'utf8');
    const encodedPostPath = encodeURI(`/posts/${post.slug}/`);
    return !source.includes('data-prerendered="article"')
      || !source.includes('type="application/ld+json"')
      || !source.includes(encodedPostPath);
  })
  .map((post) => post.slug);

if (invalidStaticPages.length > 0) {
  throw new Error(`以下文章缺少有效的静态 HTML：${invalidStaticPages.join('、')}`);
}

console.log(`包体积检查通过：主 JS ${(entryBytes / 1000).toFixed(2)} kB，gzip ${(gzipBytes / 1000).toFixed(2)} kB。`);
console.log(`首页静态 SEO 检查通过：${expectedHomepage}`);
console.log(`Markdown 拆包检查通过：${posts.length} 篇文章均有独立正文 chunk。`);
console.log(`静态 SEO 检查通过：${posts.length} 篇文章均包含正文、Canonical 和 JSON-LD。`);
