import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultReviewMonth, generateMonthlyReview } from './lib/monthly-review.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log('用法: npm run review:month -- [YYYY-MM] [--history <阅读记录.json>]');
  process.exit(0);
}

const month = args.find((arg) => !arg.startsWith('--')) || defaultReviewMonth();
const historyFlag = args.indexOf('--history');
let history = {};

if (historyFlag >= 0) {
  const historyPath = args[historyFlag + 1];
  if (!historyPath || historyPath.startsWith('--')) {
    throw new Error('--history 后必须提供阅读记录 JSON 文件路径。');
  }
  history = JSON.parse(readFileSync(resolve(process.cwd(), historyPath), 'utf8'));
}

const outputDirectory = resolve(projectRoot, 'docs', 'reviews');
const outputPath = resolve(outputDirectory, `${month}.md`);
if (existsSync(outputPath)) {
  throw new Error(`复盘文件已存在，不会覆盖：${outputPath}`);
}

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, generateMonthlyReview({ month, history }), 'utf8');
console.log(`已创建月度复盘：${outputPath}`);
