import adapter from './adapter-electron/index.js';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		// Using our custom Electron adapter
		adapter: adapter({
			out: 'build',
			fallback: 'index.html',
			precompress: false
		}),
		// Use relative paths for assets - critical for Electron's file:// protocol
		paths: {
			relative: true
		}
		// Normal client-side routing (no hash routing)
		// SvelteKit handles client-side navigation automatically
	}
};

export default config;
