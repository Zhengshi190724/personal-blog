import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Hash } from 'lucide-react';
import { usePosts } from '../hooks/usePosts.js';
import PostCard from '../components/PostCard/PostCard.jsx';
import TagCloud from '../components/TagCloud/TagCloud.jsx';
import SEO from '../components/SEO/SEO.jsx';
import { siteConfig } from '../config/site.js';
import './HomePage.css';

export default function TagPage() {
  const { tag } = useParams();
  const { allTags, getPostsByTag, posts: allPosts } = usePosts();
  const posts = getPostsByTag(tag);

  return (
    <div className="tag-page">
      <SEO
        title={`${tag} 相关文章 | ${siteConfig.name}`}
        description={`浏览 ${siteConfig.name} 中关于 ${tag} 的文章与技术笔记。`}
        path={`/tags/${tag}/`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${tag} 相关文章`,
          url: `${siteConfig.url}/tags/${encodeURIComponent(tag)}/`,
        }}
      />
      <motion.header
        className="tag-page__header"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link className="post-back" to="/posts/"><ArrowLeft size={15} /> 全部文章</Link>
        <span className="section-eyebrow">Topic archive</span>
        <h1><Hash size={36} />{tag}</h1>
        <p>{posts.length} 篇关于“{tag}”的记录。</p>
      </motion.header>

      <div className="home-layout tag-page__layout">
        <div className="home-posts">
          {posts.length === 0 ? (
            <div className="home-empty">
              <p>这个主题下还没有文章。</p>
              <Link to="/">查看全部文章</Link>
            </div>
          ) : (
            posts.map((post, index) => <PostCard key={post.slug} {...post} index={index} />)
          )}
        </div>
        <TagCloud tags={allTags} selectedTag={tag} postCount={allPosts.length} />
      </div>
    </div>
  );
}
