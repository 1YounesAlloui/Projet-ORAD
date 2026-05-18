const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const isDev = !app.isPackaged;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'MediBook — Cabinet Médical & RDV',
    backgroundColor: '#f8fafc',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js') // We can create a basic empty preload.js if needed
    },
    show: false // Don't show the window until it's ready-to-show
  });

  // Remove default window menu bar for crisp native app experience
  Menu.setApplicationMenu(null);

  if (isDev) {
    // Load Vite local dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open Developer Tools automatically in development
    mainWindow.webContents.openDevTools();
  } else {
    // Load compiled production React index file (works in packaged mode)
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Fade-in effect: only show once rendering is completed
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create an empty preload.js to prevent webPreferences resolve errors
const fs = require('fs');
const preloadPath = path.join(__dirname, 'preload.js');
if (!fs.existsSync(preloadPath)) {
  fs.writeFileSync(preloadPath, '// MediBook Desktop Preload Script\n');
}

// Lifecycle events
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
