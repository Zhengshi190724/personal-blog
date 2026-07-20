import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { normalizeArticleMediaPath } from '../src/utils/mediaPaths.js';
import {
  markdownSanitizeSchema,
  markdownTextColorClass,
} from '../src/utils/markdownHtml.js';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function absoluteUrl(siteUrl, path = '/') {
  return new URL(path, `${siteUrl.replace(/\/$/, '')}/`).toString();
}

function metaTag(attribute, key, content) {
  return `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`;
}

function replaceOrInsert(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace('</head>', `    ${replacement}\n  </head>`);
}

function nodeText(node) {
  if (node?.type === 'text') return node.value || '';
  return node?.children?.map(nodeText).join('') || '';
}

function renderMarkdown(content) {
  return renderToStaticMarkup(React.createElement(
    ReactMarkdown,
    {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeRaw, [rehypeSanitize, markdownSanitizeSchema]],
      components: {
        h1: () => null,
        img: ({ src, ...props }) => React.createElement('img', {
          ...props,
          src: normalizeArticleMediaPath(src),
        }),
        font: ({ color, children }) => {
          const colorClass = markdownTextColorClass(color);
          return React.createElement(
            'span',
            { className: `markdown-text-color${colorClass ? ` ${colorClass}` : ''}` },
            children,
          );
        },
        pre: ({ node, children, ...props }) => {
          const codeNode = node?.children?.find((child) => (
            child.type === 'element' && child.tagName === 'code'
          ));
          const classNames = codeNode?.properties?.className || [];
          if (!classNames.includes('language-mermaid')) {
            return React.createElement('pre', props, children);
          }

          return React.createElement(
            'figure',
            { className: 'prerendered-mermaid' },
            React.createElement('figcaption', null, 'Mermaid 流程图'),
            React.createElement(
              'details',
              null,
              React.createElement('summary', null, '查看图表源码'),
              React.createElement('pre', null, React.createElement('code', null, nodeText(codeNode).trim())),
            ),
          );
        },
      },
    },
    content,
  ));
}

function serializeSchema(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function createStaticPostHtml(indexHtml, post, {
  siteUrl,
  siteName,
  author,
  socialImage,
  socialImageAlt,
}) {
  const canonicalUrl = absoluteUrl(siteUrl, `/posts/${post.slug}/`);
  const imagePath = post.cover || socialImage;
  const imageUrl = absoluteUrl(siteUrl, imagePath);
  const imageAlt = post.cover ? post.title : socialImageAlt;
  const pageTitle = `${post.title} | ${siteName}`;
  const modifiedTime = post.updated || post.date;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: modifiedTime,
    mainEntityOfPage: canonicalUrl,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Person', name: author },
    keywords: post.tags.join(', '),
    image: imageUrl,
  };

  let html = String(indexHtml);
  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);
  html = replaceOrInsert(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
  html = replaceOrInsert(html, /<meta\s+name="description"[^>]*>/i, metaTag('name', 'description', post.excerpt));
  html = replaceOrInsert(html, /<meta\s+property="og:title"[^>]*>/i, metaTag('property', 'og:title', pageTitle));
  html = replaceOrInsert(html, /<meta\s+property="og:description"[^>]*>/i, metaTag('property', 'og:description', post.excerpt));
  html = replaceOrInsert(html, /<meta\s+property="og:type"[^>]*>/i, metaTag('property', 'og:type', 'article'));
  html = replaceOrInsert(html, /<meta\s+property="og:url"[^>]*>/i, metaTag('property', 'og:url', canonicalUrl));
  html = replaceOrInsert(html, /<meta\s+property="og:site_name"[^>]*>/i, metaTag('property', 'og:site_name', siteName));
  html = replaceOrInsert(html, /<meta\s+property="og:image"[^>]*>/i, metaTag('property', 'og:image', imageUrl));
  html = replaceOrInsert(html, /<meta\s+property="og:image:alt"[^>]*>/i, metaTag('property', 'og:image:alt', imageAlt));
  html = replaceOrInsert(html, /<meta\s+name="twitter:title"[^>]*>/i, metaTag('name', 'twitter:title', pageTitle));
  html = replaceOrInsert(html, /<meta\s+name="twitter:description"[^>]*>/i, metaTag('name', 'twitter:description', post.excerpt));
  html = replaceOrInsert(html, /<meta\s+name="twitter:image"[^>]*>/i, metaTag('name', 'twitter:image', imageUrl));

  if (post.cover) {
    html = html
      .replace(/\s*<meta\s+property="og:image:width"[^>]*>/i, '')
      .replace(/\s*<meta\s+property="og:image:height"[^>]*>/i, '');
  }

  const articleHead = [
    metaTag('property', 'article:published_time', post.date),
    metaTag('property', 'article:modified_time', modifiedTime),
    metaTag('name', 'twitter:image:alt', imageAlt),
    `<script type="application/ld+json" data-blog-schema>${serializeSchema(schema)}</script>`,
    '<style data-prerendered-style>.prerendered-post{max-width:760px;margin:0 auto;padding:120px 24px 80px;color:#15191b;font-family:system-ui,sans-serif}.prerendered-post h1{font-size:clamp(2.3rem,7vw,4.8rem);line-height:1.08}.prerendered-post__excerpt{font-size:1.05rem;line-height:1.8;color:#5d686e}.prerendered-post__body{margin-top:56px;line-height:1.85}.prerendered-post__body img{max-width:100%;height:auto}.markdown-text-color--red{color:#c60000}.markdown-text-color--blue{color:#075eb8}.markdown-text-color--green{color:#137542}.markdown-text-color--orange{color:#a94d00}.markdown-text-color--purple{color:#6546b8}.prerendered-mermaid{margin:28px 0;padding:20px;border:1px solid #d8dde0;border-radius:8px}.prerendered-mermaid figcaption{font-weight:700}.prerendered-mermaid details{margin-top:12px}.prerendered-mermaid pre{overflow:auto}@media(prefers-color-scheme:dark){.prerendered-post{color:#f4f6f7}.prerendered-post__excerpt{color:#aab2b7}.markdown-text-color--red{color:#ff4d4f}.markdown-text-color--blue{color:#4da3ff}.markdown-text-color--green{color:#35b56f}.markdown-text-color--orange{color:#f08b32}.markdown-text-color--purple{color:#a98bff}.prerendered-mermaid{border-color:#394146}}</style>',
  ].join('\n    ');
  html = html.replace('</head>', `    ${articleHead}\n  </head>`);

  const article = `<article class="prerendered-post" data-prerendered="article">
      <header>
        <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="prerendered-post__excerpt">${escapeHtml(post.excerpt)}</p>
      </header>
      <div class="prerendered-post__body">${renderMarkdown(post.content)}</div>
    </article>`;

  return html.replace('<div id="root"></div>', `<div id="root">${article}</div>`);
}
