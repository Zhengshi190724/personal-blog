import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { contentArtifactsPlugin } from './build/contentArtifacts.js';
import { postMetadataPlugin } from './build/postMetadataPlugin.js';
import { siteConfig } from './src/config/site.js';
import { categories } from './src/config/navigation.js';
import { contentMaps } from './src/config/contentMaps.js';

export default defineConfig({
  build: {
    manifest: true,
  },
  plugins: [
    react(),
    postMetadataPlugin(),
    contentArtifactsPlugin({
      siteUrl: siteConfig.url,
      siteTitle: siteConfig.title,
      siteName: siteConfig.name,
      description: siteConfig.description,
      author: siteConfig.author,
      socialImage: siteConfig.socialImage,
      socialImageAlt: siteConfig.socialImageAlt,
      categories,
      contentMaps,
    }),
  ],
  assetsInclude: ['**/*.md'],
});
