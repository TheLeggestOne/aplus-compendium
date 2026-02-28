import type { Character, SkillName, SkillEntry } from '@aplus-compendium/types';
import { SKILL_NAMES } from '@aplus-compendium/types';

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || 'character'}-${suffix}`;
}

const DEFAULT_SKILL: SkillEntry = { proficiency: 'none', modifier: 0 };

export function createDefaultCharacter(name: string): Character {
  const skills = Object.fromEntries(
    SKILL_NAMES.map((s) => [s, { ...DEFAULT_SKILL }]),
  ) as Record<SkillName, SkillEntry>;

  return {
    id: slugify(name),
    name,

    classes: [],
    race: '',
    size: 'Medium',
    background: '',
    alignment: 'true-neutral',

    experience: 0,
    proficiencyBonus: 2,
    inspiration: false,

    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },

    savingThrows: {
      strength:     { proficient: false, modifier: 0 },
      dexterity:    { proficient: false, modifier: 0 },
      constitution: { proficient: false, modifier: 0 },
      intelligence: { proficient: false, modifier: 0 },
      wisdom:       { proficient: false, modifier: 0 },
      charisma:     { proficient: false, modifier: 0 },
    },

    skills,

    combat: {
      maxHitPoints: 1,
      currentHitPoints: 1,
      temporaryHitPoints: 0,
      armorClass: 10,
      initiative: 0,
      speed: 30,
      hitDicePools: [],
      deathSaves: { successes: 0, failures: 0 },
    },

    levelStack: [],

    weapons: [],
    armor: [],
    equipment: [],
    currency: { platinum: 0, gold: 0, electrum: 0, silver: 0, copper: 0 },

    features: [],

    languages: ['Common'],
    otherProficiencies: [],
  };
}
