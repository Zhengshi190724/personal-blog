const DEFAULT_SITE_URL = 'https://personal-blog-ot6.pages.dev';
const configuredSiteUrl = typeof process !== 'undefined'
  ? process.env?.VITE_SITE_URL
  : import.meta.env?.VITE_SITE_URL;

export function normalizeSiteUrl(value = DEFAULT_SITE_URL) {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('VITE_SITE_URL 必须是没有查询参数或片段的 HTTPS 站点地址。');
  }
  if (parsed.pathname !== '/' && parsed.pathname !== '') {
    throw new Error('VITE_SITE_URL 只能包含域名，不能包含子路径。');
  }
  return parsed.origin;
}

export const siteConfig = {
  name: 'SZ Blog',
  title: 'Z‘s Blog · 记录代码，也记录思考！',
  description: 'Shane 的个人博客，记录 FPGA、数字通信、信号处理、编程实践与生活思考。',
  url: normalizeSiteUrl(configuredSiteUrl || DEFAULT_SITE_URL),
  author: 'Shane',
  locale: 'zh_CN',
  logo: '/z-logo.svg',
  socialImage: '/social-card.png',
  socialImageAlt: 'SZ Blog - Code, systems and thoughtful work.',
  github: 'https://github.com/Zhengshi190724/personal-blog',
};
