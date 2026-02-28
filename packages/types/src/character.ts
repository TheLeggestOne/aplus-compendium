import type { AbilityScore, AbilityScoreSet } from './dnd5e/ability-scores.js';
import type { Alignment } from './dnd5e/alignment.js';
import type { ClassLevel, ClassSpellcasting } from './dnd5e/class-stack.js';
import type { CharacterClass } from './dnd5e/classes.js';
import type { CombatStats } from './dnd5e/combat.js';
import type { Currency } from './dnd5e/currency.js';
import type { Armor, EquipmentItem, Weapon } from './dnd5e/equipment.js';
import type { Feature } from './dnd5e/features.js';
import type { SavingThrows, SkillEntry, SkillName } from './dnd5e/skills.js';
import type { CharacterSpellcasting } from './dnd5e/spellcasting.js';

export interface CharacterAppearance {
  age?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  skin?: string;
  hair?: string;
}

export interface CharacterNarrative {
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
  backstory?: string;
  notes?: string;
}

export interface Character {
  id: string;
  name: string;

  // Identity
  classes: CharacterClass[];
  race: string;
  subrace?: string;
  size: string;
  background: string;
  alignment: Alignment;

  // Progression
  experience: number;
  proficiencyBonus: number;
  inspiration: boolean;

  // Stats — abilityScores is the BASE (point buy), effective scores are derived
  abilityScores: AbilityScoreSet;
  raceAbilityBonuses?: Partial<Record<AbilityScore, number>>;
  abilityScoreOverrides?: Partial<Record<AbilityScore, number>>;
  /** Set to true once ability scores have been migrated to the layered system */
  _abilityScoreLayered?: boolean;
  savingThrows: SavingThrows;
  skills: Record<SkillName, SkillEntry>;

  // Combat
  combat: CombatStats;

  // Spellcasting — optional (non-casters omit this)
  spellcasting?: CharacterSpellcasting;

  // Class stack — optional (missing = legacy character without level history)
  levelStack?: ClassLevel[];
  classSpellcasting?: ClassSpellcasting[];

  // Gear
  weapons: Weapon[];
  armor: Armor[];
  equipment: EquipmentItem[];
  currency: Currency;

  // Features & traits
  features: Feature[];

  // Proficiencies & languages
  languages: string[];
  otherProficiencies: string[];

  // Flavor
  appearance?: CharacterAppearance;
  narrative?: CharacterNarrative;
}
