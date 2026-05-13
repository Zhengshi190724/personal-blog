import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { usePosts } from '../hooks/usePosts.js';
import 'highlight.js/styles/github.css';
import './PostPage.css';

export default function PostPage() {
  const { slug } = useParams();
  const { getPostBySlug } = usePosts();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="post-not-found">
        <h1>Post Not Found</h1>
        <p>The post "{slug}" does not exist.</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <article className="post">
      <Link to="/" className="post-back">&larr; Back to Home</Link>
      <header className="post-header">
        <h1 className="post-title">{post.title}</h1>
        {post.date && (
          <time className="post-date" dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <Link key={tag} to={`/tag/${tag}`} className="post-tag">
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>
      <div className="post-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
