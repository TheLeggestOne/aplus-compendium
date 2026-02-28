import type { PageLoad } from './$types.js';
import { error } from '@sveltejs/kit';

export const prerender = false;

export const load: PageLoad = async () => {
  const api = window.electronAPI;
  if (!api) error(503, 'Character data requires the Electron shell.');

  const result = await api.characters.list();
  if (!result.ok) error(500, `Failed to load characters: ${result.error}`);

  return { characters: result.data };
};
