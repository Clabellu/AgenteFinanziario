const FinancialAnalysisAgent = require('../agents/FinancialAnalysisAgent');
const OptimizationAgent = require('../agents/OptimizationAgent');
const ValidationAgent = require('../agents/ValidationAgent');
const ScenarioGenerationAgent = require('../agents/ScenarioGenerationAgent');
const ReportAgent = require('../agents/ReportAgent');

const AIService = require('../services/AIService');
const FinancialCalculationService = require('../services/FinancialCalculationService');

class AgentOrchestrator {
  constructor() {
    // Inizializza i servizi condivisi
    this.aiService = new AIService();
    this.calculationService = new FinancialCalculationService();
    
    // Inizializza gli agenti
    this.financialAnalysisAgent = new FinancialAnalysisAgent(this.aiService, this.calculationService);
    this.optimizationAgent = new OptimizationAgent(this.aiService);
    this.validationAgent = new ValidationAgent(this.aiService);
    this.scenarioGenerationAgent = new ScenarioGenerationAgent(this.aiService, this.calculationService);
    this.reportAgent = new ReportAgent(this.aiService);
    
    // Stato dell'orchestratore
    this.state = {
      financialData: null,
      financialAnalysis: null,
      optimizations: [],
      selectedOptimizationIds: [],
      validationResult: null,
      scenarios: null,
      report: null
    };
  }
  
  // Step 1: Analisi degli indicatori finanziari
  async analyzeFinancialHealth(indicators) {
    try {
      console.log("🔍 Avvio analisi finanziaria...");
      this.state.financialData = indicators;
      this.state.financialAnalysis = await this.financialAnalysisAgent.analyze(indicators);
      console.log("✅ Analisi finanziaria completata");
      return this.state.financialAnalysis;
    } catch (error) {
      console.error("❌ Errore nell'analisi finanziaria:", error);
      throw new Error("Errore nell'analisi finanziaria: " + error.message);
    }
  }
  
  // Step 2: Identificazione opportunità di ottimizzazione
  async identifyOptimizations() {
    if (!this.state.financialAnalysis) {
      throw new Error("Analisi finanziaria non disponibile. Esegui prima analyzeFinancialHealth()");
    }
    
    try {
      console.log("🔍 Identificazione ottimizzazioni...");
      this.state.optimizations = await this.optimizationAgent.generateOptimizations(this.state.financialAnalysis);
      console.log(`✅ Identificate ${this.state.optimizations.length} ottimizzazioni`);
      return this.state.optimizations;
    } catch (error) {
      console.error("❌ Errore nell'identificazione delle ottimizzazioni:", error);
      throw new Error("Errore nell'identificazione delle ottimizzazioni: " + error.message);
    }
  }
  
  // Step 3: Aggiornamento delle selezioni utente
  updateSelectedOptimizations(selectedOptimizationIds) {
    console.log(`🔄 Aggiornamento selezioni: ${selectedOptimizationIds.length} ottimizzazioni selezionate`);
    this.state.selectedOptimizationIds = selectedOptimizationIds;
    
    // Aggiorna lo stato selected delle ottimizzazioni
    this.state.optimizations.forEach(opt => {
      opt.selected = selectedOptimizationIds.includes(opt.id);
    });
    
    return this.state.optimizations.filter(opt => opt.selected);
  }
  
  // Step 4: Validazione delle selezioni
  async validateSelections() {
    if (!this.state.optimizations || this.state.optimizations.length === 0) {
      throw new Error("Ottimizzazioni non disponibili. Esegui prima identifyOptimizations()");
    }
    
    if (this.state.selectedOptimizationIds.length === 0) {
      throw new Error("Nessuna ottimizzazione selezionata. Esegui prima updateSelectedOptimizations()");
    }
    
    try {
      console.log("🔍 Validazione selezioni...");
      this.state.validationResult = await this.validationAgent.validateSelections(
        this.state.financialAnalysis,
        this.state.optimizations,
        this.state.selectedOptimizationIds
      );
      console.log(`✅ Validazione completata: ${this.state.validationResult.overallRating}`);
      return this.state.validationResult;
    } catch (error) {
      console.error("❌ Errore nella validazione delle selezioni:", error);
      throw new Error("Errore nella validazione delle selezioni: " + error.message);
    }
  }
  
  // Step 5: Generazione scenari
  async generateScenarios() {
    if (!this.state.validationResult) {
      throw new Error("Validazione non disponibile. Esegui prima validateSelections()");
    }
    
    try {
      console.log("🔍 Generazione scenari...");
      this.state.scenarios = await this.scenarioGenerationAgent.generateScenarios(
        this.state.financialAnalysis,
        this.state.optimizations
      );
      console.log("✅ Generazione scenari completata");
      return this.state.scenarios;
    } catch (error) {
      console.error("❌ Errore nella generazione degli scenari:", error);
      throw new Error("Errore nella generazione degli scenari: " + error.message);
    }
  }
  
  // Step 6: Generazione report finale
  async generateReport() {
    if (!this.state.scenarios) {
      throw new Error("Scenari non disponibili. Esegui prima generateScenarios()");
    }
    
    try {
      console.log("📝 Generazione report finale...");
      this.state.report = await this.reportAgent.generateReport(
        this.state.financialAnalysis,
        this.state.optimizations,
        this.state.validationResult,
        this.state.scenarios
      );
      console.log("✅ Report generato con successo");
      return this.state.report;
    } catch (error) {
      console.error("❌ Errore nella generazione del report:", error);
      throw new Error("Errore nella generazione del report: " + error.message);
    }
  }
  
  // Esegui l'intero flusso di analisi in sequenza
  async runFullAnalysis(indicators, selectedOptimizationIds) {
    await this.analyzeFinancialHealth(indicators);
    await this.identifyOptimizations();
    this.updateSelectedOptimizations(selectedOptimizationIds);
    await this.validateSelections();
    await this.generateScenarios();
    return await this.generateReport();
  }
  
  // Ottieni lo stato corrente
  getState() {
    return { ...this.state };
  }
  
  // Resetta lo stato
  reset() {
    this.state = {
      financialData: null,
      financialAnalysis: null,
      optimizations: [],
      selectedOptimizationIds: [],
      validationResult: null,
      scenarios: null,
      report: null
    };
    console.log("🔄 Stato resettato");
  }
}

module.exports = AgentOrchestrator;