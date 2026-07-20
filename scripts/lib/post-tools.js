import { existsSync, readdirSync } from 'node:fs';
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path';
import {
  ALLOWED_CATEGORIES,
  PLACEHOLDER_BODY,
  PLACEHOLDER_EXCERPT,
  isPublishedPost,
  parseFrontmatter,
  validatePost,
  validateSlug,
} from '../../src/content/post-schema.js';
import { postSlugFromRelativePath } from '../../src/content/post-paths.js';

export {
  ALLOWED_CATEGORIES,
  PLACEHOLDER_BODY,
  PLACEHOLDER_EXCERPT,
  isPublishedPost,
  parseFrontmatter,
  validatePost,
  validateSlug,
};

export function titleFromSlug(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function yamlString(value) {
  return JSON.stringify(String(value));
}

export function createPostTemplate({ title, date, category, subcategory = '' }) {
  return `---
title: ${yamlString(title)}
date: ${yamlString(date)}
updated: ${yamlString(date)}
tags: []
category: ${yamlString(category)}
${subcategory ? `subcategory: ${yamlString(subcategory)}\n` : ''}featured: "false"
draft: "true"
excerpt: ${yamlString(PLACEHOLDER_EXCERPT)}
# series: "可选系列名称"
# seriesOrder: "1"
---

# ${title}

${PLACEHOLDER_BODY}
`;
}

export function resolvePostTarget(repoRoot, input) {
  if (!input?.trim()) throw new Error('请提供文章 slug 或 Markdown 文件路径。');

  const contentDir = resolve(repoRoot, 'src', 'content');
  const normalizedInput = input.trim().replace(/\\/g, '/');
  const contentInput = normalizedInput.replace(/^src\/content\//i, '');
  let candidate;
  if (isAbsolute(normalizedInput)) {
    candidate = resolve(normalizedInput);
  } else if (normalizedInput.startsWith('src/content/')) {
    candidate = resolve(repoRoot, normalizedInput);
  } else if (normalizedInput.endsWith('.md') || normalizedInput.includes('/')) {
    candidate = resolve(contentDir, contentInput.endsWith('.md') ? contentInput : `${contentInput}.md`);
  } else {
    candidate = resolve(contentDir, `${normalizedInput}.md`);
    if (!existsSync(candidate)) {
      const matches = findMarkdownFiles(contentDir).filter((filepath) => {
        const sourcePath = relative(contentDir, filepath).replaceAll('\\', '/');
        return postSlugFromRelativePath(sourcePath) === normalizedInput;
      });
      if (matches.length === 1) [candidate] = matches;
      if (matches.length > 1) throw new Error(`slug ${normalizedInput} 对应多篇文章，请改用 Markdown 路径。`);
    }
  }

  const sourcePath = relative(contentDir, candidate).replaceAll('\\', '/');
  if (!sourcePath
    || isAbsolute(sourcePath)
    || sourcePath.startsWith('..')
    || extname(candidate).toLowerCase() !== '.md'
    || sourcePath.split('/').some((part) => part.startsWith('.'))) {
    throw new Error('文章必须位于 src/content 目录或其公开子目录中。');
  }

  const slug = postSlugFromRelativePath(sourcePath);
  validateSlug(slug);
  return {
    absolutePath: candidate,
    repoPath: `src/content/${sourcePath}`,
    sourcePath,
    slug,
  };
}

function findMarkdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.')) return [];
    const filepath = resolve(directory, entry.name);
    if (entry.isDirectory()) return findMarkdownFiles(filepath);
    return entry.isFile() && entry.name.endsWith('.md') ? [filepath] : [];
  });
}

export function parseGitStatus(output) {
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => ({ status: line.slice(0, 2), path: line.slice(3).replace(/^"|"$/g, '') }));
}

export function analyzePublicationChanges(entries, targetRepoPath, assetRepoPaths = []) {
  const allowed = new Set([targetRepoPath, ...assetRepoPaths]);
  return {
    targetChanged: entries.some((entry) => entry.path === targetRepoPath),
    assetsChanged: entries.filter((entry) => assetRepoPaths.includes(entry.path)),
    unrelated: entries.filter((entry) => !allowed.has(entry.path)),
  };
}

const LOCAL_IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);

function markdownImageDestinations(raw) {
  const destinations = [];
  const pattern = /!\[[^\]]*]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g;
  let match;
  while ((match = pattern.exec(raw)) !== null) destinations.push(match[1] || match[2]);
  return destinations;
}

function cleanDestination(value) {
  const withoutSuffix = value.split(/[?#]/, 1)[0];
  try {
    return decodeURIComponent(withoutSuffix).replaceAll('\\', '/');
  } catch {
    return withoutSuffix.replaceAll('\\', '/');
  }
}

export function resolvePublicationAssets(repoRoot, targetAbsolutePath, raw) {
  const publicImagesRoot = resolve(repoRoot, 'public', 'images');
  const destinations = markdownImageDestinations(raw);
  const cover = parseFrontmatter(raw).data.cover;
  if (typeof cover === 'string' && cover) destinations.push(cover);

  const assets = [];
  const missing = [];
  for (const rawDestination of destinations) {
    if (/^(?:https?:|data:|blob:)/i.test(rawDestination)) continue;

    const destination = cleanDestination(rawDestination);
    let absolutePath;
    if (destination.startsWith('/images/')) {
      absolutePath = resolve(repoRoot, 'public', destination.slice(1));
    } else {
      const publicIndex = destination.indexOf('public/images/');
      absolutePath = publicIndex >= 0
        ? resolve(repoRoot, destination.slice(publicIndex))
        : resolve(dirname(targetAbsolutePath), destination);
    }

    const relativeToImages = relative(publicImagesRoot, absolutePath);
    const validLocation = relativeToImages
      && !isAbsolute(relativeToImages)
      && !relativeToImages.startsWith('..');
    if (!validLocation || !LOCAL_IMAGE_EXTENSIONS.has(extname(absolutePath).toLowerCase())) {
      continue;
    }

    const repoPath = relative(repoRoot, absolutePath).replaceAll('\\', '/');
    if (!existsSync(absolutePath)) {
      missing.push(repoPath);
    } else {
      assets.push(repoPath);
    }
  }

  return {
    assets: [...new Set(assets)],
    missing: [...new Set(missing)],
  };
}
