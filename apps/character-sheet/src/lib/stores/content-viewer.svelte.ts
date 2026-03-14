import type { Spell, InventoryItem, DndClass, Feature, DieType } from '@aplus-compendium/types';
import type { AbilityScore, CasterProgression } from '@aplus-compendium/types';
import { compendiumStore } from './compendium.svelte.js';

export type ClassData = {
  name: string;
  class: DndClass;
  level: number;
  subclass?: string;
  hitDie: DieType;
  savingThrows: [AbilityScore, AbilityScore];
  casterProgression: CasterProgression;
  spellcastingAbility?: AbilityScore;
  asiLevels: number[];
};

export type RaceData = {
  name: string;
  race: string;
  subrace?: string;
  size: string;
  abilityBonuses?: Partial<Record<AbilityScore, number>>;
  raceFeatures: Feature[];
  grantedSpells?: Spell[];
};

export type ViewerContent =
  | { type: 'spell'; data: Spell; context?: { dndClass: DndClass } }
  | { type: 'item'; data: InventoryItem }
  | { type: 'race'; data: RaceData }
  | { type: 'class'; data: ClassData };

export type ViewerMode = 'view' | 'edit';

function createContentViewerStore() {
  let content = $state<ViewerContent | null>(null);
  let mode = $state<ViewerMode>('view');

  return {
    get content() { return content; },
    get mode() { return mode; },

    open(c: ViewerContent): void {
      content = c;
      mode = 'view';
      compendiumStore.closePanel();
    },

    close(): void {
      content = null;
      mode = 'view';
    },

    update(c: ViewerContent): void {
      content = c;
    },

    setMode(m: ViewerMode): void {
      mode = m;
    },

    toggleMode(): void {
      mode = mode === 'view' ? 'edit' : 'view';
    },
  };
}

export const contentViewerStore = createContentViewerStore();
