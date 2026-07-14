import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  ALLOWED_CATEGORIES,
  createPostTemplate,
  formatLocalDate,
  resolvePostTarget,
  titleFromSlug,
} from './lib/post-tools.js';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));

function usage() {
  console.log(`
创建新博客文章

用法：
  npm run new-post -- <slug> [--title "文章标题"] [--category 技术]

示例：
  npm run new-post -- fpga-learning-note --title "FPGA 学习笔记" --category 技术
`);
}

function parseArgs(args) {
  const options = { slug: '', title: '', category: '技术' };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') return { help: true };
    if (argument === '--title') {
      options.title = args[++index] || '';
    } else if (argument === '--category') {
      options.category = args[++index] || '';
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

  if (!ALLOWED_CATEGORIES.includes(options.category)) {
    throw new Error(`category 必须是：${ALLOWED_CATEGORIES.join('、')}。`);
  }

  const target = resolvePostTarget(repoRoot, options.slug);
  if (existsSync(target.absolutePath)) throw new Error(`文章已经存在：${target.repoPath}`);

  const title = options.title.trim() || titleFromSlug(target.slug);
  const template = createPostTemplate({
    title,
    date: formatLocalDate(),
    category: options.category,
  });

  writeFileSync(target.absolutePath, template, { encoding: 'utf8', flag: 'wx' });
  console.log(`\n已创建：${target.repoPath}`);
  console.log('下一步：填写 tags、excerpt 和正文，然后运行：');
  console.log(`npm run publish -- ${target.slug} --dry-run`);
} catch (error) {
  console.error(`\n创建失败：${error.message}`);
  usage();
  process.exit(1);
}
