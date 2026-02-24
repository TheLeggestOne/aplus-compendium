import type { AbilityScore } from './ability-scores.js';

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SpellSchool =
  | 'abjuration'
  | 'conjuration'
  | 'divination'
  | 'enchantment'
  | 'evocation'
  | 'illusion'
  | 'necromancy'
  | 'transmutation';

export interface SpellComponents {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materialDescription?: string;
}

export interface Spell {
  id: string;
  name: string;
  level: SpellLevel;
  school: SpellSchool;
  castingTime: string;
  range: string;
  components: SpellComponents;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  prepared?: boolean;
}

export interface SpellSlot {
  level: Exclude<SpellLevel, 0>;
  total: number;
  used: number;
}

export interface SpellcastingAbility {
  abilityScore: AbilityScore;
  spellSaveDC: number;
  spellAttackBonus: number;
}

export interface CharacterSpellcasting {
  ability: SpellcastingAbility;
  slots: SpellSlot[];
  cantrips: Spell[];
  spellsKnown: Spell[];
  concentrating?: string;
}
