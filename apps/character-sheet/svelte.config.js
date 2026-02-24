import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
    }),
    alias: {
      $components: 'src/lib/components',
    },
    prerender: {
      handleHttpError: ({ path, referenceType }) => {
        if (referenceType === 'linked') return;
        throw new Error(`${path} not found`);
      },
      handleUnseenRoutes: 'ignore',
    },
  },
};

export default config;
