export type DndClass =
  | 'artificer'
  | 'barbarian'
  | 'bard'
  | 'cleric'
  | 'druid'
  | 'fighter'
  | 'monk'
  | 'paladin'
  | 'ranger'
  | 'rogue'
  | 'sorcerer'
  | 'warlock'
  | 'wizard';

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface CharacterClass {
  class: DndClass;
  level: number;
  subclass?: string;
  hitDie: DieType;
}

// ---------------------------------------------------------------------------
// Static class metadata
// ---------------------------------------------------------------------------

import type { AbilityScore } from './ability-scores.js';
import type { CasterProgression } from './class-stack.js';

export const CLASS_HIT_DICE: Record<DndClass, DieType> = {
  artificer: 'd8',
  barbarian: 'd12',
  bard: 'd8',
  cleric: 'd8',
  druid: 'd8',
  fighter: 'd10',
  monk: 'd8',
  paladin: 'd10',
  ranger: 'd10',
  rogue: 'd8',
  sorcerer: 'd6',
  warlock: 'd8',
  wizard: 'd6',
};

/**
 * Default caster progression per class. Fighter and Rogue default to 'none' —
 * their spellcasting (Eldritch Knight / Arcane Trickster) is subclass-dependent
 * and handled separately when the subclass is chosen.
 */
export const CLASS_CASTER_PROGRESSION: Record<DndClass, CasterProgression> = {
  artificer: 'half',
  barbarian: 'none',
  bard: 'full',
  cleric: 'full',
  druid: 'full',
  fighter: 'none',
  monk: 'none',
  paladin: 'half',
  ranger: 'half',
  rogue: 'none',
  sorcerer: 'full',
  warlock: 'pact',
  wizard: 'full',
};

/**
 * Default spellcasting ability per class. Only includes classes that always
 * have spellcasting — Fighter/Rogue are omitted (subclass-dependent).
 */
export const CLASS_SPELLCASTING_ABILITY: Partial<Record<DndClass, AbilityScore>> = {
  artificer: 'intelligence',
  bard: 'charisma',
  cleric: 'wisdom',
  druid: 'wisdom',
  paladin: 'charisma',
  ranger: 'wisdom',
  sorcerer: 'charisma',
  warlock: 'charisma',
  wizard: 'intelligence',
};

/** The class level at which each class chooses a subclass */
export const CLASS_SUBCLASS_LEVEL: Record<DndClass, number> = {
  artificer: 3,
  barbarian: 3,
  bard: 3,
  cleric: 1,
  druid: 2,
  fighter: 3,
  monk: 3,
  paladin: 3,
  ranger: 3,
  rogue: 3,
  sorcerer: 1,
  warlock: 1,
  wizard: 2,
};

/** Saving throw proficiencies granted by each class (only applies to 1st class taken) */
export const CLASS_SAVING_THROWS: Record<DndClass, [AbilityScore, AbilityScore]> = {
  artificer: ['constitution', 'intelligence'],
  barbarian: ['strength', 'constitution'],
  bard: ['dexterity', 'charisma'],
  cleric: ['wisdom', 'charisma'],
  druid: ['intelligence', 'wisdom'],
  fighter: ['strength', 'constitution'],
  monk: ['strength', 'dexterity'],
  paladin: ['wisdom', 'charisma'],
  ranger: ['strength', 'dexterity'],
  rogue: ['dexterity', 'intelligence'],
  sorcerer: ['constitution', 'charisma'],
  warlock: ['wisdom', 'charisma'],
  wizard: ['intelligence', 'wisdom'],
};

/** Class levels at which each class gains an ASI (or feat) */
export const CLASS_ASI_LEVELS: Record<DndClass, number[]> = {
  artificer: [4, 8, 12, 16, 19],
  barbarian: [4, 8, 12, 16, 19],
  bard: [4, 8, 12, 16, 19],
  cleric: [4, 8, 12, 16, 19],
  druid: [4, 8, 12, 16, 19],
  fighter: [4, 6, 8, 12, 14, 16, 19],
  monk: [4, 8, 12, 16, 19],
  paladin: [4, 8, 12, 16, 19],
  ranger: [4, 8, 12, 16, 19],
  rogue: [4, 8, 10, 12, 16, 19],
  sorcerer: [4, 8, 12, 16, 19],
  warlock: [4, 8, 12, 16, 19],
  wizard: [4, 8, 12, 16, 19],
};
