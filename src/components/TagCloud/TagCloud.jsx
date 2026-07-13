import { Link } from 'react-router-dom';
import { Hash, Layers3 } from 'lucide-react';
import './TagCloud.css';

export default function TagCloud({ tags, selectedTag, postCount }) {

  return (
    <aside id="topics" className="tag-cloud liquid-glass">
      <div className="tag-cloud__header">
        <span className="tag-cloud__icon"><Layers3 size={17} /></span>
        <div>
          <span>INDEX</span>
          <h2>主题索引</h2>
        </div>
      </div>
      <nav className="tag-cloud-list" aria-label="文章主题">
        <Link to="/posts/" className={`tag-cloud-item ${!selectedTag ? 'tag-cloud-item--active' : ''}`}>
          <span><Hash size={13} /> 全部文章</span>
          <span className="tag-cloud-count">{postCount ?? 'ALL'}</span>
        </Link>
        {tags.map(({ name, count }) => (
          <Link
            key={name}
            to={`/tags/${name}/`}
            className={`tag-cloud-item ${selectedTag === name ? 'tag-cloud-item--active' : ''}`}
          >
            <span><Hash size={13} /> {name}</span>
            <span className="tag-cloud-count">{String(count).padStart(2, '0')}</span>
          </Link>
        ))}
      </nav>
      <p className="tag-cloud__note">Curated notes on technology, craft and the process behind the work.</p>
    </aside>
  );
}
