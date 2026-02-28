import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';

export const prerender = false;
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
  const api = window.electronAPI;
  if (!api) error(503, 'Class data requires the Electron shell.');

  const id = params['id'];
  const result = await api.compendium.get(id, 'class');
  if (!result.ok) error(500, `Failed to load class: ${result.error}`);
  if (!result.data) error(404, 'Class not found');

  return { entry: result.data };
};
