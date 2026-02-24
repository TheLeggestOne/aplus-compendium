import type { AbilityScore } from './ability-scores.js';
import type { DieType } from './classes.js';

export type ItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'very-rare'
  | 'legendary'
  | 'artifact';

export type DamageType =
  | 'acid'
  | 'bludgeoning'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'piercing'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'slashing'
  | 'thunder';

export type WeaponCategory =
  | 'simple-melee'
  | 'simple-ranged'
  | 'martial-melee'
  | 'martial-ranged';

export type ArmorCategory = 'light' | 'medium' | 'heavy' | 'shield';

export type WeaponProperty =
  | 'finesse'
  | 'light'
  | 'thrown'
  | 'two-handed'
  | 'versatile'
  | 'reach'
  | 'ranged'
  | 'loading'
  | 'heavy'
  | 'special'
  | 'ammunition';

export interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  rarity?: ItemRarity;
  description?: string;
  equipped?: boolean;
  attuned?: boolean;
  requiresAttunement?: boolean;
}

export interface WeaponRange {
  normal: number;
  long: number;
}

export interface Weapon extends EquipmentItem {
  category: WeaponCategory;
  damageDice: string;
  damageType: DamageType;
  properties: WeaponProperty[];
  attackBonus: number;
  damageBonus: number;
  abilityUsed: AbilityScore;
  versatileDamageDice?: string;
  range?: WeaponRange;
  dieType: DieType;
}

export interface Armor extends EquipmentItem {
  category: ArmorCategory;
  baseArmorClass: number;
  maxDexBonus?: number;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
}
