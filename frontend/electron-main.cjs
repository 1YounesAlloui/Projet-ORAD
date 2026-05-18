const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// 1. Single Instance Lock to prevent duplicate background instances/backends
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Initialize preload.js dynamically
  const preloadPath = path.join(__dirname, 'preload.js');
  if (!fs.existsSync(preloadPath)) {
    fs.writeFileSync(preloadPath, '// MediBook Secure Desktop Preload\n');
  }

  function createWindow() {
    const isDev = !app.isPackaged;

    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 1024,
      minHeight: 768,
      title: 'MediBook — Cabinet Médical & RDV',
      backgroundColor: '#f8fafc',
      show: false, // Don't show until ready-to-show to prevent visual flash
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: preloadPath,
        devTools: isDev // Disable devtools completely in production mode
      }
    });

    // Remove window menus for premium clinical desktop app standard
    Menu.setApplicationMenu(null);

    if (isDev) {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      mainWindow.loadFile(indexPath);
    }

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  // Secure IPC channels
  ipcMain.handle('get-env', () => {
    return {
      isProduction: app.isPackaged,
      localAppData: process.env.LOCALAPPDATA
    };
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
