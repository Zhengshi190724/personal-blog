import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { siteConfig } from '../src/config/site.js';
import {
  analyzePublicationChanges,
  parseGitStatus,
  resolvePublicationAssets,
  resolvePostTarget,
  validatePost,
} from './lib/post-tools.js';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const productionBranch = 'master';

function usage() {
  console.log(`
发布博客文章

用法：
  npm run publish -- <slug|Markdown 路径> [--dry-run]

示例：
  npm run publish -- fpga-learning-note --dry-run
  npm run publish -- fpga-learning-note
`);
}

function fail(message) {
  throw new Error(message);
}

function run(command, args, { capture = false, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: command === 'npm' && process.platform === 'win32',
    stdio: capture ? 'pipe' : 'inherit',
  });

  if (result.error) fail(`${command} 启动失败：${result.error.message}`);
  if (!allowFailure && result.status !== 0) {
    fail(`${command} ${args.join(' ')} 执行失败（退出码 ${result.status}）。`);
  }
  return result;
}

function git(args, options) {
  return run('git', args, options);
}

function parseArgs(args) {
  let input = '';
  let dryRun = false;

  for (const argument of args) {
    if (argument === '--help' || argument === '-h') return { help: true };
    if (argument === '--dry-run') {
      dryRun = true;
    } else if (argument.startsWith('-')) {
      fail(`未知参数：${argument}`);
    } else if (!input) {
      input = argument;
    } else {
      fail(`多余参数：${argument}`);
    }
  }

  return { input, dryRun };
}

function statusEntries() {
  const output = git(['status', '--porcelain=v1', '--untracked-files=all'], { capture: true }).stdout;
  return parseGitStatus(output);
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    process.exit(0);
  }

  const target = resolvePostTarget(repoRoot, options.input);
  if (!existsSync(target.absolutePath)) fail(`找不到文章：${target.repoPath}`);

  const raw = readFileSync(target.absolutePath, 'utf8');
  const validation = validatePost(raw);
  if (validation.errors.length > 0) {
    fail(`文章校验失败：\n- ${validation.errors.join('\n- ')}`);
  }
  if (validation.metadata.draft) {
    fail('文章仍是草稿。请将 draft 改为 "false" 后再发布。');
  }

  const { assets, missing } = resolvePublicationAssets(repoRoot, target.absolutePath, raw);
  if (missing.length > 0) {
    fail(`文章引用的本地图片不存在：\n${missing.join('\n')}`);
  }

  const entries = statusEntries();
  const {
    targetChanged,
    assetsChanged,
    unrelated,
  } = analyzePublicationChanges(entries, target.repoPath, assets);
  if (!targetChanged && assetsChanged.length === 0) {
    fail(`文章及其引用图片都没有未提交的修改：${target.repoPath}`);
  }

  const stagedUnrelated = unrelated.filter((entry) => entry.status[0] !== ' ' && entry.status[0] !== '?');
  if (stagedUnrelated.length > 0) {
    const details = stagedUnrelated.map((entry) => `${entry.status} ${entry.path}`).join('\n');
    fail(`暂存区中存在与本次文章无关的文件，请先提交或取消暂存：\n${details}`);
  }

  if (unrelated.length > 0) {
    console.log('\n提示：以下无关改动会保持原状，不会进入本次提交：');
    unrelated.forEach((entry) => console.log(`${entry.status} ${entry.path}`));
  }

  console.log(`\n正在检查文章：${validation.metadata.title}`);
  run('npm', ['run', 'build']);

  const tracked = git(['ls-files', '--error-unmatch', '--', target.repoPath], { capture: true, allowFailure: true }).status === 0;
  const action = tracked ? 'Update' : 'Add';
  const commitMessage = `${action} blog post: ${validation.metadata.title}`;
  const liveUrl = `${siteConfig.url.replace(/\/$/, '')}/posts/${target.slug}/`;

  if (options.dryRun) {
    console.log('\ndry-run 检查通过，没有修改 Git 历史或推送远程仓库。');
    console.log(`预计提交信息：${commitMessage}`);
    console.log(`预计同步图片：${assets.length} 张`);
    console.log(`预计线上地址：${liveUrl}`);
    process.exit(0);
  }

  const branch = git(['branch', '--show-current'], { capture: true }).stdout.trim();
  if (branch !== productionBranch) {
    fail(`当前分支是 ${branch || 'detached HEAD'}；线上发布必须在 ${productionBranch} 分支执行。`);
  }

  const publicationPaths = [target.repoPath, ...assets];
  git(['add', '--', ...publicationPaths]);
  const stagedNames = git(['diff', '--cached', '--name-only'], { capture: true }).stdout
    .split(/\r?\n/)
    .filter(Boolean);
  const unexpectedStaged = stagedNames.filter((path) => !publicationPaths.includes(path));
  if (unexpectedStaged.length > 0) {
    fail(`暂存区出现了非本次发布文件，提交已停止：\n${unexpectedStaged.join('\n')}`);
  }
  const staged = git(['diff', '--cached', '--quiet', '--', ...publicationPaths], { allowFailure: true });
  if (staged.status === 0) fail('暂存后没有检测到可提交的文章修改。');
  if (staged.status !== 1) fail('无法检查暂存区状态。');

  git(['commit', '-m', commitMessage]);
  git(['pull', '--rebase', '--autostash', 'origin', productionBranch]);
  git(['push', 'origin', productionBranch]);

  console.log('\n文章已推送，Cloudflare Pages 将自动开始部署。');
  console.log(`线上地址：${liveUrl}`);
} catch (error) {
  console.error(`\n发布失败：${error.message}`);
  console.error('脚本没有执行强制推送。请根据提示处理后重试。');
  process.exit(1);
}
