import { ArrowLeft, Layers3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO/SEO.jsx';
import PostCard from '../components/PostCard/PostCard.jsx';
import { getCategoryBySlug } from '../config/navigation.js';
import { siteConfig } from '../config/site.js';
import { usePosts } from '../hooks/usePosts.js';
import './IndexPages.css';

export default function CategoryPage() {
  const { category: categorySlug } = useParams();
  const category = getCategoryBySlug(categorySlug);
  const { getPostsByCategory } = usePosts();
  const posts = category ? getPostsByCategory(category.name) : [];

  if (!category) {
    return <div className="index-page empty-state"><Layers3 size={28} /><h2>分类不存在</h2><p>这个技术分类尚未建立。</p><Link className="primary-action" to="/posts/">返回文章</Link></div>;
  }

  return (
    <div className="index-page">
      <SEO title={`${category.name} | ${siteConfig.name}`} description={category.description} path={`/categories/${category.slug}/`} />
      <header className="index-hero">
        <div><Link className="post-back" to="/posts/"><ArrowLeft size={15} /> 全部文章</Link><span className="section-eyebrow">Category</span><h1>{category.name}</h1></div>
        <p>{category.description}<br />当前收录 {posts.length} 篇文章。</p>
      </header>
      <section className="index-section posts-index-grid">
        {posts.length > 0 ? posts.map((post, index) => <PostCard key={post.slug} {...post} index={index} />) : <div className="empty-state"><h2>内容正在准备中</h2><p>该方向的文章会在完成验证和整理后发布。</p></div>}
      </section>
    </div>
  );
}
