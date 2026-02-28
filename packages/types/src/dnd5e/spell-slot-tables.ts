import type { CasterProgression } from './class-stack.js';
import type { SpellLevel, SpellSlot } from './spellcasting.js';

// ---------------------------------------------------------------------------
// Multiclass spell slot table (PHB p.165)
// ---------------------------------------------------------------------------

/** Spell slots by combined caster level. Each array is [1st, 2nd, ..., 9th]. */
const MULTICLASS_SLOT_TABLE: Record<number, number[]> = {
  1:  [2],
  2:  [3],
  3:  [4, 2],
  4:  [4, 3],
  5:  [4, 3, 2],
  6:  [4, 3, 3],
  7:  [4, 3, 3, 1],
  8:  [4, 3, 3, 2],
  9:  [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

// ---------------------------------------------------------------------------
// Warlock pact magic table
// ---------------------------------------------------------------------------

/** Pact magic slots + spell level by warlock level */
const PACT_SLOT_TABLE: Record<number, { slots: number; level: number }> = {
  1:  { slots: 1, level: 1 },
  2:  { slots: 2, level: 1 },
  3:  { slots: 2, level: 2 },
  4:  { slots: 2, level: 2 },
  5:  { slots: 2, level: 3 },
  6:  { slots: 2, level: 3 },
  7:  { slots: 2, level: 4 },
  8:  { slots: 2, level: 4 },
  9:  { slots: 2, level: 5 },
  10: { slots: 2, level: 5 },
  11: { slots: 3, level: 5 },
  12: { slots: 3, level: 5 },
  13: { slots: 3, level: 5 },
  14: { slots: 3, level: 5 },
  15: { slots: 3, level: 5 },
  16: { slots: 3, level: 5 },
  17: { slots: 4, level: 5 },
  18: { slots: 4, level: 5 },
  19: { slots: 4, level: 5 },
  20: { slots: 4, level: 5 },
};

// ---------------------------------------------------------------------------
// Calculation functions
// ---------------------------------------------------------------------------

/**
 * Calculate the combined caster level from individual class levels + progressions.
 * Pact magic and non-casters do not contribute to the combined caster level.
 */
export function combinedCasterLevel(
  classLevels: Array<{ level: number; progression: CasterProgression }>,
): number {
  let total = 0;
  for (const { level, progression } of classLevels) {
    switch (progression) {
      case 'full':
        total += level;
        break;
      case 'half':
        total += Math.floor(level / 2);
        break;
      case 'third':
        total += Math.floor(level / 3);
        break;
      // 'pact' and 'none' don't contribute
    }
  }
  return total;
}

/**
 * Get spell slots for a given combined caster level (non-warlock slots).
 * Returns SpellSlot[] with used=0.
 */
export function multiclassSpellSlots(casterLevel: number): SpellSlot[] {
  const row = MULTICLASS_SLOT_TABLE[Math.min(20, Math.max(0, casterLevel))];
  if (!row) return [];
  return row.map((total, i) => ({
    level: (i + 1) as Exclude<SpellLevel, 0>,
    total,
    used: 0,
  }));
}

/**
 * Get warlock pact magic slots for a given warlock level.
 * Returns SpellSlot[] with used=0.
 */
export function pactMagicSlots(warlockLevel: number): SpellSlot[] {
  const entry = PACT_SLOT_TABLE[Math.min(20, Math.max(0, warlockLevel))];
  if (!entry) return [];
  return [
    {
      level: entry.level as Exclude<SpellLevel, 0>,
      total: entry.slots,
      used: 0,
    },
  ];
}

/** Proficiency bonus by total character level (PHB p.15) */
export function proficiencyBonusForLevel(totalLevel: number): number {
  if (totalLevel <= 0) return 2;
  return Math.floor((totalLevel - 1) / 4) + 2;
}
