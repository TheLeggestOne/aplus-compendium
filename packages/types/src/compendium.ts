// Content types supported by the compendium
export type CompendiumContentType =
  | 'spell'
  | 'item'
  | 'feat'
  | 'background'
  | 'race'
  | 'class'
  | 'subclass'
  | 'optional-feature'
  | 'condition';

// How a compendium item maps to a character array when dropped
export type CharacterDropTarget = 'spell' | 'cantrip' | 'weapon' | 'armor' | 'equipment' | 'feature';

// Lightweight result returned from search queries
export interface CompendiumSearchResult {
  id: string;           // "{name}|{source}" e.g. "Fireball|PHB"
  name: string;
  source: string;
  contentType: CompendiumContentType;
  dropTarget: CharacterDropTarget | null;

  // Type-specific display fields (present depending on contentType)
  level?: number;          // spells
  school?: string;         // spells
  castingTime?: string;    // spells
  concentration?: boolean; // spells
  ritual?: boolean;        // spells
  itemType?: string;       // items (5etools type code: W, LA, MA, HA, S, P, ...)
  rarity?: string;         // items
  className?: string;      // subclasses
  featureType?: string;    // optional-features (EI, FS:F, MM, ...)
  prerequisite?: string;   // feats
  subraceOf?: string;      // races: parent race name (e.g. "Dwarf" for "Hill")
}

// Full entry including raw 5etools JSON for the detail view
export interface CompendiumEntry extends CompendiumSearchResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: Record<string, any>;
}

// Progress event streamed during import
export interface ImportProgress {
  stage: string;    // e.g. 'spells', 'items', 'feats'
  current: number;
  total: number;
  done: boolean;
  error?: string;
}

// Returned by compendium:status
export interface CompendiumStatus {
  imported: boolean;
  importedAt?: string; // ISO date string
  counts: Partial<Record<CompendiumContentType, number>>;
}

// Search filters — keys present depend on contentType
export interface CompendiumSearchFilters {
  // Spells
  level?: number[];
  school?: string[];
  classes?: string[];
  ritual?: boolean;
  concentration?: boolean;

  // Items
  itemType?: string[];
  rarity?: string[];
  requiresAttunement?: boolean;

  // Optional features
  featureType?: string[];

  // Universal
  source?: string[];
}
