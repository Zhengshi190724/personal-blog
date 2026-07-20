import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALLOWED_CATEGORIES,
  createPostTemplate,
  formatLocalDate,
  resolvePostTarget,
  titleFromSlug,
} from './lib/post-tools.js';
import {
  getCategoryByName,
  getContentClassification,
  getSubcategoryByName,
} from '../src/config/navigation.js';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));

function usage() {
  console.log(`
创建新博客文章

用法：
  npm run new-post -- <slug|子目录/文件名> [--title "文章标题"] [--category 技术] [--subcategory SystemVerilog]

示例：
  npm run new-post -- sv-basics --title "SystemVerilog 基础" --category 技术 --subcategory SystemVerilog
  npm run new-post -- SystemVerilog/sv-interface --title "SystemVerilog interface"
  npm run new-post -- AAT/verbal-reasoning --title "行测言语理解"
`);
}

function parseArgs(args) {
  const options = { slug: '', title: '', category: '', subcategory: '' };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') return { help: true };
    if (argument === '--title') {
      options.title = args[++index] || '';
    } else if (argument === '--category') {
      options.category = args[++index] || '';
    } else if (argument === '--subcategory') {
      options.subcategory = args[++index] || '';
    } else if (argument.startsWith('-')) {
      throw new Error(`未知参数：${argument}`);
    } else if (!options.slug) {
      options.slug = argument;
    } else {
      throw new Error(`多余参数：${argument}`);
    }
  }

  return options;
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    process.exit(0);
  }

  const target = resolvePostTarget(repoRoot, options.slug);
  const folderClassification = getContentClassification(target.sourcePath);
  const categoryName = options.category || folderClassification?.category.name || '技术';
  const subcategoryName = options.subcategory || folderClassification?.subcategory.name || '';

  if (!ALLOWED_CATEGORIES.includes(categoryName)) {
    throw new Error(`category 必须是：${ALLOWED_CATEGORIES.join('、')}。`);
  }
  const category = getCategoryByName(categoryName);
  if (subcategoryName && !getSubcategoryByName(category, subcategoryName)) {
    const allowed = category?.subcategories?.map((item) => item.name).join('、');
    throw new Error(allowed
      ? `subcategory 必须是：${allowed}。`
      : `${categoryName} 暂未配置细分类。`);
  }
  if (folderClassification && (
    categoryName !== folderClassification.category.name
    || subcategoryName !== folderClassification.subcategory.name
  )) {
    throw new Error(
      `文件夹 ${target.sourcePath.split('/')[0]} 固定归入 ${folderClassification.category.name} / ${folderClassification.subcategory.name}。`,
    );
  }

  if (existsSync(target.absolutePath)) throw new Error(`文章已经存在：${target.repoPath}`);

  const filename = target.sourcePath.split('/').pop().replace(/\.md$/i, '');
  const title = options.title.trim() || titleFromSlug(filename);
  const template = createPostTemplate({
    title,
    date: formatLocalDate(),
    category: categoryName,
    subcategory: subcategoryName,
  });

  mkdirSync(dirname(target.absolutePath), { recursive: true });
  writeFileSync(target.absolutePath, template, { encoding: 'utf8', flag: 'wx' });
  console.log(`\n已创建：${target.repoPath}`);
  console.log('下一步：填写 tags、excerpt 和正文，然后运行：');
  console.log(`npm run publish -- "${target.repoPath}" --dry-run`);
} catch (error) {
  console.error(`\n创建失败：${error.message}`);
  usage();
  process.exit(1);
}
