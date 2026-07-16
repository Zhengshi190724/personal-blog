import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUpRight, BookOpen, Braces } from 'lucide-react';
import { usePosts } from '../hooks/usePosts.js';
import SEO from '../components/SEO/SEO.jsx';
import { siteConfig } from '../config/site.js';
import PostCard from '../components/PostCard/PostCard.jsx';
import TypewriterText from '../components/TypewriterText/TypewriterText.jsx';
import { categories } from '../config/navigation.js';
import './HomePage.css';
import './IndexPages.css';

const reveal = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { posts, allTags, getFeaturedPosts, getPostsByCategory } = usePosts();
  const latestPost = posts[0];
  const featuredPosts = getFeaturedPosts();
  const totalMinutes = posts.reduce((sum, post) => sum + post.readingTime, 0);

  return (
    <div className="home-page">
      <SEO
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: siteConfig.name,
          description: siteConfig.description,
          url: siteConfig.url,
          author: { '@type': 'Person', name: siteConfig.author },
        }}
      />
      <section className="home-hero" aria-labelledby="hero-title">
        <motion.div
          className="home-hero__eyebrow section-eyebrow"
          {...reveal}
          transition={{ duration: 0.7, delay: 0.18 }}
        >
          个人Blog · 2026
        </motion.div>

        <motion.h1
          id="hero-title"
          className="home-hero__statement shiny-text"
          {...reveal}
          transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          欢迎来到我的空间！
        </motion.h1>

        <motion.p
          className="home-hero__copy"
          {...reveal}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <TypewriterText />
        </motion.p>

        <motion.div
          className="home-hero__actions"
          {...reveal}
          transition={{ duration: 0.7, delay: 0.62 }}
        >
          {latestPost && (
            <Link className="primary-action" to={`/posts/${latestPost.slug}/`}>
              阅读最新文章
              <ArrowUpRight size={16} />
            </Link>
          )}
          <Link className="secondary-action" to="/posts/">
            浏览全部文章
            <ArrowDown size={16} />
          </Link>
        </motion.div>

        <motion.div
          className="home-hero__metrics"
          {...reveal}
          transition={{ duration: 0.7, delay: 0.75 }}
        >
          <span><strong>{String(posts.length).padStart(2, '0')}</strong> 篇文章</span>
          <span><strong>{String(allTags.length).padStart(2, '0')}</strong> 个主题</span>
          <span><strong>{String(totalMinutes).padStart(2, '0')}</strong> 分钟阅读</span>
        </motion.div>
      </section>

      <motion.div
        className="signal-strip"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <span><Braces size={14} /> BUILD / THINK / SHARE</span>
        <span className="signal-strip__center">正在持续更新</span>
        <span><span className="signal-dot" /> SHANNXI · CN</span>
      </motion.div>

      <section id="latest" className="writing-section home-section" aria-labelledby="writing-title">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">Latest dispatches</span>
            <h2 id="writing-title">最近写下的内容</h2>
          </div>
          <p>从工程实践到设计观察，每一篇都是可以再次使用的思考。</p>
        </div>

        <div className="home-posts home-posts--landing">
            {posts.length === 0 ? (
              <p className="home-empty">文章正在整理中。</p>
            ) : (
              posts.slice(0, 3).map((post, index) => (
                <PostCard
                  key={post.slug}
                  {...post}
                  index={index}
                  featured={index === 0}
                />
              ))
            )}
        </div>
        <Link className="home-section__more" to="/posts/">查看全部 {posts.length} 篇文章 <ArrowUpRight size={15} /></Link>
      </section>

      <section id="featured" className="writing-section home-section">
        <div className="section-heading">
          <div><span className="section-eyebrow">Editor&apos;s picks</span><h2>精选文章</h2></div>
          <p>经过完整整理、适合系统阅读的教程与实践记录。</p>
        </div>
        <div className="home-posts home-posts--landing">
          {featuredPosts.map((post, index) => <PostCard key={post.slug} {...post} index={index} />)}
        </div>
      </section>

      <section id="directions" className="writing-section home-section">
        <div className="section-heading">
          <div><span className="section-eyebrow">Categories</span><h2>内容分类</h2></div>
          <p>按技术、生活、娱乐和杂项整理内容，让不同主题的记录更容易查找。</p>
        </div>
        <div className="directory-grid">
          {categories.map((category, index) => (
            <Link className="directory-card liquid-glass" to={`/categories/${category.slug}/`} key={category.slug}>
              <div className="directory-card__top"><span>{String(index + 1).padStart(2, '0')}</span><span>{getPostsByCategory(category.name).length} POSTS</span></div>
              <h3>{category.name}</h3><p>{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="profile" className="about-band">
        <div className="about-band__icon" aria-hidden="true"><BookOpen size={22} /></div>
        <div>
          <span className="section-eyebrow">Personal profile</span>
          <h2>让每一次解决问题，都成为下一次的起点。</h2>
        </div>
        <div className="about-band__summary"><p>关注 FPGA、数字通信、DSP 与工程实现，记录开发过程中的判断、方法和复盘。</p><Link to="/about/">查看个人简介 <ArrowUpRight size={14} /></Link></div>
      </section>
    </div>
  );
}
