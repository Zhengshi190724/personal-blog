import { ArrowLeft, Layers3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO/SEO.jsx';
import PostCard from '../components/PostCard/PostCard.jsx';
import {
  getCategoryBySlug,
  getCategoryPath,
  getSubcategoryBySlug,
} from '../config/navigation.js';
import { siteConfig } from '../config/site.js';
import { usePosts } from '../hooks/usePosts.js';
import './IndexPages.css';

export default function CategoryPage() {
  const { category: categorySlug, subcategory: subcategorySlug } = useParams();
  const category = getCategoryBySlug(categorySlug);
  const subcategory = subcategorySlug ? getSubcategoryBySlug(category, subcategorySlug) : null;
  const { getPostsByCategory, getPostsBySubcategory } = usePosts();
  const posts = category
    ? (subcategory
      ? getPostsBySubcategory(category.name, subcategory.name)
      : getPostsByCategory(category.name))
    : [];

  if (!category || (subcategorySlug && !subcategory)) {
    return <div className="index-page empty-state"><Layers3 size={28} /><h2>分类不存在</h2><p>这个技术分类尚未建立。</p><Link className="primary-action" to="/posts/">返回文章</Link></div>;
  }

  const current = subcategory || category;
  const pagePath = getCategoryPath(category, subcategory);

  return (
    <div className="index-page">
      <SEO title={`${current.name} | ${siteConfig.name}`} description={current.description} path={pagePath} />
      <header className="index-hero">
        <div>
          <Link className="post-back" to={subcategory ? getCategoryPath(category) : '/posts/'}>
            <ArrowLeft size={15} /> {subcategory ? category.name : '全部文章'}
          </Link>
          <span className="section-eyebrow">{subcategory ? `${category.name} / Subcategory` : 'Category'}</span>
          <h1>{current.name}</h1>
        </div>
        <p>{current.description}<br />当前收录 {posts.length} 篇文章。</p>
      </header>
      {!subcategory && category.subcategories?.length > 0 && (
        <nav className="category-subnav" aria-label={`${category.name}细分类`}>
          <span>细分类</span>
          {category.subcategories.map((item) => (
            <Link key={item.slug} to={getCategoryPath(category, item)}>{item.name}</Link>
          ))}
        </nav>
      )}
      <section className="index-section posts-index-grid">
        {posts.length > 0 ? posts.map((post, index) => <PostCard key={post.slug} {...post} index={index} />) : <div className="empty-state"><h2>内容正在准备中</h2><p>该方向的文章会在完成验证和整理后发布。</p></div>}
      </section>
    </div>
  );
}
