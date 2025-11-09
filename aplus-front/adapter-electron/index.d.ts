import { Adapter } from '@sveltejs/kit';

export interface AdapterOptions {
	/**
	 * Directory where the built app will be output
	 * @default 'build'
	 */
	out?: string;
	
	/**
	 * Fallback page for SPA routing
	 * @default 'index.html'
	 */
	fallback?: string;
	
	/**
	 * Enable precompression of assets
	 * @default false
	 */
	precompress?: boolean;
}

export default function plugin(options?: AdapterOptions): Adapter;
