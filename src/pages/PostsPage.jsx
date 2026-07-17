import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO/SEO.jsx';
import PostCard from '../components/PostCard/PostCard.jsx';
import TagCloud from '../components/TagCloud/TagCloud.jsx';
import { categories } from '../config/navigation.js';
import { siteConfig } from '../config/site.js';
import { usePosts } from '../hooks/usePosts.js';
import { contentMaps, getPostsForMap } from '../config/contentMaps.js';
import './IndexPages.css';

export default function PostsPage() {
  const { posts, allTags, getPostsByCategory } = usePosts();

  return (
    <div className="index-page">
      <SEO title={`文章 | ${siteConfig.name}`} description="浏览全部技术文章、教程与工程实践记录。" path="/posts/" />
      <header className="index-hero">
        <div><span className="section-eyebrow">Writing library</span><h1>文章</h1></div>
        <p>围绕 FPGA、数字通信、DSP、MATLAB 与工程实践建立可检索、可复用的技术笔记。</p>
      </header>

      <section className="index-section">
        <div className="index-section__heading">
          <div><span className="section-eyebrow">Learning maps</span><h2>从哪里开始</h2></div>
          <p>按学习依赖组织 FPGA、SystemVerilog 与 DSP 内容，逐步补全从基础到工程实践的路径。</p>
        </div>
        <div className="directory-grid">
          {contentMaps.map((contentMap, index) => (
            <Link className="directory-card liquid-glass" to={`/maps/${contentMap.slug}/`} key={contentMap.slug}>
              <div className="directory-card__top"><span>{String(index + 1).padStart(2, '0')}</span><span>{getPostsForMap(contentMap, posts).length} POSTS <ArrowUpRight size={13} /></span></div>
              <h3>{contentMap.title}</h3><p>{contentMap.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="index-section">
        <div className="index-section__heading">
          <div><span className="section-eyebrow">Categories</span><h2>文章分类</h2></div>
          <p>按照长期研究方向组织内容，新文章会根据 frontmatter 自动归档。</p>
        </div>
        <div className="directory-grid">
          {categories.map((category, index) => (
            <Link className="directory-card liquid-glass" to={`/categories/${category.slug}/`} key={category.slug}>
              <div className="directory-card__top"><span>{String(index + 1).padStart(2, '0')}</span><span>{getPostsByCategory(category.name).length} POSTS <ArrowUpRight size={13} /></span></div>
              <h3>{category.name}</h3><p>{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="posts-index-layout">
        <div className="posts-index-grid">
          {posts.map((post, index) => <PostCard key={post.slug} {...post} index={index} />)}
        </div>
        <TagCloud tags={allTags} postCount={posts.length} />
      </section>
    </div>
  );
}
