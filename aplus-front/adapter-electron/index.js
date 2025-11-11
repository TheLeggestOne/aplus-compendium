import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * @typedef {Object} AdapterOptions
 * @property {string} [out='build'] - Directory where the built app will be output
 * @property {string} [fallback='index.html'] - Fallback page for SPA routing
 * @property {boolean} [precompress=false] - Enable precompression
 */

/**
 * SvelteKit Adapter for Electron
 * This adapter builds a static SPA that can be loaded by Electron
 * 
 * @param {AdapterOptions} [options]
 * @returns {import('@sveltejs/kit').Adapter}
 */
export default function (options = {}) {
	return {
		name: 'adapter-electron',
		
		/**
		 * @param {import('@sveltejs/kit').Builder} builder
		 */
		async adapt(builder) {
			// Extract options with defaults
			const out = options.out || 'build';
			const fallback = options.fallback || 'index.html';
			const precompress = options.precompress || false;

			// Log what we're doing
			builder.log.minor('Building Electron app...');

			// Step 1: Clear the output directory
			// This ensures we start fresh each build
			builder.rimraf(out);

			// Step 2: Generate environment module
			// This creates the $env modules that SvelteKit uses
			builder.generateEnvModule();

			// Step 3: Write client assets (HTML, CSS, JS, images, etc.)
			// This is all the browser-side code
			builder.writeClient(out);

			// Step 4: Write any prerendered pages
			// If you have pages with `export const prerender = true`
			builder.writePrerendered(out);

			// Step 5: Generate the fallback page for SPA mode
			// This is crucial - it handles client-side routing
			// When Electron loads a route like /about, this fallback ensures it works
			if (fallback) {
				await builder.generateFallback(path.join(out, fallback));
				
				// Fix paths to be relative for Electron's file:// protocol
				const fallbackPath = path.join(out, fallback);
				let html = readFileSync(fallbackPath, 'utf-8');
				
				// Replace absolute paths with relative paths in:
				// - href attributes (stylesheets, modulepreload)
				// - src attributes (scripts, images)
				// - JavaScript import() statements
				html = html.replace(/href="\/_app\//g, 'href="./_app/');
				html = html.replace(/src="\/_app\//g, 'src="./_app/');
				html = html.replace(/import\("\/_app\//g, 'import("./_app/');
				
				// Fix the base path calculation for file:// protocol
				// Replace the dynamic calculation with an empty string
				html = html.replace(
					/base: new URL\('\.', location\)\.pathname\.slice\(0, -1\)/,
					'base: ""'
				);
				
				writeFileSync(fallbackPath, html);
				builder.log.minor('Fixed asset paths for Electron');
			}

			// Step 6: Optional compression
			// Compresses assets with gzip and brotli
			if (precompress) {
				builder.log.minor('Compressing assets...');
				await builder.compress(out);
			}

			builder.log.success(`Built SPA for Electron to "${out}"`);

			// Step 7: Create a manifest file for Electron to know what to load
			const manifest = {
				entrypoint: fallback,
				buildDate: new Date().toISOString(),
				base: builder.config.kit.paths.base || '/'
			};

			writeFileSync(
				path.join(out, 'electron-manifest.json'),
				JSON.stringify(manifest, null, 2)
			);

			builder.log.minor('Generated electron-manifest.json');
		}
	};
}
