import type { AbilityScore } from './ability-scores.js';
import type { DndClass, DieType } from './classes.js';
import type { Spell } from './spellcasting.js';

/** Caster progression category per 5e rules */
export type CasterProgression = 'full' | 'half' | 'third' | 'pact' | 'none';

/**
 * ASI/Feat choice made at an ASI level (4, 8, 12, 16, 19 for most classes).
 * Exactly one variant is used.
 */
export type AsiChoice =
  | { type: 'asi'; increases: Partial<Record<AbilityScore, 1 | 2>> }
  | { type: 'feat'; featId: string; featName: string };

/**
 * A single level in the character's progression history.
 * The stack is ordered: index 0 = first level ever taken, index N = most recent.
 */
export interface ClassLevel {
  /** Which class this level is in */
  class: DndClass;

  /** The hit die for this class */
  hitDie: DieType;

  /**
   * The class level number within THIS class (1-indexed).
   * E.g., if this is the character's 6th overall level but their 3rd paladin level,
   * classLevel = 3.
   */
  classLevel: number;

  /** Subclass chosen at this level (typically classLevel 3, 1 for some classes).
   *  Only present on the level where the subclass was chosen. */
  subclassChoice?: string;

  /** ASI or feat choice, if this class level grants one (typically 4, 8, 12, 16, 19) */
  asiChoice?: AsiChoice;

  /** Raw die result (no CON mod). Level 1 = hit die max. Later = rolled or average value.
   *  Effective HP per level = max(1, hpRoll + CON mod), computed at display/total time. */
  hpRoll: number;

  /** Feature IDs gained at this level (references character.features[].id) */
  featureIds: string[];

  /** Cantrip IDs gained at this level (for known-spell casters, enables revert) */
  cantripsGained?: string[];

  /** Spell IDs gained at this level (for known-spell casters like Bard/Sorcerer/Warlock).
   *  Prepared casters (Cleric/Druid/Paladin) don't use this — their prep list is derived. */
  spellsGained?: string[];

  /** Spell swapped at this level (some classes can swap one known spell on level-up).
   *  Full Spell objects are stored so the swap is fully reversible on level pop. */
  spellSwapped?: { removed: Spell; added: Spell };
}

/**
 * Per-class spellcasting state. Each caster class the character has gets one of these.
 * Spell slots are NOT stored here — they are derived from the combined caster level.
 * Warlock pact magic is the exception (its own slots).
 */
export interface ClassSpellcasting {
  /** Which class this spellcasting belongs to */
  class: DndClass;

  /** The ability score used for this class's spellcasting */
  abilityScore: AbilityScore;

  /** Caster progression type */
  casterProgression: CasterProgression;

  /** Cantrips known for this class */
  cantrips: Spell[];

  /** Spells known/prepared for this class */
  spellsKnown: Spell[];

  /** Whether currently concentrating on a spell from this class */
  concentrating?: string;
}
