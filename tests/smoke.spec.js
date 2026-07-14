import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/posts/', '/archive/', '/about/', '/posts/markdown_note/'];

for (const route of publicRoutes) {
  test(`${route} renders without browser errors or horizontal overflow`, async ({ page }) => {
    const browserErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text());
    });
    page.on('pageerror', (error) => browserErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBe(true);
    await expect(page.locator('#root')).toBeVisible();
    expect(browserErrors).toEqual([]);

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasOverflow).toBe(false);
  });
}

test('article route exposes canonical and social metadata', async ({ page }) => {
  await page.goto('/posts/markdown_note/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Markdown 实用教程/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/posts\/markdown_note\/$/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/social-card\.png$/);
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute('content', '2026-07-13');
});
