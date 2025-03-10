const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { setupIpcHandlers } = require('./src/main/ipc-handlers');

// Mantieni un riferimento globale all'oggetto window
let mainWindow;

function createWindow() {
  // Crea la finestra del browser
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Carica l'HTML dell'app
  mainWindow.loadFile(path.join(__dirname, 'src/renderer/index.html'));

  // Apri DevTools in sviluppo
  mainWindow.webContents.openDevTools();

  // Quando la finestra viene chiusa
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Quando Electron ha terminato l'inizializzazione
app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers(ipcMain);

  app.on('activate', function () {
    // Su macOS ricreare la finestra quando si clicca sull'icona dock
    if (mainWindow === null) createWindow();
  });
});

// Chiudi l'applicazione quando tutte le finestre sono chiuse
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});