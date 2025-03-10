const { Scenario } = require('../models/ScenarioModel');

class ScenarioGenerationAgent {
  constructor(aiService, calculationService) {
    this.aiService = aiService;
    this.calculationService = calculationService;
  }
  
  async generateScenarios(financialAnalysis, validatedOptimizations) {
    // Crea scenario base (senza ottimizzazioni)
    const baseScenario = new Scenario(
      'Scenario Base',
      'Proiezione finanziaria senza implementare alcuna ottimizzazione',
      [],
      financialAnalysis.rawIndicators
    );
    
    // Crea gli scenari con diverse combinazioni di ottimizzazioni
    const selectedOptimizations = validatedOptimizations.filter(opt => opt.selected);
    
    // Per simulare gli scenari, utilizza il servizio di calcolo
    const realisticScenario = this._createRealisticScenario(
      financialAnalysis, 
      selectedOptimizations,
      this.calculationService
    );
    
    const optimisticScenario = this._createOptimisticScenario(
      financialAnalysis, 
      selectedOptimizations,
      this.calculationService
    );
    
    const scenarios = {
      base: baseScenario,
      realistic: realisticScenario,
      optimistic: optimisticScenario
    };
    
    // Arricchisci gli scenari con l'analisi AI
    const enrichedScenarios = await this._enrichScenariosWithAI(scenarios, financialAnalysis);
    
    return enrichedScenarios;
  }
  
  _createRealisticScenario(financialAnalysis, optimizations, calculationService) {
    // Simula l'impatto realistico delle ottimizzazioni
    const projections = calculationService.simulateScenario(
      financialAnalysis.rawIndicators,
      optimizations,
      { impactMultiplier: 1.0 } // impatto standard
    );
    
    return new Scenario(
      'Scenario Realistico',
      'Proiezione con implementazione ragionevole delle ottimizzazioni selezionate',
      optimizations,
      projections
    );
  }
  
  _createOptimisticScenario(financialAnalysis, optimizations, calculationService) {
    // Simula l'impatto ottimistico delle ottimizzazioni
    const projections = calculationService.simulateScenario(
      financialAnalysis.rawIndicators,
      optimizations,
      { impactMultiplier: 1.3 } // impatto maggiorato del 30%
    );
    
    return new Scenario(
      'Scenario Ottimistico',
      'Proiezione assumendo un\'implementazione particolarmente efficace delle ottimizzazioni',
      optimizations,
      projections
    );
  }
  
  async _enrichScenariosWithAI(scenarios, financialAnalysis) {
    const prompt = `
    Analizza i seguenti scenari finanziari generati in base all'implementazione di diverse ottimizzazioni:
    
    SCENARIO BASE (nessuna ottimizzazione):
    ${this._formatScenarioForPrompt(scenarios.base)}
    
    SCENARIO REALISTICO:
    ${this._formatScenarioForPrompt(scenarios.realistic)}
    
    SCENARIO OTTIMISTICO:
    ${this._formatScenarioForPrompt(scenarios.optimistic)}
    
    Per ciascuno scenario, fornisci:
    1. Una valutazione dettagliata dell'impatto sugli indicatori chiave
    2. I principali rischi e opportunità
    3. Una stima della probabilità di successo
    4. Raccomandazioni su come massimizzare i benefici
    5. Una timeline ottimale di implementazione
    
    Inoltre, fornisci un confronto tra gli scenari evidenziando i trade-off e le considerazioni strategiche.
    `;
    
    try {
      const analysis = await this.aiService.generateCompletion(prompt, {
        systemPrompt: "Sei un esperto in pianificazione finanziaria strategica e modellazione di scenari. Analizza gli scenari con approccio analitico e formula raccomandazioni concrete.",
        temperature: 0.4
      });
      
      // Analizza e struttura la risposta
      return this._parseScenarioAnalysis(scenarios, analysis);
    } catch (error) {
      console.error("Errore nell'analisi degli scenari:", error);
      return scenarios; // Restituisci gli scenari originali in caso di errore
    }
  }
  
  _formatScenarioForPrompt(scenario) {
    let text = `Nome: ${scenario.name}\nDescrizione: ${scenario.description}\n`;
    
    if (scenario.optimizations.length > 0) {
      text += `\nOttimizzazioni implementate:\n`;
      scenario.optimizations.forEach((opt, idx) => {
        text += `- ${opt.title} (Impatto: ${opt.impact}, Timeframe: ${opt.timeframe})\n`;
      });
    }
    
    text += `\nProiezioni finanziarie:\n`;
    Object.entries(scenario.projections).forEach(([key, value]) => {
      // Mostra solo gli indicatori principali per non appesantire troppo il prompt
      if (['ebitda', 'redditCapitaleInvestito', 'liquiditaCorrente', 'indiceCapitalizzazione', 'debitiTotaliEbitda'].includes(key)) {
        text += `- ${key}: ${value}\n`;
      }
    });
    
    return text;
  }
  
  _parseScenarioAnalysis(scenarios, analysisText) {
    // Estrai le sezioni per ciascuno scenario
    const baseAnalysis = this._extractScenarioSection(analysisText, 'SCENARIO BASE', 'SCENARIO REALISTICO');
    const realisticAnalysis = this._extractScenarioSection(analysisText, 'SCENARIO REALISTICO', 'SCENARIO OTTIMISTICO');
    const optimisticAnalysis = this._extractScenarioSection(analysisText, 'SCENARIO OTTIMISTICO', 'CONFRONTO TRA SCENARI');
    const comparison = this._extractScenarioSection(analysisText, 'CONFRONTO TRA SCENARI', null);
    
    // Aggiorna gli scenari con le analisi
    const updatedScenarios = { ...scenarios };
    
    updatedScenarios.base.analysis = this._structureScenarioAnalysis(baseAnalysis);
    updatedScenarios.realistic.analysis = this._structureScenarioAnalysis(realisticAnalysis);
    updatedScenarios.optimistic.analysis = this._structureScenarioAnalysis(optimisticAnalysis);
    updatedScenarios.comparison = comparison;
    
    return updatedScenarios;
  }
  
  _extractScenarioSection(text, sectionStart, sectionEnd) {
    const startIdx = text.indexOf(sectionStart);
    if (startIdx === -1) return '';
    
    const endIdx = sectionEnd ? text.indexOf(sectionEnd) : undefined;
    return text.substring(startIdx, endIdx).trim();
  }
  
  _structureScenarioAnalysis(analysisText) {
    // Estrai informazioni strutturate dall'analisi testuale
    const impactMatch = analysisText.match(/impatto[^:]*:([^]*?)(?:\d\.|$)/i);
    const risksMatch = analysisText.match(/rischi[^:]*:([^]*?)(?:\d\.|$)/i);
    const successMatch = analysisText.match(/probabilità[^:]*:([^]*?)(?:\d\.|$)/i);
    const recommendationsMatch = analysisText.match(/raccomandaz[^:]*:([^]*?)(?:\d\.|$)/i);
    const timelineMatch = analysisText.match(/timeline[^:]*:([^]*?)(?:\d\.|$)/i);
    
    return {
      impact: impactMatch ? impactMatch[1].trim() : '',
      risksAndOpportunities: risksMatch ? risksMatch[1].trim() : '',
      successProbability: successMatch ? successMatch[1].trim() : '',
      recommendations: recommendationsMatch ? recommendationsMatch[1].trim() : '',
      timeline: timelineMatch ? timelineMatch[1].trim() : '',
      fullAnalysis: analysisText
    };
  }
}

module.exports = ScenarioGenerationAgent;