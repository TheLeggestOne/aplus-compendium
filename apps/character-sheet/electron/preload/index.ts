import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  characters: {
    list: () => ipcRenderer.invoke('characters:list'),
    get: (id: string) => ipcRenderer.invoke('characters:get', id),
    save: (character: unknown) => ipcRenderer.invoke('characters:save', character),
    delete: (id: string) => ipcRenderer.invoke('characters:delete', id),
  },

  compendium: {
    status: () =>
      ipcRenderer.invoke('compendium:status'),
    selectDir: () =>
      ipcRenderer.invoke('compendium:select-dir'),
    import: (dirPath: string) =>
      ipcRenderer.invoke('compendium:import', dirPath),
    search: (query: string, contentType: string, filters: unknown, limit?: number) =>
      ipcRenderer.invoke('compendium:search', query, contentType, filters, limit),
    get: (id: string, contentType: string) =>
      ipcRenderer.invoke('compendium:get', id, contentType),
    listSources: (contentType: string) =>
      ipcRenderer.invoke('compendium:list-sources', contentType),
    onProgress: (callback: (progress: unknown) => void) => {
      ipcRenderer.on('compendium:progress', (_event, progress) => callback(progress));
    },
    offProgress: () => {
      ipcRenderer.removeAllListeners('compendium:progress');
    },
    clear: () => ipcRenderer.invoke('compendium:clear'),
    debugClasses: () => ipcRenderer.invoke('compendium:debug-classes'),
    repairClasses: () => ipcRenderer.invoke('compendium:repair-classes'),
  },
});
