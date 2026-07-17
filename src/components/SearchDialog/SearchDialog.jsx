import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Clock3, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts.js';
import { recordSearchQuery } from '../../utils/readingHistory.js';
import './SearchDialog.css';

function normalize(value) {
  return value.toLocaleLowerCase('zh-CN').replace(/\s+/g, ' ').trim();
}

function scorePost(post, query) {
  const title = normalize(post.title);
  const tags = normalize(post.tags.join(' '));
  const excerpt = normalize(post.excerpt);
  const content = normalize((post.content || '').replace(/[#*`>\[\]()_-]/g, ' '));
  let score = 0;

  if (title === query) score += 20;
  if (title.startsWith(query)) score += 12;
  if (title.includes(query)) score += 8;
  if (tags.includes(query)) score += 6;
  if (excerpt.includes(query)) score += 3;
  if (content.includes(query)) score += 1;
  return score;
}

export default function SearchDialog({ open, onOpen, onClose }) {
  const { posts, loadAllPostContents } = usePosts();
  const [query, setQuery] = useState('');
  const [searchablePosts, setSearchablePosts] = useState(posts);
  const [isIndexing, setIsIndexing] = useState(false);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return posts.slice(0, 5);

    return searchablePosts
      .map((post) => ({ post, score: scorePost(post, normalizedQuery) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || new Date(b.post.date) - new Date(a.post.date))
      .slice(0, 8)
      .map(({ post }) => post);
  }, [query, posts, searchablePosts]);

  useEffect(() => {
    if (!open || !query.trim() || searchablePosts.some((post) => post.content)) return undefined;
    let active = true;
    setIsIndexing(true);
    loadAllPostContents()
      .then((loadedPosts) => {
        if (active) setSearchablePosts(loadedPosts.filter(Boolean));
      })
      .finally(() => {
        if (active) setIsIndexing(false);
      });
    return () => {
      active = false;
    };
  }, [loadAllPostContents, open, query, searchablePosts]);

  useEffect(() => {
    if (!open || !query.trim() || isIndexing) return undefined;
    const timer = window.setTimeout(() => {
      recordSearchQuery(query, results.length);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [isIndexing, open, query, results.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      const commandK = event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey);
      const slash = event.key === '/' && !isTyping;

      if (commandK || slash) {
        event.preventDefault();
        onOpen();
      } else if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpen, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="search-dialog liquid-glass" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <div className="search-dialog__header">
          <Search size={18} />
          <label id="search-title" className="sr-only" htmlFor="site-search">搜索文章</label>
          <input
            ref={inputRef}
            id="site-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索文章、标签或正文…"
            autoComplete="off"
          />
          <button type="button" onClick={onClose} aria-label="关闭搜索"><X size={17} /></button>
        </div>

        <div className="search-dialog__status">
          <span>{isIndexing ? '正在检索正文…' : query ? `${results.length} 条结果` : '最近文章'}</span>
          <span>ESC 关闭</span>
        </div>

        <div className="search-results" aria-live="polite">
          {results.length === 0 ? (
            <div className="search-empty">
              <strong>没有匹配的文章</strong>
              <span>尝试更短的关键词或标签名称。</span>
            </div>
          ) : results.map((post) => (
            <Link key={post.slug} to={`/posts/${post.slug}/`} onClick={onClose}>
              <div>
                <span>{post.tags.slice(0, 2).map((tag) => `#${tag}`).join('  ')}</span>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </div>
              <span className="search-result__meta"><Clock3 size={13} /> {post.readingTime} 分钟</span>
              <ArrowUpRight className="search-result__arrow" size={18} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
