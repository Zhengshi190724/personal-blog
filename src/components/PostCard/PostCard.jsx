import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { getCategoryByName } from '../../config/navigation.js';
import './PostCard.css';

export default function PostCard({ slug, title, date, tags, category, excerpt, readingTime, index = 0, featured = false }) {
  const categoryConfig = getCategoryByName(category);
  const formattedDate = date
    ? new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    : '';

  return (
    <motion.article
      className={`post-card liquid-glass ${featured ? 'post-card--featured' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.24), ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="post-card__topline">
        <span className="post-card__number">{String(index + 1).padStart(2, '0')}</span>
        <div className="post-card__meta">
          {formattedDate && <time dateTime={date}>{formattedDate}</time>}
          <span><Clock3 size={13} /> {readingTime} 分钟</span>
        </div>
      </div>

      <Link to={`/posts/${slug}/`} className="post-card-link">
        <h3 className="post-card-title">{title}</h3>
      </Link>

      <p className="post-card-excerpt">{excerpt}</p>

      <div className="post-card__footer">
        <div className="post-card-tags">
          {categoryConfig && <Link to={`/categories/${categoryConfig.slug}/`} className="post-card-category">{categoryConfig.name}</Link>}
          {tags.slice(0, featured ? 4 : 2).map((tag) => (
            <Link key={tag} to={`/tags/${tag}/`} className="post-card-tag">#{tag}</Link>
          ))}
        </div>
        <Link to={`/posts/${slug}/`} className="post-card-readmore" aria-label={`阅读《${title}》`}>
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </motion.article>
  );
}
