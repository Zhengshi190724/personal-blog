import { useEffect } from 'react';
import { siteConfig } from '../../config/site.js';

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

export default function SEO({
  title = siteConfig.title,
  description = siteConfig.description,
  path = '/',
  type = 'website',
  noindex = false,
  schema,
}) {
  useEffect(() => {
    const canonicalUrl = new URL(path, siteConfig.url).toString();

    document.title = title;
    setCanonical(canonicalUrl);
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: siteConfig.name });
    setMeta('meta[property="og:locale"]', { property: 'og:locale', content: siteConfig.locale });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });

    const previousSchema = document.head.querySelector('script[data-blog-schema]');
    previousSchema?.remove();

    if (schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.blogSchema = 'true';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [title, description, path, type, noindex, schema]);

  return null;
}
