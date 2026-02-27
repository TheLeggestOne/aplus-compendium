import type { Character } from '@aplus-compendium/types';

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
    };
  }
}

export {};
