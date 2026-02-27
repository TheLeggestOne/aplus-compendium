import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { join } from 'path';
import type { Character } from '@aplus-compendium/types';
import {
  listCharacters,
  getCharacter,
  saveCharacter,
  deleteCharacter,
  seedIfEmpty,
} from './character-store.js';

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
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
