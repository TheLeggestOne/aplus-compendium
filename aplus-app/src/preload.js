const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Content API
  content: {
    getAll: (type) => ipcRenderer.invoke('content:getAll', type),
    // Support both compound key (name::source) and separate params
    get: (type, nameOrKey, source) => ipcRenderer.invoke('content:get', type, nameOrKey, source),
    import: (type, items, source) => ipcRenderer.invoke('content:import', type, items, source),
    search: (type, query) => ipcRenderer.invoke('content:search', type, query),
    delete: (type, name, source) => ipcRenderer.invoke('content:delete', type, name, source),
    loadFile: (filePath, contentType, source) => ipcRenderer.invoke('content:loadFile', filePath, contentType, source),
    loadDirectory: (dirPath, source) => ipcRenderer.invoke('content:loadDirectory', dirPath, source),
  },
  
  // Character API
  character: {
    getAll: () => ipcRenderer.invoke('character:getAll'),
    get: (characterId) => ipcRenderer.invoke('character:get', characterId),
    save: (characterId, data) => ipcRenderer.invoke('character:save', characterId, data),
    delete: (characterId) => ipcRenderer.invoke('character:delete', characterId),
    duplicate: (sourceId, newId) => ipcRenderer.invoke('character:duplicate', sourceId, newId),
    exists: (characterId) => ipcRenderer.invoke('character:exists', characterId),
  },
  
  // Window API
  window: {
    openNew: (url) => ipcRenderer.invoke('window:openNew', url),
  }
});
