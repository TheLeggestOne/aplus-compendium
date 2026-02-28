import type {
  Character,
  CompendiumContentType,
  CompendiumEntry,
  CompendiumSearchFilters,
  CompendiumSearchResult,
  CompendiumStatus,
  ImportProgress,
} from '@aplus-compendium/types';

type IpcResult<T> = { ok: true; data: T } | { ok: false; error: string };

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  interface Window {
    electronAPI?: {
      platform: string;

      characters: {
        list: () => Promise<IpcResult<Character[]>>;
        get: (id: string) => Promise<IpcResult<Character | null>>;
        save: (character: Character) => Promise<IpcResult<void>>;
        delete: (id: string) => Promise<IpcResult<void>>;
      };

      compendium: {
        status: () => Promise<IpcResult<CompendiumStatus>>;
        selectDir: () => Promise<IpcResult<string | null>>;
        import: (dirPath: string) => Promise<IpcResult<null>>;
        search: (
          query: string,
          contentType: CompendiumContentType,
          filters: CompendiumSearchFilters,
          limit?: number,
          offset?: number,
        ) => Promise<IpcResult<CompendiumSearchResult[]>>;
        get: (id: string, contentType: CompendiumContentType) => Promise<IpcResult<CompendiumEntry | null>>;
        listSources: (contentType: CompendiumContentType) => Promise<IpcResult<string[]>>;
        getSubraces: (raceName: string) => Promise<IpcResult<CompendiumSearchResult[]>>;
        getSubclasses: (className: string) => Promise<IpcResult<CompendiumSearchResult[]>>;
        onProgress: (callback: (progress: ImportProgress) => void) => void;
        offProgress: () => void;
        clear: () => Promise<IpcResult<void>>;
        debugClasses: () => Promise<IpcResult<{ total: number; withClasses: number; sample: { name: string; classes_json: string }[] }>>;
        repairClasses: () => Promise<IpcResult<{ updated: number; cancelled: boolean }>>;
      };
    };
  }
}

export {};
