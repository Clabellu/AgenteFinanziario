// index.js
const AgentOrchestrator = require('./src/orchestrator/AgentOrchestrator');

// Indicatori finanziari di esempio
const sampleIndicators = {
  margineStruttura: 86033,
  margineTesoreria: 86033,
  capitaleCircolanteNetto: 86033,
  capitaleCircolanteNettoOperativo: 80881,
  indiceCapitalizzazione: 62.84,
  patrimonioNettoTangCap: 50.03,
  coperturaImmobilizzazioni: 1.83,
  autocoperturaImmobilizzazioni: 1.83,
  liquiditaCorrente: 1.77,
  liquiditaSecca: 1.77,
  indiceAutofinanziamento: 7.54,
  ebitda: 61435,
  redditCapitaleInvestito: 20.18,
  redditCapitaleProprio: 20.25,
  posizioneFinanziariaNetta: 80881,
  leverage: 1.59,
  debitiTotaliEbitda: 1.67,
  oneriFinanziariRol: 0.46,
  pfnPn: 0,
  emScore: 12.09
};

// Funzione per testare solo l'analisi finanziaria
async function testFinancialAnalysis() {
  console.log('Avvio test analisi finanziaria...');
  const orchestrator = new AgentOrchestrator();
  
  try {
    const analysis = await orchestrator.analyzeFinancialHealth(sampleIndicators);
    console.log('Analisi finanziaria completata:');
    console.log(analysis.analysis.substring(0, 500) + '...');
  } catch (error) {
    console.error('Errore durante l\'analisi:', error);
  }
}

// Funzione per testare l'individuazione delle ottimizzazioni
async function testOptimizations() {
  console.log('Avvio test ottimizzazioni...');
  const orchestrator = new AgentOrchestrator();
  
  try {
    await orchestrator.analyzeFinancialHealth(sampleIndicators);
    const optimizations = await orchestrator.identifyOptimizations();
    console.log(`Identificate ${optimizations.length} ottimizzazioni:`);
    optimizations.forEach((opt, idx) => {
      console.log(`${idx+1}. ${opt.title} (${opt.impact}, ${opt.timeframe})`);
    });
  } catch (error) {
    console.error('Errore durante l\'identificazione delle ottimizzazioni:', error);
  }
}

// Funzione per testare l'intero flusso
async function testFullFlow() {
  console.log('Avvio test flusso completo...');
  const orchestrator = new AgentOrchestrator();
  
  try {
    // Analizza gli indicatori
    await orchestrator.analyzeFinancialHealth(sampleIndicators);
    
    // Identifica ottimizzazioni
    const optimizations = await orchestrator.identifyOptimizations();
    
    // Seleziona alcune ottimizzazioni (le prime 3 per semplicità)
    const selectedIds = optimizations.slice(0, 3).map(opt => opt.id);
    orchestrator.updateSelectedOptimizations(selectedIds);
    
    // Valida le selezioni
    await orchestrator.validateSelections();
    
    // Genera scenari
    await orchestrator.generateScenarios();
    
    // Genera report finale
    const report = await orchestrator.generateReport();
    
    console.log('Report finale generato:');
    console.log(report.title);
    console.log('Executive Summary:');
    console.log(report.sections.executive.substring(0, 300) + '...');
  } catch (error) {
    console.error('Errore durante il flusso completo:', error);
  }
}

// Esegui il test desiderato
// Decommentare la funzione di test che si vuole eseguire
testFinancialAnalysis();
// testOptimizations();
testFullFlow();