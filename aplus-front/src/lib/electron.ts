// Type definitions for Electron API
interface ContentAPI {
  getAll: (type: string) => Promise<Record<string, any>>;
  get: (type: string, name: string, source: string) => Promise<any | null>;
  import: (type: string, items: any[], source: string) => Promise<void>;
  search: (type: string, query: string) => Promise<Record<string, any>>;
  delete: (type: string, name: string, source: string) => Promise<void>;
}

interface CharacterAPI {
  getAll: () => Promise<any[]>;
  get: (characterId: string) => Promise<any | null>;
  save: (characterId: string, data: any) => Promise<void>;
  delete: (characterId: string) => Promise<void>;
  duplicate: (sourceId: string, newId: string) => Promise<any>;
  exists: (characterId: string) => Promise<boolean>;
}

interface ElectronAPI {
  content: ContentAPI;
  character: CharacterAPI;
}

// Extend window interface
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// Export API accessor
export const electron = {
  get content() {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.content;
  },
  
  get character() {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.character;
  },
  
  get isAvailable() {
    return !!window.electronAPI;
  }
};

// Content type constants
export const CONTENT_TYPES = [
  'actions',
  'backgrounds',
  'classes',
  'conditions',
  'decks',
  'deities',
  'feats',
  'items',
  'languages',
  'monsters',
  'objects',
  'optionalfeatures',
  'races',
  'rules',
  'senses',
  'skills',
  'spells',
  'traps'
] as const;

export type ContentType = typeof CONTENT_TYPES[number];
