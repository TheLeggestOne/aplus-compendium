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
import type { Spell } from './spellcasting.js';

export interface FeatureChoice {
  id: string;
  label: string;
  /** Valid options to pick from. Empty array means free-text entry. */
  options: string[];
  selected: string;
  /** When set, changing `selected` also adds/removes from the character's language or proficiency list. */
  grantType?: 'language' | 'proficiency';
}

export interface Feature {
  id: string;
  name: string;
  source: string;
  sourceType: FeatureSourceType;
  description: string;
  rawEntries?: unknown[];
  uses?: FeatureUses;
  choices?: FeatureChoice[];

  /** Which class granted this feature (for class/subclass source types) */
  sourceClass?: DndClass;
  /** At which class level this feature was gained (for revert on level pop) */
  sourceClassLevel?: number;

  /** Languages granted by this feature (e.g. Druidic, Thieves' Cant) */
  grantedLanguages?: string[];
  /** Tool / weapon / armor proficiencies granted by this feature */
  grantedProficiencies?: string[];
  /** Spells granted by this feature (e.g. Circle Spells, Oath Spells), pre-resolved from compendium */
  grantedSpells?: Spell[];
  /** Pre-resolved option names for features whose choices aren't embedded in rawEntries (e.g. subclass archetypes). */
  knownChoiceOptions?: string[];
}
