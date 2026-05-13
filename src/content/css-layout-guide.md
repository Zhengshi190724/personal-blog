---
title: "CSS 布局完全指南"
date: "2026-05-12"
tags: ["css", "frontend", "tutorial"]
excerpt: "掌握现代 CSS 布局的核心技术：Flexbox、Grid 和 Container Queries。从基础概念到实际案例，一文掌握响应式布局的精髓。"
---

# CSS 布局完全指南

现代 CSS 提供了强大的布局工具。本文将带你从零掌握 Flexbox、Grid 和最新的 Container Queries。

## Flexbox 布局

Flexbox 是一维布局的最佳选择：

```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.item {
  flex: 1 1 300px;
}
```

### 常用属性速查

| 属性 | 作用 | 常用值 |
|------|------|--------|
| `justify-content` | 主轴对齐 | `center`, `space-between`, `flex-start` |
| `align-items` | 交叉轴对齐 | `center`, `stretch`, `flex-start` |
| `flex-wrap` | 是否换行 | `wrap`, `nowrap` |
| `gap` | 间距 | `1rem`, `16px` |

## Grid 布局

Grid 是二维布局的利器：

```css
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* 经典的三栏布局 */
.page-layout {
  display: grid;
  grid-template-areas:
    "header  header  header"
    "sidebar content aside"
    "footer  footer  footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

## Container Queries

容器查询让我们可以根据父容器而非视口大小来做响应式：

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}
```

## 响应式设计技巧

```css
/* 无媒体查询的响应式网格 */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 1rem;
}

/* 流体排版 */
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
}

/* 响应式边距 */
.section {
  padding: clamp(1rem, 5vw, 4rem) clamp(1rem, 5vw, 6rem);
}
```

## 总结

Flexbox、Grid 和 Container Queries 是现代 CSS 布局的三大支柱。熟练运用它们，你几乎可以实现任何想要的布局效果。
