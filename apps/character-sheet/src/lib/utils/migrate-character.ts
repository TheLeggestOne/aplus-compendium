import type { Character, ClassLevel, ClassSpellcasting, AbilityScore, AbilityScoreSet } from '@aplus-compendium/types';
import {
  abilityModifier,
  CLASS_HIT_DICE,
  CLASS_CASTER_PROGRESSION,
  CLASS_SPELLCASTING_ABILITY,
  CLASS_SUBCLASS_LEVEL,
  proficiencyBonusForLevel,
} from '@aplus-compendium/types';

/**
 * Converts a legacy character (no levelStack) to the level-stack format.
 * Called on-demand when the user first levels up a legacy character.
 *
 * This is a best-effort reconstruction — HP values are estimated from
 * the average-roll formula since we don't have the original rolls.
 */
export function migrateToLevelStack(char: Character): Character {
  if (char.levelStack && char.levelStack.length > 0) return char;

  const levelStack: ClassLevel[] = [];
  const classSpellcasting: ClassSpellcasting[] = [];

  for (const cls of char.classes) {
    const hitDie = CLASS_HIT_DICE[cls.class];
    const hitDieMax = parseInt(hitDie.slice(1)); // e.g., 'd10' -> 10
    const subclassLevel = CLASS_SUBCLASS_LEVEL[cls.class];

    for (let lvl = 1; lvl <= cls.level; lvl++) {
      // Level 1 = max die, later levels = average (CON mod applied at compute time)
      const hpRoll =
        lvl === 1
          ? hitDieMax
          : Math.floor(hitDieMax / 2) + 1;

      // Match existing features to this class level using the source string
      // Features follow the pattern "Paladin 1", "Oath of Devotion 3", etc.
      const featureIds = char.features
        .filter((f) => {
          if (f.sourceType !== 'class' && f.sourceType !== 'subclass') return false;
          const src = f.source.toLowerCase();
          // Check for "classname N" pattern
          if (src === `${cls.class} ${lvl}`) return true;
          // Check for subclass source at this level
          if (cls.subclass && src === `${cls.subclass.toLowerCase()} ${lvl}`) return true;
          return false;
        })
        .map((f) => f.id);

      levelStack.push({
        class: cls.class,
        hitDie,
        classLevel: lvl,
        hpRoll,
        featureIds,
        subclassChoice:
          lvl === subclassLevel && cls.subclass ? cls.subclass : undefined,
      });
    }

    // Migrate spellcasting
    const spellAbility = CLASS_SPELLCASTING_ABILITY[cls.class];
    if (spellAbility && char.spellcasting) {
      classSpellcasting.push({
        class: cls.class,
        abilityScore: spellAbility,
        casterProgression: CLASS_CASTER_PROGRESSION[cls.class],
        cantrips: [...char.spellcasting.cantrips],
        spellsKnown: [...char.spellcasting.spellsKnown],
      });
    }
  }

  // Tag existing class/subclass features with sourceClass info
  const features = char.features.map((f) => {
    if (f.sourceType !== 'class' && f.sourceType !== 'subclass') return f;
    // Try to match the feature to a class via source string
    for (const cls of char.classes) {
      const src = f.source.toLowerCase();
      if (src.startsWith(cls.class)) {
        const levelMatch = src.match(/(\d+)$/);
        return {
          ...f,
          sourceClass: cls.class,
          sourceClassLevel: levelMatch ? parseInt(levelMatch[1]!) : undefined,
        };
      }
      if (cls.subclass && src.startsWith(cls.subclass.toLowerCase())) {
        const levelMatch = src.match(/(\d+)$/);
        return {
          ...f,
          sourceClass: cls.class,
          sourceClassLevel: levelMatch ? parseInt(levelMatch[1]!) : undefined,
        };
      }
    }
    return f;
  });

  return {
    ...char,
    levelStack,
    classSpellcasting: classSpellcasting.length > 0 ? classSpellcasting : undefined,
    features,
    proficiencyBonus: proficiencyBonusForLevel(levelStack.length),
  };
}

/**
 * Migrates a character from the flat ability score system to the layered system.
 *
 * Previously, racial bonuses and ASI increases were applied directly to
 * `abilityScores`. Now `abilityScores` stores only the BASE scores, and
 * effective scores are derived from base + racial + ASIs + overrides.
 *
 * This migration subtracts known bonuses from the stored scores to recover
 * the true base values.
 */
export function migrateAbilityScoreLayers(char: Character): Character {
  if (char._abilityScoreLayered) return char;

  const scores: AbilityScoreSet = { ...char.abilityScores };

  // Subtract racial bonuses that were baked in
  if (char.raceAbilityBonuses) {
    for (const [ability, bonus] of Object.entries(char.raceAbilityBonuses) as [AbilityScore, number][]) {
      scores[ability] -= bonus;
    }
  }

  // Subtract ASI increases that were baked in from the level stack
  if (char.levelStack) {
    for (const lv of char.levelStack) {
      if (lv.asiChoice?.type === 'asi') {
        for (const [ability, increase] of Object.entries(lv.asiChoice.increases)) {
          const key = ability as AbilityScore;
          scores[key] -= increase ?? 0;
        }
      }
    }
  }

  return {
    ...char,
    abilityScores: scores,
    _abilityScoreLayered: true,
  };
}

/**
 * Migrates level stack entries from `hpGained` (die + CON) to `hpRoll` (die only).
 *
 * Old format stored `hpGained = dieRoll + conMod` as a baked-in value.
 * New format stores only the die result; CON mod is applied at compute time
 * so HP adjusts retroactively when CON changes (5e rule).
 *
 * Detection: if a level entry has `hpGained` but no `hpRoll`, it's legacy.
 */
export function migrateHpRoll(char: Character): Character {
  if (!char.levelStack || char.levelStack.length === 0) return char;

  // Check if migration is needed — look for legacy `hpGained` field
  const first = char.levelStack[0] as unknown as Record<string, unknown>;
  if (first.hpRoll !== undefined) return char; // already migrated

  const conMod = abilityModifier(char.abilityScores.constitution);

  const levelStack = char.levelStack.map((lv) => {
    const legacy = lv as unknown as Record<string, unknown>;
    const hpGained = (legacy.hpGained as number) ?? 0;
    const hpRoll = hpGained - conMod;

    // Build clean entry without the old hpGained field
    const { hpGained: _removed, ...rest } = legacy;
    return { ...rest, hpRoll } as unknown as ClassLevel;
  });

  return { ...char, levelStack };
}
