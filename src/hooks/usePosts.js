import { useMemo } from 'react';
import {
  getAllPosts,
  getPostBySlug,
  getPostsByTag,
  getAllTags,
  getAdjacentPosts,
  getRelatedPosts,
  getPostsByCategory,
  getFeaturedPosts,
  loadAllPostContents,
  loadPostBySlug,
  getPostsBySeries,
} from '../utils/posts.js';

export function usePosts() {
  const posts = useMemo(() => getAllPosts(), []);
  const allTags = useMemo(() => getAllTags(), []);

  return {
    posts,
    allTags,
    getPostBySlug,
    getPostsByTag,
    getAdjacentPosts,
    getRelatedPosts,
    getPostsByCategory,
    getFeaturedPosts,
    loadAllPostContents,
    loadPostBySlug,
    getPostsBySeries,
  };
}
