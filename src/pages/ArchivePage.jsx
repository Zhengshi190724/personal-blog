import { ArrowUpRight, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO/SEO.jsx';
import { categories } from '../config/navigation.js';
import { siteConfig } from '../config/site.js';
import { usePosts } from '../hooks/usePosts.js';
import './IndexPages.css';

export default function ArchivePage() {
  const { posts, allTags, getPostsByCategory } = usePosts();
  const byYear = posts.reduce((groups, post) => {
    const year = post.date.slice(0, 4) || '未注明';
    groups[year] = [...(groups[year] || []), post];
    return groups;
  }, {});

  return (
    <div className="index-page">
      <SEO title={`归档 | ${siteConfig.name}`} description="按年份、分类和标签浏览全部文章。" path="/archive/" />
      <header className="index-hero">
        <div><span className="section-eyebrow">Archive index</span><h1>归档</h1></div>
        <p>从时间、技术分类和标签三个维度回看已发布内容。</p>
      </header>

      <section id="years" className="index-section">
        <div className="index-section__heading"><div><span className="section-eyebrow">By year</span><h2>按年份</h2></div></div>
        <div className="archive-years">
          {Object.entries(byYear).map(([year, yearPosts]) => (
            <div className="archive-year" key={year}><strong>{year}</strong><div className="archive-year__posts">
              {yearPosts.map((post) => <Link key={post.slug} to={`/posts/${post.slug}/`}><time>{post.date.slice(5)}</time><strong>{post.title}</strong><span>{post.category}</span></Link>)}
            </div></div>
          ))}
        </div>
      </section>

      <section id="categories" className="index-section">
        <div className="index-section__heading"><div><span className="section-eyebrow">By category</span><h2>按分类</h2></div></div>
        <div className="directory-grid">
          {categories.map((category) => <Link className="directory-card liquid-glass" key={category.slug} to={`/categories/${category.slug}/`}><div className="directory-card__top"><span>{getPostsByCategory(category.name).length} POSTS</span><ArrowUpRight size={14} /></div><h3>{category.name}</h3><p>{category.description}</p></Link>)}
        </div>
      </section>

      <section id="tags" className="index-section">
        <div className="index-section__heading"><div><span className="section-eyebrow">By tag</span><h2>按标签</h2></div></div>
        <div className="tag-index">{allTags.map(({ name, count }) => <Link key={name} to={`/tags/${name}/`}><Hash size={13} />{name}<span>{count}</span></Link>)}</div>
      </section>
    </div>
  );
}
