import { useMemo } from 'react';
import { getAllPosts, getPostBySlug, getPostsByTag, getAllTags } from '../utils/posts.js';

export function usePosts() {
  const posts = useMemo(() => getAllPosts(), []);
  const allTags = useMemo(() => getAllTags(), []);

  return { posts, allTags, getPostBySlug, getPostsByTag };
}
