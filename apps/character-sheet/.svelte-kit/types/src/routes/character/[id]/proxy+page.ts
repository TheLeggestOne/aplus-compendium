// @ts-nocheck
import type { PageLoad } from './$types.js';
import { error } from '@sveltejs/kit';

export const prerender = false;

export const load = async ({ params }: Parameters<PageLoad>[0]) => {
  const api = window.electronAPI;

  if (!api) {
    error(503, 'Character data requires the Electron shell.');
  }

  const result = await api.characters.get(params['id']);

  if (!result.ok) {
    error(500, `Failed to load character: ${result.error}`);
  }

  if (result.data === null) {
    error(404, `Character "${params['id']}" not found`);
  }

  return { character: result.data };
};
