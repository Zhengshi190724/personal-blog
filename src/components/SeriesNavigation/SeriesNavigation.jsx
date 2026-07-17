import { BookOpen, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SeriesNavigation.css';

export default function SeriesNavigation({ currentSlug, name, posts }) {
  if (!name || posts.length === 0) return null;
  const currentIndex = Math.max(0, posts.findIndex((post) => post.slug === currentSlug));
  const progress = ((currentIndex + 1) / posts.length) * 100;

  return (
    <nav className="series-navigation" aria-label={`系列：${name}`}>
      <div className="series-navigation__header">
        <span><BookOpen size={16} /> 系列文章</span>
        <strong>{currentIndex + 1} / {posts.length}</strong>
      </div>
      <h2>{name}</h2>
      <div className="series-navigation__progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <ol>
        {posts.map((post) => {
          const current = post.slug === currentSlug;
          return (
            <li key={post.slug}>
              <Link to={`/posts/${post.slug}/`} aria-current={current ? 'page' : undefined}>
                <span>{String(post.seriesOrder).padStart(2, '0')}</span>
                <strong>{post.title}</strong>
                {current && <Check size={15} aria-label="当前文章" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
