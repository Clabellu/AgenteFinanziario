const { dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const AgentOrchestrator = require('../orchestrator/AgentOrchestrator');

// Mappa per tenere traccia degli orchestratori per sessione
const sessionOrchestrators = new Map();

function setupIpcHandlers(ipcMain) {
  // Analisi finanziaria
  ipcMain.handle('analyze-financial-health', async (event, indicators) => {
    try {
      const sessionId = `session_${Date.now()}`;
      const orchestrator = new AgentOrchestrator();
      sessionOrchestrators.set(sessionId, orchestrator);
      
      const analysis = await orchestrator.analyzeFinancialHealth(indicators);
      return { sessionId, analysis };
    } catch (error) {
      console.error('Errore nell\'analisi finanziaria:', error);
      throw new Error(`Errore nell'analisi: ${error.message}`);
    }
  });

  // Ottimizzazioni
  ipcMain.handle('identify-optimizations', async (event, sessionId) => {
    try {
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator) {
        throw new Error('Sessione non valida o scaduta');
      }
      
      const optimizations = await orchestrator.identifyOptimizations();
      return { optimizations };
    } catch (error) {
      console.error('Errore nell\'identificazione delle ottimizzazioni:', error);
      throw new Error(`Errore nell'identificazione delle ottimizzazioni: ${error.message}`);
    }
  });

  // Selezione ottimizzazioni
  ipcMain.handle('update-selected-optimizations', async (event, sessionId, selectedIds) => {
    try {
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator) {
        throw new Error('Sessione non valida o scaduta');
      }
      
      const selectedOptimizations = orchestrator.updateSelectedOptimizations(selectedIds);
      return { selectedOptimizations };
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle selezioni:', error);
      throw new Error(`Errore nell'aggiornamento delle selezioni: ${error.message}`);
    }
  });

  // Validazione
  ipcMain.handle('validate-selections', async (event, sessionId) => {
    try {
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator) {
        throw new Error('Sessione non valida o scaduta');
      }
      
      const validationResult = await orchestrator.validateSelections();
      return { validationResult };
    } catch (error) {
      console.error('Errore nella validazione:', error);
      throw new Error(`Errore nella validazione: ${error.message}`);
    }
  });

  // Scenari
  ipcMain.handle('generate-scenarios', async (event, sessionId) => {
    try {
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator) {
        throw new Error('Sessione non valida o scaduta');
      }
      
      const scenarios = await orchestrator.generateScenarios();
      return { scenarios };
    } catch (error) {
      console.error('Errore nella generazione degli scenari:', error);
      throw new Error(`Errore nella generazione degli scenari: ${error.message}`);
    }
  });

  // Report
  ipcMain.handle('generate-report', async (event, sessionId) => {
    try {
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator) {
        throw new Error('Sessione non valida o scaduta');
      }
      
      const report = await orchestrator.generateReport();
      return { report };
    } catch (error) {
      console.error('Errore nella generazione del report:', error);
      throw new Error(`Errore nella generazione del report: ${error.message}`);
    }
  });

  // Salvataggio file
  ipcMain.handle('save-document-as', async (event, data, defaultPath) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: defaultPath,
        filters: [
          { name: 'Word Documents', extensions: ['docx'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (!canceled && filePath) {
        fs.writeFileSync(filePath, Buffer.from(data));
        return { success: true, filePath };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Errore nel salvataggio del documento:', error);
      throw new Error(`Errore nel salvataggio: ${error.message}`);
    }
  });

  // Salva sessione
  ipcMain.handle('save-session', async (event, sessionData, suggestedPath) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: suggestedPath || 'analisi_finanziaria.safin',
        filters: [
          { name: 'SuperAgente Finanziario', extensions: ['safin'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (!canceled && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2));
        return { success: true, filePath };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Errore nel salvataggio della sessione:', error);
      throw new Error(`Errore nel salvataggio: ${error.message}`);
    }
  });

  // Carica sessione
  ipcMain.handle('load-session', async (event) => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [
          { name: 'SuperAgente Finanziario', extensions: ['safin'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });
      
      if (!canceled && filePaths.length > 0) {
        const fileContent = fs.readFileSync(filePaths[0], 'utf8');
        const sessionData = JSON.parse(fileContent);
        
        // Ricrea l'orchestratore con lo stato salvato
        const sessionId = `session_${Date.now()}`;
        const orchestrator = new AgentOrchestrator();
        // Ripristina lo stato dell'orchestratore
        Object.assign(orchestrator.state, sessionData.state || {});
        sessionOrchestrators.set(sessionId, orchestrator);
        
        return { success: true, sessionId, sessionData };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Errore nel caricamento della sessione:', error);
      throw new Error(`Errore nel caricamento: ${error.message}`);
    }
  });
}

module.exports = { setupIpcHandlers };