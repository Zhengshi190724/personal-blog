import assert from 'node:assert/strict';
import test from 'node:test';
import { createStaticPostHtml } from '../build/staticPostHtml.js';

const template = `<!doctype html><html><head>
  <meta name="description" content="old" />
  <link rel="canonical" href="https://example.com/" />
  <meta property="og:title" content="old" />
  <meta property="og:description" content="old" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://example.com/" />
  <meta property="og:site_name" content="old" />
  <meta property="og:image" content="https://example.com/old.png" />
  <meta property="og:image:alt" content="old" />
  <meta name="twitter:title" content="old" />
  <meta name="twitter:description" content="old" />
  <meta name="twitter:image" content="https://example.com/old.png" />
  <title>old</title>
</head><body><div id="root"></div></body></html>`;

test('creates crawlable article HTML with unique metadata and schema', () => {
  const output = createStaticPostHtml(template, {
    slug: 'fpga-note',
    title: 'FPGA <学习>',
    excerpt: '文章摘要',
    date: '2026-07-01',
    updated: '2026-07-02',
    tags: ['FPGA', 'RTL'],
    cover: '',
    content: '# FPGA 学习\n\n## 第一节\n\n正文内容。',
  }, {
    siteUrl: 'https://blog.example.com',
    siteName: 'SZ Blog',
    author: 'Shane',
    socialImage: '/social-card.png',
    socialImageAlt: 'SZ Blog social card',
  });

  assert.match(output, /<title>FPGA &lt;学习&gt; \| SZ Blog<\/title>/);
  assert.match(output, /rel="canonical" href="https:\/\/blog\.example\.com\/posts\/fpga-note\/"/);
  assert.match(output, /property="og:type" content="article"/);
  assert.match(output, /article:published_time" content="2026-07-01"/);
  assert.match(output, /data-blog-schema/);
  assert.match(output, /"dateModified":"2026-07-02"/);
  assert.match(output, /data-prerendered="article"/);
  assert.match(output, /<h1>FPGA &lt;学习&gt;<\/h1>/);
  assert.match(output, /<h2>第一节<\/h2>/);
  assert.doesNotMatch(output, /<h1>FPGA 学习<\/h1>/);
});
