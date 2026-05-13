import { Link } from 'react-router-dom';
import './TagCloud.css';

export default function TagCloud({ tags, selectedTag }) {
  return (
    <aside className="tag-cloud">
      <h3 className="tag-cloud-title">Tags</h3>
      <ul className="tag-cloud-list">
        <li>
          <Link
            to="/"
            className={`tag-cloud-item ${!selectedTag ? 'tag-cloud-item--active' : ''}`}
          >
            All Posts
          </Link>
        </li>
        {tags.map(({ name, count }) => (
          <li key={name}>
            <Link
              to={`/tag/${name}`}
              className={`tag-cloud-item ${selectedTag === name ? 'tag-cloud-item--active' : ''}`}
            >
              {name}
              <span className="tag-cloud-count">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
