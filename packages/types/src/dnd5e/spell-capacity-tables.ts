import type { DndClass } from './classes.js';

// ---------------------------------------------------------------------------
// Cantrips known per class level (PHB class tables)
// Index = classLevel - 1. Omitted classes have 0 cantrips.
// ---------------------------------------------------------------------------

const CANTRIPS_KNOWN: Partial<Record<DndClass, number[]>> = {
  bard:      [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  cleric:    [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
  druid:     [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  sorcerer:  [4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6],
  warlock:   [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  wizard:    [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
  artificer: [2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3],
};

// ---------------------------------------------------------------------------
// Spells known per class level (PHB class tables)
// Index = classLevel - 1. Omitted classes (prepared casters) use a formula.
// ---------------------------------------------------------------------------

const SPELLS_KNOWN: Partial<Record<DndClass, number[]>> = {
  bard:      [4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22],
  sorcerer:  [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15],
  warlock:   [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],
  ranger:    [0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11],
  artificer: [0,0,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11],
};

/** Classes whose spell capacity uses abilityMod + level formula instead of a table. */
const PREPARED_CASTERS: Set<DndClass> = new Set([
  'cleric', 'druid', 'paladin', 'wizard',
]);

// ---------------------------------------------------------------------------
// Lookup functions
// ---------------------------------------------------------------------------

/** Number of cantrips a class knows at a given class level. */
export function cantripCapacity(cls: DndClass, classLevel: number): number {
  const table = CANTRIPS_KNOWN[cls];
  if (!table) return 0;
  const idx = Math.min(Math.max(0, classLevel - 1), table.length - 1);
  return table[idx] ?? 0;
}

/**
 * Number of spells a class can know/prepare at a given class level.
 *
 * For known-spell casters (Bard, Sorcerer, Warlock, Ranger, Artificer) this
 * is a static PHB table lookup.
 *
 * For prepared casters (Cleric, Druid, Wizard) the capacity is
 * `max(1, abilityMod + classLevel)`.
 * For Paladin it is `max(1, abilityMod + floor(classLevel / 2))`.
 *
 * Pass `abilityMod` for prepared casters; it is ignored for known-spell casters.
 */
export function spellCapacity(
  cls: DndClass,
  classLevel: number,
  abilityMod: number = 0,
): number {
  const table = SPELLS_KNOWN[cls];
  if (table) {
    const idx = Math.min(Math.max(0, classLevel - 1), table.length - 1);
    return table[idx] ?? 0;
  }
  if (!PREPARED_CASTERS.has(cls)) return 0;
  const level = cls === 'paladin'
    ? Math.floor(classLevel / 2)
    : classLevel;
  return Math.max(1, abilityMod + level);
}
