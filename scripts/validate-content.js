import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatPostErrors, validatePost } from '../src/content/post-schema.js';
import { postSlugFromRelativePath } from '../src/content/post-paths.js';
import { getContentClassification } from '../src/config/navigation.js';
import { findMarkdownFiles } from '../build/postData.js';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const contentDir = resolve(repoRoot, 'src', 'content');
const publicDir = resolve(repoRoot, 'public');
const failures = [];
let publishedCount = 0;
let draftCount = 0;

for (const filepath of findMarkdownFiles(contentDir).sort()) {
  const sourcePath = relative(contentDir, filepath).replaceAll('\\', '/');
  const slug = postSlugFromRelativePath(sourcePath);
  const result = validatePost(readFileSync(filepath, 'utf8'), { slug });
  const classification = getContentClassification(sourcePath);
  if (classification && (
    result.metadata.category !== classification.category.name
    || result.metadata.subcategory !== classification.subcategory.name
  )) {
    result.errors.push(
      `文件夹 ${sourcePath.split('/')[0]} 要求 category 为“${classification.category.name}”、subcategory 为“${classification.subcategory.name}”。`,
    );
  }

  if (result.metadata.cover.startsWith('/')) {
    const assetPath = resolve(publicDir, result.metadata.cover.slice(1));
    if (!existsSync(assetPath)) result.errors.push(`cover 对应的文件不存在：public${result.metadata.cover}`);
  }

  if (result.errors.length > 0) {
    failures.push(formatPostErrors(`src/content/${sourcePath}`, result.errors));
  } else if (result.metadata.draft) {
    draftCount += 1;
  } else {
    publishedCount += 1;
  }
}

if (failures.length > 0) {
  console.error(`\n内容校验失败（${failures.length} 个文件）：\n\n${failures.join('\n\n')}`);
  process.exit(1);
}

console.log(`内容校验通过：${publishedCount} 篇已发布，${draftCount} 篇草稿。`);
