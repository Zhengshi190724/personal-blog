import { ArrowLeft, ArrowUpRight, Map } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO/SEO.jsx';
import { getContentMapBySlug, getPostsForMap, getPostsForStage } from '../config/contentMaps.js';
import { siteConfig } from '../config/site.js';
import { usePosts } from '../hooks/usePosts.js';
import './IndexPages.css';

export default function ContentMapPage() {
  const { map: mapSlug } = useParams();
  const contentMap = getContentMapBySlug(mapSlug);
  const { posts } = usePosts();

  if (!contentMap) {
    return <div className="index-page empty-state"><Map size={28} /><h1>内容地图不存在</h1><p>该专题尚未建立。</p><Link className="primary-action" to="/posts/">返回文章</Link></div>;
  }

  const availablePosts = getPostsForMap(contentMap, posts);

  return (
    <div className="index-page content-map-page">
      <SEO title={`${contentMap.title} 学习地图 | ${siteConfig.name}`} description={contentMap.description} path={`/maps/${contentMap.slug}/`} />
      <header className="index-hero">
        <div><Link className="post-back" to="/posts/"><ArrowLeft size={15} /> 全部文章</Link><span className="section-eyebrow">{contentMap.eyebrow}</span><h1>{contentMap.title}</h1></div>
        <p>{contentMap.description}<br />当前关联 {availablePosts.length} 篇已发布文章。</p>
      </header>

      <div className="content-map-stages">
        {contentMap.stages.map((stage, index) => {
          const stagePosts = getPostsForStage(stage, posts);
          return (
            <section className="content-map-stage" key={stage.title}>
              <div className="content-map-stage__number">{String(index + 1).padStart(2, '0')}</div>
              <div className="content-map-stage__summary"><span>Stage {index + 1}</span><h2>{stage.title}</h2><p>{stage.description}</p></div>
              <div className="content-map-stage__posts">
                {stagePosts.length > 0 ? stagePosts.map((post) => (
                  <Link key={post.slug} to={`/posts/${post.slug}/`}><span>{post.category}</span><strong>{post.title}</strong><ArrowUpRight size={15} /></Link>
                )) : <span className="content-map-stage__empty">文章正在整理中</span>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
