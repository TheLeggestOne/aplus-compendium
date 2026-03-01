import type { AbilityScore } from './ability-scores.js';
import type { ArmorCategory, DamageType, ItemRarity, WeaponCategory, WeaponProperty, WeaponRange } from './equipment.js';
import type { DieType } from './classes.js';

export type EquipSlot = 'armor' | 'mainhand' | 'offhand' | 'misc';

export interface InventoryContainer {
  id: string;
  name: string;
  /** Maximum weight in lbs. undefined = no limit. */
  capacityLbs?: number;
  /** True for the default "Character Inventory" — cannot be renamed or deleted. */
  isDefault?: boolean;
  /** True for the special "Worn / Equipped" container. */
  isWornEquipped?: boolean;
}

interface InventoryItemBase {
  id: string;
  name: string;
  quantity: number;
  /** Weight per unit, in lbs. */
  weight: number;
  rarity?: ItemRarity;
  description?: string;
  /** Which container this item lives in. */
  containerId: string;
  /** Set only when containerId === 'worn'. */
  equipSlot?: EquipSlot;
  requiresAttunement?: boolean;
  attuned?: boolean;
}

export type InventoryWeapon = InventoryItemBase & {
  type: 'weapon';
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
};

export type InventoryArmor = InventoryItemBase & {
  type: 'armor';
  category: ArmorCategory;
  baseArmorClass: number;
  maxDexBonus?: number;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
};

export type InventoryEquipment = InventoryItemBase & {
  type: 'equipment';
};

export type InventoryItem = InventoryWeapon | InventoryArmor | InventoryEquipment;
