import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  characters: {
    list: () => ipcRenderer.invoke('characters:list'),
    get: (id: string) => ipcRenderer.invoke('characters:get', id),
    save: (character: unknown) => ipcRenderer.invoke('characters:save', character),
    delete: (id: string) => ipcRenderer.invoke('characters:delete', id),
  },
});
