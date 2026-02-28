import type { AbilityScore } from './ability-scores.js';

export type SkillName =
  | 'acrobatics'
  | 'animal-handling'
  | 'arcana'
  | 'athletics'
  | 'deception'
  | 'history'
  | 'insight'
  | 'intimidation'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'religion'
  | 'sleight-of-hand'
  | 'stealth'
  | 'survival';

export type ProficiencyLevel = 'none' | 'proficient' | 'expertise';

export interface SkillEntry {
  proficiency: ProficiencyLevel;
  modifier: number;
}

export interface SavingThrowEntry {
  proficient: boolean;
  modifier: number;
}

export interface SavingThrows {
  strength: SavingThrowEntry;
  dexterity: SavingThrowEntry;
  constitution: SavingThrowEntry;
  intelligence: SavingThrowEntry;
  wisdom: SavingThrowEntry;
  charisma: SavingThrowEntry;
}

export const SKILL_ABILITY_MAP: Record<SkillName, AbilityScore> = {
  acrobatics: 'dexterity',
  'animal-handling': 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  'sleight-of-hand': 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
} as const;

export const SKILL_NAMES: SkillName[] = Object.keys(SKILL_ABILITY_MAP) as SkillName[];
