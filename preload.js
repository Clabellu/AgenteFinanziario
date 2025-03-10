const { contextBridge, ipcRenderer } = require('electron');

// Espone API sicure dal processo principale al renderer
contextBridge.exposeInMainWorld('superAgenteAPI', {
  // Analisi finanziaria
  analyzeFinancialHealth: (indicators) => 
    ipcRenderer.invoke('analyze-financial-health', indicators),
  
  // Ottimizzazioni
  identifyOptimizations: (sessionId) =>
    ipcRenderer.invoke('identify-optimizations', sessionId),
  
  // Selezione ottimizzazioni
  updateSelectedOptimizations: (sessionId, selectedIds) =>
    ipcRenderer.invoke('update-selected-optimizations', sessionId, selectedIds),
  
  // Validazione
  validateSelections: (sessionId) =>
    ipcRenderer.invoke('validate-selections', sessionId),
  
  // Scenari
  generateScenarios: (sessionId) =>
    ipcRenderer.invoke('generate-scenarios', sessionId),
  
  // Report
  generateReport: (sessionId) =>
    ipcRenderer.invoke('generate-report', sessionId),
  
  // Esportazione file
  saveDocumentAs: (data, defaultPath) =>
    ipcRenderer.invoke('save-document-as', data, defaultPath),
    
  // Salvataggio/Caricamento stato
  saveSession: (sessionData, filePath) =>
    ipcRenderer.invoke('save-session', sessionData, filePath),
  loadSession: () =>
    ipcRenderer.invoke('load-session')
});