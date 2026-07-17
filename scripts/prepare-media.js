import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const mediaRoot = resolve(projectRoot, 'public/images/posts');
const manifestPath = resolve(projectRoot, 'src/generated/media-manifest.json');
const targetWidths = [480, 960, 1440];
const originalPattern = /\.(?:jpe?g|png)$/i;
const generatedPattern = /-\d+w\.(?:webp|avif)$/i;

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function publicPath(filepath) {
  return `/${relative(resolve(projectRoot, 'public'), filepath).replaceAll('\\', '/')}`;
}

function outputPath(input, width, format) {
  return input.slice(0, -extname(input).length) + `-${width}w.${format}`;
}

function plannedWidths(sourceWidth) {
  const widths = targetWidths.filter((width) => width < sourceWidth);
  widths.push(Math.min(sourceWidth, targetWidths.at(-1)));
  return [...new Set(widths)].sort((a, b) => a - b);
}

async function createVariant(input, width, format) {
  const pipeline = sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true });
  const output = outputPath(input, width, format);
  const info = format === 'avif'
    ? await pipeline.avif({ quality: 52, effort: 4 }).toFile(output)
    : await pipeline.webp({ quality: 80, effort: 4 }).toFile(output);
  return { src: publicPath(output), width: info.width, height: info.height };
}

async function main() {
  mkdirSync(mediaRoot, { recursive: true });
  walk(mediaRoot).filter((path) => generatedPattern.test(path)).forEach((path) => rmSync(path));

  const originals = walk(mediaRoot).filter((path) => originalPattern.test(path));
  const manifest = {};

  for (const input of originals) {
    const metadata = await sharp(input).metadata();
    if (!metadata.width || !metadata.height) throw new Error(`无法读取图片尺寸：${input}`);
    const widths = plannedWidths(metadata.width);
    const avif = [];
    const webp = [];

    for (const width of widths) {
      avif.push(await createVariant(input, width, 'avif'));
      webp.push(await createVariant(input, width, 'webp'));
    }

    const src = publicPath(input);
    manifest[src] = {
      src,
      width: metadata.width,
      height: metadata.height,
      sources: { avif, webp },
    };
  }

  mkdirSync(resolve(manifestPath, '..'), { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`媒体准备完成：${originals.length} 张原图，生成 ${originals.length * 2} 组 AVIF/WebP 响应式资源。`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
