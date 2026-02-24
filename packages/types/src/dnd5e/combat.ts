import type { DieType } from './classes.js';

export interface DeathSaves {
  successes: number; // 0–3
  failures: number;  // 0–3
}

export interface HitDicePool {
  dieType: DieType;
  total: number;
  used: number;
}

export interface CombatStats {
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  armorClass: number;
  initiative: number;
  speed: number;
  hitDicePools: HitDicePool[];
  deathSaves: DeathSaves;
}
