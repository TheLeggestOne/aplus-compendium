// @ts-nocheck
import type { PageLoad } from './$types.js';
import type { Character } from '@aplus-compendium/types';
import { mockPaladinAerindel } from '$lib/mock-data/paladin-5.js';
import { error } from '@sveltejs/kit';

const MOCK_CHARACTERS: Record<string, Character> = {
  aerindel: mockPaladinAerindel,
};

export const load = ({ params }: Parameters<PageLoad>[0]) => {
  const character = MOCK_CHARACTERS[params['id']];

  if (!character) {
    error(404, `Character "${params['id']}" not found`);
  }

  return { character };
};
