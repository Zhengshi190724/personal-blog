import { resolve } from 'node:path';
import { loadPostRecords } from './postData.js';

const PUBLIC_ID = 'virtual:post-metadata';
const RESOLVED_ID = `\0${PUBLIC_ID}`;

export function postMetadataPlugin() {
  let contentDir;

  return {
    name: 'blog-post-metadata',
    configResolved(config) {
      contentDir = resolve(config.root, 'src/content');
    },
    resolveId(id) {
      return id === PUBLIC_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      return `export default ${JSON.stringify(loadPostRecords(contentDir))};`;
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(contentDir) || !file.endsWith('.md')) return;
      const module = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (module) server.moduleGraph.invalidateModule(module);
      server.ws.send({ type: 'full-reload' });
    },
  };
}
