import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { contentArtifactsPlugin } from './build/contentArtifacts.js';
import { siteConfig } from './src/config/site.js';
import { categories } from './src/config/navigation.js';

export default defineConfig({
  plugins: [
    react(),
    contentArtifactsPlugin({
      siteUrl: process.env.SITE_URL || siteConfig.url,
      siteTitle: siteConfig.title,
      description: siteConfig.description,
      categories,
    }),
  ],
  assetsInclude: ['**/*.md'],
});
