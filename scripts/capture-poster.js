import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = resolve(projectRoot, 'public/images/ambient-poster.jpg');
const videoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.setContent(`
    <style>
      * { margin: 0; }
      body { background: #0c0c0c; }
      video { display: block; width: 1920px; height: 1080px; object-fit: cover; }
    </style>
    <video muted autoplay playsinline src="${videoUrl}"></video>
  `);
  await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2, null, { timeout: 30_000 });
  await page.locator('video').evaluate((video) => video.play());
  await page.waitForTimeout(1800);
  mkdirSync(resolve(output, '..'), { recursive: true });
  await page.locator('video').screenshot({ path: output, type: 'jpeg', quality: 82 });
  console.log(`背景 poster 已生成：${output}`);
} finally {
  await browser.close();
}
