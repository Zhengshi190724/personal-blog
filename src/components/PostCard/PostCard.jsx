import { Link } from 'react-router-dom';
import './PostCard.css';

export default function PostCard({ slug, title, date, tags, excerpt }) {
  return (
    <article className="post-card">
      <Link to={`/post/${slug}`} className="post-card-link">
        <h2 className="post-card-title">{title}</h2>
      </Link>
      {date && (
        <time className="post-card-date" dateTime={date}>
          {new Date(date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      )}
      {tags.length > 0 && (
        <div className="post-card-tags">
          {tags.map((tag) => (
            <Link key={tag} to={`/tag/${tag}`} className="post-card-tag">
              {tag}
            </Link>
          ))}
        </div>
      )}
      <p className="post-card-excerpt">{excerpt}</p>
      <Link to={`/post/${slug}`} className="post-card-readmore">
        Read more &rarr;
      </Link>
    </article>
  );
}
