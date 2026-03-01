import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { join } from 'path';
import type { Character } from '@aplus-compendium/types';
import type { CompendiumContentType, CompendiumSearchFilters } from '@aplus-compendium/types';
import {
  listCharacters,
  getCharacter,
  saveCharacter,
  deleteCharacter,
  seedIfEmpty,
} from './character-store.js';
import {
  getCompendiumStatus,
  clearCompendium,
  importCompendium,
  searchCompendium,
  getCompendiumEntry,
  listSources,
  getSubraces,
  getSubclasses,
  getClassFeaturesByLevel,
  debugSpellClasses,
  loadSpellClassesFromSources,
} from './compendium-db.js';

const isDev = process.env['NODE_ENV'] === 'development';
const DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'] ?? 'http://localhost:5173';

type IpcResult<T> = { ok: true; data: T } | { ok: false; error: string };

function ipcHandle<T>(channel: string, handler: (...args: unknown[]) => Promise<T>): void {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      const data = await handler(...args);
      return { ok: true, data } as IpcResult<T>;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return { ok: false, error } as IpcResult<T>;
    }
  });
}

function registerCharacterHandlers(): void {
  ipcHandle('characters:list', () => listCharacters());
  ipcHandle('characters:get', (id) => getCharacter(id as string));
  ipcHandle('characters:save', (character) => saveCharacter(character as Character));
  ipcHandle('characters:delete', (id) => deleteCharacter(id as string));
}

function registerCompendiumHandlers(): void {
  ipcHandle('compendium:status', async () => getCompendiumStatus());

  ipcHandle('compendium:select-dir', async () => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win ?? BrowserWindow.getAllWindows()[0], {
      properties: ['openDirectory'],
      title: 'Select 5etools data directory',
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // Import streams progress events back to the renderer
  ipcMain.handle('compendium:import', async (event, dirPath: string) => {
    type R = IpcResult<null>;
    try {
      await importCompendium(dirPath, (progress) => {
        event.sender.send('compendium:progress', progress);
      });
      return { ok: true, data: null } as R;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      event.sender.send('compendium:progress', { stage: 'error', current: 0, total: 0, done: true, error });
      return { ok: false, error } as R;
    }
  });

  ipcHandle('compendium:search', async (query, contentType, filters, limit, offset) =>
    searchCompendium(
      query as string,
      contentType as CompendiumContentType,
      (filters ?? {}) as CompendiumSearchFilters,
      (limit as number | undefined) ?? 50,
      (offset as number | undefined) ?? 0,
    ),
  );

  ipcHandle('compendium:get', async (id, contentType) =>
    getCompendiumEntry(id as string, contentType as CompendiumContentType),
  );

  ipcHandle('compendium:list-sources', async (contentType) =>
    listSources(contentType as CompendiumContentType),
  );

  ipcHandle('compendium:get-subraces', async (raceName) =>
    getSubraces(raceName as string),
  );

  ipcHandle('compendium:get-subclasses', async (className) =>
    getSubclasses(className as string),
  );

  ipcHandle('compendium:get-class-features', async (className, classLevel, subclassName) =>
    getClassFeaturesByLevel(
      className as string,
      classLevel as number,
      (subclassName as string | undefined) || undefined,
    ),
  );

  ipcHandle('compendium:clear', async () => {
    clearCompendium();
  });

  ipcHandle('compendium:debug-classes', async () => debugSpellClasses());

  // Repair classes_json by reading spells/sources.json from user-selected dir.
  // Use this after an import done without sources.json in the expected location.
  ipcHandle('compendium:repair-classes', async () => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win ?? BrowserWindow.getAllWindows()[0], {
      properties: ['openDirectory'],
      title: 'Select 5etools data directory',
    });
    if (result.canceled || !result.filePaths[0]) return { updated: 0, cancelled: true };
    const updated = await loadSpellClassesFromSources(result.filePaths[0]);
    return { updated, cancelled: false };
  });
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#09090b',
    title: 'A+ Compendium',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(join(__dirname, '../../build/index.html'));
  }
}

app.whenReady().then(async () => {
  await seedIfEmpty();
  registerCharacterHandlers();
  registerCompendiumHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
