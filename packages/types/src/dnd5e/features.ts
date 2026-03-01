export type FeatureSourceType =
  | 'class'
  | 'subclass'
  | 'race'
  | 'background'
  | 'feat';

export type RestType = 'short' | 'long';

export interface FeatureUses {
  current: number;
  maximum: number;
  resetOn: RestType;
}

import type { DndClass } from './classes.js';

export interface Feature {
  id: string;
  name: string;
  source: string;
  sourceType: FeatureSourceType;
  description: string;
  rawEntries?: unknown[];
  uses?: FeatureUses;

  /** Which class granted this feature (for class/subclass source types) */
  sourceClass?: DndClass;
  /** At which class level this feature was gained (for revert on level pop) */
  sourceClassLevel?: number;
}
