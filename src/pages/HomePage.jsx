import { usePosts } from '../hooks/usePosts.js';
import PostCard from '../components/PostCard/PostCard.jsx';
import TagCloud from '../components/TagCloud/TagCloud.jsx';
import './HomePage.css';

export default function HomePage() {
  const { posts, allTags } = usePosts();

  return (
    <div className="home-layout">
      <div className="home-posts">
        {posts.length === 0 ? (
          <p className="home-empty">No posts yet. Check back soon!</p>
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
      <TagCloud tags={allTags} selectedTag={null} />
    </div>
  );
}
