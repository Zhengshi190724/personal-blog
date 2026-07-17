import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSiteUrl } from '../src/config/site.js';

test('normalizes the canonical site origin', () => {
  assert.equal(normalizeSiteUrl('https://blog.example.com/'), 'https://blog.example.com');
  assert.throws(() => normalizeSiteUrl('http://blog.example.com'), /HTTPS/);
  assert.throws(() => normalizeSiteUrl('https://blog.example.com/subpath'), /子路径/);
  assert.throws(() => normalizeSiteUrl('https://blog.example.com/?preview=1'), /查询参数/);
});

test('reads VITE_SITE_URL as the single canonical build setting', async () => {
  const previous = process.env.VITE_SITE_URL;
  process.env.VITE_SITE_URL = 'https://notes.example.com';
  try {
    const { siteConfig } = await import(`../src/config/site.js?site-test=${Date.now()}`);
    assert.equal(siteConfig.url, 'https://notes.example.com');
  } finally {
    if (previous === undefined) delete process.env.VITE_SITE_URL;
    else process.env.VITE_SITE_URL = previous;
  }
});
