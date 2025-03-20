// src/main/ipc-handlers.js
const { dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const AgentOrchestrator = require('../orchestrator/AgentOrchestrator');

// Mappa per tenere traccia degli orchestratori per sessione
const sessionOrchestrators = new Map();


function setupIpcHandlers(ipcMain) {
  console.log('Configurazione degli handler IPC...');
  
  // Analisi finanziaria
  ipcMain.handle('analyze-financial-health', async (event, indicators) => {
    try {
      console.log('Handler analyze-financial-health chiamato con indicatori:', Object.keys(indicators).length);
      const sessionId = `session_${Date.now()}`;
      console.log('Creazione nuova sessione con ID:', sessionId);
      
      const orchestrator = new AgentOrchestrator();
      sessionOrchestrators.set(sessionId, orchestrator);
      console.log('Orchestratori attivi:', sessionOrchestrators.size);
      
      try {
        // Imposta un timeout esplicito per la chiamata analyzeFinancialHealth
        const analysisPromise = orchestrator.analyzeFinancialHealth(indicators);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout nella chiamata di analisi')), 40000)
        );
        
        const analysis = await Promise.race([analysisPromise, timeoutPromise]);
        
        console.log('Analisi completata:', analysis ? 'OK' : 'NULL');
        console.log('Analisi ha un campo "analysis"?', analysis && analysis.analysis ? 'SI' : 'No');
        
        if (analysis && analysis.analysis) {
          console.log('Lunghezza analisi:', analysis.analysis.length);
          
          // Limita la lunghezza dell'analisi se necessario
          if (analysis.analysis.length > 50000) {
            console.log('Analisi troppo lunga, troncamento a 50000 caratteri');
            analysis.analysis = analysis.analysis.substring(0, 50000) + 
                                "\n\n[Contenuto troncato per motivi di dimensione]";
          }
        }
        
        return { sessionId, analysis };
      } catch (innerError) {
        console.error('Errore nella generazione dell\'analisi:', innerError);
        
        // Comunque restituisci un risultato valido con un messaggio di errore
        return { 
          sessionId, 
          analysis: {
            rawIndicators: indicators,
            enhancedIndicators: indicators,
            analysis: `Si è verificato un errore nell'analisi: ${innerError.message}. 
                      I dati sono stati comunque elaborati e puoi proseguire con le fasi successive.`
          }
        };
      }
    } catch (error) {
      console.error('Errore generale nell\'analisi finanziaria:', error);
      
      // In caso di errore generale, crea comunque una sessione e un risultato
      const sessionId = `session_err_${Date.now()}`;
      const orchestrator = new AgentOrchestrator();
      sessionOrchestrators.set(sessionId, orchestrator);
      
      return { 
        sessionId, 
        analysis: {
          rawIndicators: indicators,
          enhancedIndicators: indicators,
          analysis: `Errore durante l'elaborazione dell'analisi: ${error.message}.
                    I dati sono stati salvati e puoi proseguire con le fasi successive.`
        }
      };
    }
  });

  ipcMain.handle('get-analysis-part', async (event, { sessionId, partIndex }) => {
    try {
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator || !orchestrator.analysisParts) {
        throw new Error('Parti dell\'analisi non disponibili');
      }
      
      return { 
        part: orchestrator.analysisParts[partIndex] || '',
        totalParts: orchestrator.analysisParts.length
      };
    } catch (error) {
      console.error('Errore nel recupero parte analisi:', error);
      throw error;
    }
  });

  // Ottimizzazioni
  ipcMain.handle('identify-optimizations', async (event, sessionId) => {
    try {
      console.log('Richiesta ottimizzazioni per sessionId:', sessionId);
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator) {
        console.error('Nessun orchestratore trovato per sessionId:', sessionId);
        throw new Error('Sessione non valida o scaduta');
      }
      
      console.log('Chiamata identifyOptimizations su orchestratore...');
      const optimizations = await orchestrator.identifyOptimizations();
      console.log('Ottimizzazioni generate:', optimizations.length);
      return { optimizations };
    } catch (error) {
      console.error('Errore nell\'identificazione delle ottimizzazioni:', error);
      throw new Error(`Errore nell'identificazione delle ottimizzazioni: ${error.message}`);
    }
  });

  // Selezione ottimizzazioni
  ipcMain.handle('update-selected-optimizations', async (event, sessionId, selectedIds) => {
    try {
      console.log('Richiesta update-selected-optimizations per sessionId:', sessionId);
      console.log('Selected IDs:', selectedIds);
      
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator) {
        throw new Error('Sessione non valida o scaduta');
      }
      
      const selectedOptimizations = orchestrator.updateSelectedOptimizations(selectedIds);
      console.log('Ottimizzazioni selezionate aggiornate:', selectedOptimizations.length);
      return { selectedOptimizations };
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle selezioni:', error);
      throw new Error(`Errore nell'aggiornamento delle selezioni: ${error.message}`);
    }
  });

  // Validazione
  ipcMain.handle('validate-selections', async (event, sessionId) => {
    try {
      console.log('Richiesta validate-selections per sessionId:', sessionId);
      
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator) {
        throw new Error('Sessione non valida o scaduta');
      }
      
      const validationResult = await orchestrator.validateSelections();
      console.log('Validazione completata con risultato:', validationResult.overallRating);
      return { validationResult };
    } catch (error) {
      console.error('Errore nella validazione:', error);
      throw new Error(`Errore nella validazione: ${error.message}`);
    }
  });

  // Scenari
  ipcMain.handle('generate-scenarios', async (event, sessionId) => {
    try {
      console.log('Richiesta generate-scenarios per sessionId:', sessionId);
      
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator) {
        throw new Error('Sessione non valida o scaduta');
      }
      
      const scenarios = await orchestrator.generateScenarios();
      console.log('Struttura dati scenari:', Object.keys(scenarios));
      return  scenarios ;
    } catch (error) {
      console.error('Errore nella generazione degli scenari:', error);
      throw new Error(`Errore nella generazione degli scenari: ${error.message}`);
    }
  });

  // Report
  ipcMain.handle('generate-report', async (event, sessionId) => {
    try {
      console.log('Richiesta generate-report per sessionId:', sessionId);
      
      const orchestrator = sessionOrchestrators.get(sessionId);
      if (!orchestrator) {
        throw new Error('Sessione non valida o scaduta');
      }
      
      const report = await orchestrator.generateReport();
      console.log('Report generato');
      return { report };
    } catch (error) {
      console.error('Errore nella generazione del report:', error);
      throw new Error(`Errore nella generazione del report: ${error.message}`);
    }
  });

  // Salvataggio file
  ipcMain.handle('save-document-as', async (event, data, defaultPath) => {
    try {
      console.log('Richiesta save-document-as con defaultPath:', defaultPath);
      
      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: defaultPath,
        filters: [
          { name: 'Documenti di testo', extensions: ['txt'] },
          { name: 'Documenti Word', extensions: ['docx'] },
          { name: 'Tutti i file', extensions: ['*'] }
        ]
      });
      
      if (!canceled && filePath) {
        fs.writeFileSync(filePath, data);
        console.log('Documento salvato in:', filePath);
        return { success: true, filePath };
      }
      
      console.log('Salvataggio documento annullato');
      return { success: false };
    } catch (error) {
      console.error('Errore nel salvataggio del documento:', error);
      throw new Error(`Errore nel salvataggio: ${error.message}`);
    }
  });

  // Salva sessione
  ipcMain.handle('save-session', async (event, sessionData, suggestedPath) => {
    try {
      console.log('Richiesta save-session');
      
      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: suggestedPath || 'analisi_finanziaria.safin',
        filters: [
          { name: 'SuperAgente Finanziario', extensions: ['safin'] },
          { name: 'Tutti i file', extensions: ['*'] }
        ]
      });
      
      if (!canceled && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2));
        console.log('Sessione salvata in:', filePath);
        return { success: true, filePath };
      }
      
      console.log('Salvataggio sessione annullato');
      return { success: false };
    } catch (error) {
      console.error('Errore nel salvataggio della sessione:', error);
      throw new Error(`Errore nel salvataggio: ${error.message}`);
    }
  });

  // Carica sessione
  ipcMain.handle('load-session', async (event) => {
    try {
      console.log('Richiesta load-session');
      
      const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [
          { name: 'SuperAgente Finanziario', extensions: ['safin'] },
          { name: 'Tutti i file', extensions: ['*'] }
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
        
        console.log('Sessione caricata con nuovo ID:', sessionId);
        return { success: true, sessionId, sessionData };
      }
      
      console.log('Caricamento sessione annullato');
      return { success: false };
    } catch (error) {
      console.error('Errore nel caricamento della sessione:', error);
      throw new Error(`Errore nel caricamento: ${error.message}`);
    }
  });
  
  console.log('Configurazione degli handler IPC completata');
}



module.exports = { setupIpcHandlers };