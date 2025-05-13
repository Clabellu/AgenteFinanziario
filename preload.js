// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Espone API sicure dal processo principale al renderer
contextBridge.exposeInMainWorld('superAgenteAPI', {
  // Analisi finanziaria
  analyzeFinancialHealth: async (indicators) => {
    console.log('preload: richiesta analyzeFinancialHealth', indicators);
    try {
      const result = await ipcRenderer.invoke('analyze-financial-health', indicators);
      console.log('preload: risultato analyzeFinancialHealth ricevuto', 
                  result ? 'OK' : 'NULL', 
                  result && result.analysis ? 'ha analysis' : 'NO analysis');
      
      // Verifica e sanitizza la risposta prima di restituirla
      if (result && result.analysis && result.analysis.analysis) {
        console.log('preload: lunghezza analysis', result.analysis.analysis.length);
      } else {
        console.warn('preload: risposta incompleta, aggiunta analysis predefinita');
        if (!result.analysis) {
          result.analysis = {};
        }
        if (!result.analysis.analysis) {
          result.analysis.analysis = "Analisi non disponibile. I dati sono stati elaborati e puoi continuare.";
        }
      }
      
      return result;
    } catch (error) {
      console.error('preload: errore in analyzeFinancialHealth', error);
      // Restituisci un oggetto valido anche in caso di errore
      return {
        sessionId: `session_err_${Date.now()}`,
        analysis: {
          analysis: `Errore di comunicazione: ${error.message}. Puoi continuare comunque.`
        }
      };
    }
  },
  
  // Ottimizzazioni
  identifyOptimizations: async (sessionId) => {
    console.log('preload: richiesta identifyOptimizations', sessionId);
    try {
      const result = await ipcRenderer.invoke('identify-optimizations', sessionId);
      console.log('preload: risultato identifyOptimizations', result);
      return result;
    } catch (error) {
      console.error('preload: errore in identifyOptimizations', error);
      throw error;
    }
  },
  
  // Selezione ottimizzazioni
  updateSelectedOptimizations: async (sessionId, selectedIds) => {
    console.log('preload: richiesta updateSelectedOptimizations', { sessionId, selectedIds });
    try {
      const result = await ipcRenderer.invoke('update-selected-optimizations', sessionId, selectedIds);
      console.log('preload: risultato updateSelectedOptimizations', result);
      return result;
    } catch (error) {
      console.error('preload: errore in updateSelectedOptimizations', error);
      throw error;
    }
  },
  
  // Validazione
  validateSelections: async (sessionId) => {
    console.log('preload: richiesta validateSelections', sessionId);
    try {
      const result = await ipcRenderer.invoke('validate-selections', sessionId);
      console.log('preload: risultato validateSelections', result);
      return result;
    } catch (error) {
      console.error('preload: errore in validateSelections', error);
      throw error;
    }
  },
  
  // Scenari
  generateScenarios: async (sessionId) => {
    console.log('preload: richiesta generateScenarios', sessionId);
    try {
      const result = await ipcRenderer.invoke('generate-scenarios', sessionId);
      console.log('preload: risultato generateScenarios', result);
      return result;
    } catch (error) {
      console.error('preload: errore in generateScenarios', error);
      throw error;
    }
  },
  
  // Report
  generateReport: async (sessionId) => {
    console.log('preload: richiesta generateReport', sessionId);
    try {
      const result = await ipcRenderer.invoke('generate-report', sessionId);
      console.log('preload: risultato generateReport', result);
      return result;
    } catch (error) {
      console.error('preload: errore in generateReport', error);
      throw error;
    }
  },
  
  // Esportazione file
  saveDocumentAs: async (data, defaultPath) => {
    console.log('preload: richiesta saveDocumentAs', { defaultPath });
    try {
      const result = await ipcRenderer.invoke('save-document-as', data, defaultPath);
      console.log('preload: risultato saveDocumentAs', result);
      return result;
    } catch (error) {
      console.error('preload: errore in saveDocumentAs', error);
      throw error;
    }
  },
    
  // Salvataggio/Caricamento stato
  saveSession: async (sessionData, filePath) => {
    console.log('preload: richiesta saveSession');
    try {
      const result = await ipcRenderer.invoke('save-session', sessionData, filePath);
      console.log('preload: risultato saveSession', result);
      return result;
    } catch (error) {
      console.error('preload: errore in saveSession', error);
      throw error;
    }
  },
  
  loadSession: async () => {
    console.log('preload: richiesta loadSession');
    try {
      const result = await ipcRenderer.invoke('load-session');
      console.log('preload: risultato loadSession', result);
      return result;
    } catch (error) {
      console.error('preload: errore in loadSession', error);
      throw error;
    }
  },

  initReportConversation: async (reportData) => {
    console.log('preload: richiesta initReportConversation', reportData);
    try {
      const result = await ipcRenderer.invoke('init-report-conversation', reportData);
      console.log('preload: risultato initReportConversation', result);
      return result;
    } catch (error) {
      console.error('preload: errore in initReportConversation', error);
      throw error;
    }
  },

  // Invio di una domanda alla conversazione
  sendReportQuestion: async (conversationId, question) => {
    console.log('preload: richiesta sendReportQuestion', { conversationId, question });
    try {
      const result = await ipcRenderer.invoke('send-report-question', conversationId, question);
      console.log('preload: risultato sendReportQuestion', result);
      return result;
    } catch (error) {
      console.error('preload: errore in sendReportQuestion', error);
      throw error;
    }
  },

  // Eliminazione di una conversazione
  deleteReportConversation: async (conversationId) => {
    console.log('preload: richiesta deleteReportConversation', conversationId);
    try {
      const result = await ipcRenderer.invoke('delete-report-conversation', conversationId);
      console.log('preload: risultato deleteReportConversation', result);
      return result;
    } catch (error) {
      console.error('preload: errore in deleteReportConversation', error);
      throw error;
    }
  }

});

console.log('Preload script eseguito, API superAgenteAPI esposta');