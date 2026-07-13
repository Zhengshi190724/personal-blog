import { ArrowLeft, ArrowRight, CornerDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ArticleNavigation.css';

function AdjacentLink({ post, direction }) {
  if (!post) return <div className="article-adjacent article-adjacent--empty" aria-hidden="true" />;
  const isPrevious = direction === 'previous';

  return (
    <Link className="article-adjacent liquid-glass" to={`/posts/${post.slug}/`}>
      <span>{isPrevious ? <ArrowLeft size={15} /> : null}{isPrevious ? '上一篇' : '下一篇'}{!isPrevious ? <ArrowRight size={15} /> : null}</span>
      <strong>{post.title}</strong>
    </Link>
  );
}

export default function ArticleNavigation({ previous, next, related }) {
  return (
    <section className="article-navigation" aria-label="继续阅读">
      <div className="article-adjacent-grid">
        <AdjacentLink post={previous} direction="previous" />
        <AdjacentLink post={next} direction="next" />
      </div>

      {related.length > 0 && (
        <div className="related-posts">
          <span className="section-eyebrow">Related notes</span>
          <h2>继续探索相关内容</h2>
          <div className="related-posts__list">
            {related.map((post) => (
              <Link key={post.slug} to={`/posts/${post.slug}/`}>
                <span>{post.tags[0] || 'note'}</span>
                <strong>{post.title}</strong>
                <CornerDownRight size={17} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
