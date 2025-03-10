// server.js
const express = require('express');
const cors = require('cors');
const AgentOrchestrator = require('./src/orchestrator/AgentOrchestrator');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Orchestratore condiviso o per sessione
const orchestrators = new Map();

// Endpoint per l'analisi finanziaria
app.post('/api/analyze', async (req, res) => {
  try {
    const { sessionId, indicators } = req.body;
    
    if (!indicators) {
      return res.status(400).json({ error: 'Indicatori finanziari mancanti' });
    }
    
    // Crea o recupera l'orchestratore per questa sessione
    let orchestrator = orchestrators.get(sessionId);
    if (!orchestrator) {
      orchestrator = new AgentOrchestrator();
      orchestrators.set(sessionId, orchestrator);
    }
    
    const analysis = await orchestrator.analyzeFinancialHealth(indicators);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Errore nell\'analisi:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint per le ottimizzazioni
app.post('/api/optimizations', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId || !orchestrators.has(sessionId)) {
      return res.status(400).json({ error: 'Sessione non valida o analisi non eseguita' });
    }
    
    const orchestrator = orchestrators.get(sessionId);
    const optimizations = await orchestrator.identifyOptimizations();
    
    res.json({ success: true, optimizations });
  } catch (error) {
    console.error('Errore nell\'identificazione delle ottimizzazioni:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint per aggiornare le selezioni
app.post('/api/selections', async (req, res) => {
  try {
    const { sessionId, selectedIds } = req.body;
    
    if (!sessionId || !orchestrators.has(sessionId) || !selectedIds) {
      return res.status(400).json({ error: 'Parametri mancanti o sessione non valida' });
    }
    
    const orchestrator = orchestrators.get(sessionId);
    const selectedOptimizations = orchestrator.updateSelectedOptimizations(selectedIds);
    
    res.json({ success: true, selectedOptimizations });
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle selezioni:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint per la validazione
app.post('/api/validate', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId || !orchestrators.has(sessionId)) {
      return res.status(400).json({ error: 'Sessione non valida' });
    }
    
    const orchestrator = orchestrators.get(sessionId);
    const validationResult = await orchestrator.validateSelections();
    
    res.json({ success: true, validationResult });
  } catch (error) {
    console.error('Errore nella validazione:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint per gli scenari
app.post('/api/scenarios', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId || !orchestrators.has(sessionId)) {
      return res.status(400).json({ error: 'Sessione non valida' });
    }
    
    const orchestrator = orchestrators.get(sessionId);
    const scenarios = await orchestrator.generateScenarios();
    
    res.json({ success: true, scenarios });
  } catch (error) {
    console.error('Errore nella generazione degli scenari:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint per il report finale
app.post('/api/report', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId || !orchestrators.has(sessionId)) {
      return res.status(400).json({ error: 'Sessione non valida' });
    }
    
    const orchestrator = orchestrators.get(sessionId);
    const report = await orchestrator.generateReport();
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Errore nella generazione del report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server API del SuperAgente Finanziario in ascolto sulla porta ${port}`);
});