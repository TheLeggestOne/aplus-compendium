const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fileHandler = require('./fileHandler');
const contentManager = require('./contentManager');
const characterManager = require('./characterManager');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load your frontend (adjust URL as needed)
  // For development, you might load from localhost:5173 (Vite dev server)
  // For production, load the built index.html
  mainWindow.loadURL('http://localhost:5173');
  
  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize file system when app is ready
app.whenReady().then(async () => {
  // Initialize data directories and files
  await fileHandler.initialize();
  
  // Set up IPC handlers
  setupIpcHandlers();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
function setupIpcHandlers() {
  // Content handlers
  ipcMain.handle('content:getAll', async (event, type) => {
    return await contentManager.getAll(type);
  });

  ipcMain.handle('content:get', async (event, type, name, source) => {
    return await contentManager.get(type, name, source);
  });

  ipcMain.handle('content:import', async (event, type, items, source) => {
    await contentManager.import(type, items, source);
  });

  ipcMain.handle('content:search', async (event, type, query) => {
    return await contentManager.search(type, query);
  });

  ipcMain.handle('content:delete', async (event, type, name, source) => {
    await contentManager.delete(type, name, source);
  });

  // Character handlers
  ipcMain.handle('character:getAll', async () => {
    return await characterManager.getAll();
  });

  ipcMain.handle('character:get', async (event, characterId) => {
    return await characterManager.get(characterId);
  });

  ipcMain.handle('character:save', async (event, characterId, data) => {
    await characterManager.save(characterId, data);
  });

  ipcMain.handle('character:delete', async (event, characterId) => {
    await characterManager.delete(characterId);
  });

  ipcMain.handle('character:duplicate', async (event, sourceId, newId) => {
    return await characterManager.duplicate(sourceId, newId);
  });

  ipcMain.handle('character:exists', async (event, characterId) => {
    return await characterManager.exists(characterId);
  });
}
