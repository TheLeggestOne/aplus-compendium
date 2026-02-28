import type { Character, ClassLevel, ClassSpellcasting } from '@aplus-compendium/types';
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
  const conMod = abilityModifier(char.abilityScores.constitution);

  for (const cls of char.classes) {
    const hitDie = CLASS_HIT_DICE[cls.class];
    const hitDieMax = parseInt(hitDie.slice(1)); // e.g., 'd10' -> 10
    const subclassLevel = CLASS_SUBCLASS_LEVEL[cls.class];

    for (let lvl = 1; lvl <= cls.level; lvl++) {
      // Level 1 = max die + CON mod, later levels = average + CON mod
      const hpGained =
        lvl === 1
          ? hitDieMax + conMod
          : Math.floor(hitDieMax / 2) + 1 + conMod;

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
        hpGained,
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
