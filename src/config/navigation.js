export const categories = [
  { slug: 'technology', name: '技术', description: '编程、硬件、工程方法与开发工具。' },
  { slug: 'life', name: '生活', description: '日常观察、成长记录与生活随笔。' },
  { slug: 'entertainment', name: '娱乐', description: '影音、游戏、阅读与兴趣分享。' },
  { slug: 'miscellaneous', name: '杂项', description: '暂不属于固定主题的零散记录。' },
];

export function getCategoryBySlug(slug) {
  return categories.find((category) => category.slug === slug) || null;
}

export function getCategoryByName(name) {
  return categories.find((category) => category.name === name) || null;
}
