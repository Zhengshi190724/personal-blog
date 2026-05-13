import { useParams, Link } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts.js';
import PostCard from '../components/PostCard/PostCard.jsx';
import TagCloud from '../components/TagCloud/TagCloud.jsx';
import '../pages/HomePage.css';

export default function TagPage() {
  const { tag } = useParams();
  const { allTags, getPostsByTag } = usePosts();
  const posts = getPostsByTag(tag);

  return (
    <div className="home-layout">
      <div className="home-posts">
        {posts.length === 0 ? (
          <div className="home-empty">
            <p>No posts found for tag "{tag}".</p>
            <Link to="/">View all posts</Link>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              date={post.date}
              tags={post.tags}
              excerpt={post.excerpt}
            />
          ))
        )}
      </div>
      <TagCloud tags={allTags} selectedTag={tag} />
    </div>
  );
}
