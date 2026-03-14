import type { AbilityScore } from './ability-scores.js';
import type { ArmorCategory, DamageType, ItemRarity, WeaponCategory, WeaponProperty, WeaponRange } from './equipment.js';
import type { DieType } from './classes.js';

export type EquipSlot = 'armor' | 'mainhand' | 'offhand' | 'misc';

export type ItemTier = 'minor' | 'major';

export interface InventoryContainer {
  id: string;
  name: string;
  /** Maximum weight in lbs. undefined = no limit. */
  capacityLbs?: number;
  /** True for the default "Character Inventory" — cannot be renamed or deleted. */
  isDefault?: boolean;
  /** True for the special "Worn / Equipped" container. */
  isWornEquipped?: boolean;
  /** If false, items in this container don't count toward carry weight (e.g. bag of holding). Defaults to true. */
  countsTowardCarry?: boolean;
}

interface InventoryItemBase {
  id: string;
  name: string;
  quantity: number;
  /** Weight per unit, in lbs. */
  weight: number;
  /** Cost in gold pieces (from compendium or manually entered). */
  costGp?: number;
  rarity?: ItemRarity;
  description?: string;
  /** Which container this item lives in. */
  containerId: string;
  /** Set only when containerId === 'worn'. */
  equipSlot?: EquipSlot;
  requiresAttunement?: boolean;
  attuned?: boolean;
  /** True if this is a wondrous item (5etools `wondrous` flag). */
  wondrous?: boolean;
  /** 5etools item tier (minor or major). */
  tier?: ItemTier;
  /** 5etools item type label (e.g. "Potion", "Wondrous Item", "Martial Weapon"). Cosmetic only. */
  itemType?: string;
  /** Raw 5etools entries for rich-text rendering. Cleared if description is manually edited. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawEntries?: unknown[];
  /** Source book abbreviation (e.g. "PHB", "DMG"). Set when imported from compendium. */
  source?: string;
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
