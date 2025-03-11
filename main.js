// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { setupIpcHandlers } = require('./src/main/ipc-handlers');

// Mantieni un riferimento globale all'oggetto window
let mainWindow;

function createWindow() {
  console.log('Creazione della finestra principale...');
  
  // Crea la finestra del browser
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true
    }
  });

  // Carica l'HTML dell'app
  mainWindow.loadFile(path.join(__dirname, 'src/renderer/index.html'));

  // Apri DevTools in sviluppo
  mainWindow.webContents.openDevTools();

  console.log('Finestra principale creata, preload configurato su:', path.join(__dirname, 'preload.js'));

  // Quando la finestra viene chiusa
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Quando Electron ha terminato l'inizializzazione
app.whenReady().then(() => {
  console.log('Electron pronto, inizializzazione dell\'applicazione...');
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

process.on('uncaughtException', (error) => {
  console.error('Errore non gestito:', error);
});