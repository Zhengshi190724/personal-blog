import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatPostErrors, validatePost } from '../src/content/post-schema.js';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const contentDir = resolve(repoRoot, 'src', 'content');
const publicDir = resolve(repoRoot, 'public');
const failures = [];
let publishedCount = 0;
let draftCount = 0;

for (const filename of readdirSync(contentDir).filter((name) => name.endsWith('.md')).sort()) {
  const slug = filename.replace(/\.md$/, '');
  const result = validatePost(readFileSync(resolve(contentDir, filename), 'utf8'), { slug });

  if (result.metadata.cover.startsWith('/')) {
    const assetPath = resolve(publicDir, result.metadata.cover.slice(1));
    if (!existsSync(assetPath)) result.errors.push(`cover 对应的文件不存在：public${result.metadata.cover}`);
  }

  if (result.errors.length > 0) {
    failures.push(formatPostErrors(`src/content/${filename}`, result.errors));
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
