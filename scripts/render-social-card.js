import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = resolve(projectRoot, 'public', 'social-card.svg');
const output = resolve(projectRoot, 'public', 'social-card.png');

await sharp(source, { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9, palette: true })
  .toFile(output);

console.log('社交分享图已生成：public/social-card.png（1200x630）。');
