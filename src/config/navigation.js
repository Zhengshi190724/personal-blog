export const categories = [
  {
    slug: 'technology',
    name: '技术',
    description: '编程、硬件、工程方法与开发工具。',
    subcategories: [
      {
        slug: 'systemverilog',
        name: 'SystemVerilog',
        contentFolder: 'SystemVerilog',
        description: 'SystemVerilog 语法、验证方法与工程实践。',
      },
    ],
  },
  { slug: 'life', name: '生活', description: '日常观察、成长记录与生活随笔。' },
  { slug: 'entertainment', name: '娱乐', description: '影音、游戏、阅读与兴趣分享。' },
  {
    slug: 'learning',
    name: '学习',
    description: '课程笔记、知识整理与学习复盘。',
    subcategories: [
      {
        slug: 'aat',
        name: 'AAT',
        contentFolder: 'AAT',
        description: '行政职业能力测验的知识整理、方法总结与练习复盘。',
      },
    ],
  },
  { slug: 'miscellaneous', name: '杂项', description: '暂不属于固定主题的零散记录。' },
];

export function getCategoryBySlug(slug) {
  return categories.find((category) => category.slug === slug) || null;
}

export function getCategoryByName(name) {
  return categories.find((category) => category.name === name) || null;
}

export function getSubcategoryBySlug(category, slug) {
  return category?.subcategories?.find((subcategory) => subcategory.slug === slug) || null;
}

export function getSubcategoryByName(category, name) {
  return category?.subcategories?.find((subcategory) => subcategory.name === name) || null;
}

export function getCategoryPath(category, subcategory = null) {
  return subcategory
    ? `/categories/${category.slug}/${subcategory.slug}/`
    : `/categories/${category.slug}/`;
}

export function getContentClassification(relativePath) {
  const folder = String(relativePath || '').replaceAll('\\', '/').split('/')[0];
  if (!folder || !String(relativePath).includes('/') || folder.startsWith('.')) return null;

  for (const category of categories) {
    const subcategory = category.subcategories?.find(
      (item) => item.contentFolder?.toLocaleLowerCase() === folder.toLocaleLowerCase(),
    );
    if (subcategory) return { category, subcategory };
  }
  return null;
}
