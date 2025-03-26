const { Scenario } = require('../models/ScenarioModel');

class ScenarioGenerationAgent {
  constructor(aiService, calculationService) {
    this.aiService = aiService;
    this.calculationService = calculationService;
  }
  
  async generateScenarios(financialAnalysis, validatedOptimizations) {
    // Crea scenario pessimistico (senza ottimizzazioni, con peggioramento)
    const pessimisticScenario = new Scenario(
      'Scenario Pessimistico',
      'Proiezione finanziaria con implementazione minima delle ottimizzazioni in un contesto sfavorevole',
      validatedOptimizations.filter(opt => opt.selected),
      this.calculationService.simulateScenario(
        financialAnalysis.rawIndicators,
        validatedOptimizations.filter(opt => opt.selected),
        { impactMultiplier: 0.7 } // impatto ridotto del 30%
     )
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
      pessimistic: pessimisticScenario,
      realistic: realisticScenario,
      optimistic: optimisticScenario
    };
    
    // Arricchisci gli scenari con l'analisi AI
    const enrichedScenarios = await this._enrichScenariosWithAI(scenarios, financialAnalysis, selectedOptimizations);
    
    // Aggiungi una comparazione approfondita degli scenari
    enrichedScenarios.comparison = await this._generateScenariosComparison(enrichedScenarios, selectedOptimizations);
    
    return enrichedScenarios;
  }
  
  _createPessimisticProjections(indicators) {
    // Crea una copia degli indicatori e peggiora alcuni valori chiave
    const pessimisticIndicators = { ...indicators };
    
    // Riduzione della liquidità
    if (pessimisticIndicators.liquiditaCorrente) {
      pessimisticIndicators.liquiditaCorrente *= 0.85; // -15%
    }
    if (pessimisticIndicators.liquiditaSecca) {
      pessimisticIndicators.liquiditaSecca *= 0.85; // -15%
    }
    
    // Riduzione della redditività
    if (pessimisticIndicators.ebitda) {
      pessimisticIndicators.ebitda *= 0.85; // -15%
    }
    if (pessimisticIndicators.redditCapitaleInvestito) {
      pessimisticIndicators.redditCapitaleInvestito *= 0.85; // -15%
    }
    if (pessimisticIndicators.redditCapitaleProprio) {
      pessimisticIndicators.redditCapitaleProprio *= 0.85; // -15%
    }
    
    // Aumento dell'indebitamento
    if (pessimisticIndicators.leverage) {
      pessimisticIndicators.leverage *= 1.15; // +15%
    }
    if (pessimisticIndicators.debitiTotaliEbitda) {
      pessimisticIndicators.debitiTotaliEbitda *= 1.15; // +15%
    }
    
    // Peggioramento del capitale circolante
    if (pessimisticIndicators.capitaleCircolanteNettoOperativo) {
      pessimisticIndicators.capitaleCircolanteNettoOperativo *= 0.8; // -20%
    }
    
    return pessimisticIndicators;
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
      'Proiezione con implementazione ragionevole delle ottimizzazioni selezionate, con risultati in linea con le aspettative',
      optimizations,
      projections
    );
  }
  
  _createOptimisticScenario(financialAnalysis, optimizations, calculationService) {
    // Simula l'impatto ottimistico delle ottimizzazioni
    const projections = calculationService.simulateScenario(
      financialAnalysis.rawIndicators,
      optimizations,
      { impactMultiplier: 1.5 } // impatto maggiorato del 50%
    );
    
    return new Scenario(
      'Scenario Ottimistico',
      'Proiezione assumendo un\'implementazione particolarmente efficace delle ottimizzazioni, con risultati superiori alle aspettative',
      optimizations,
      projections
    );
  }
  
  async _enrichScenariosWithAI(scenarios, financialAnalysis, selectedOptimizations) {
    const prompt = `
    Analizza i seguenti scenari finanziari generati in base all'implementazione di diverse ottimizzazioni:
    
    SCENARIO PESSIMISTICO (implementazione minima delle ottimizzazioni in contesto sfavorevole):
    ${this._formatScenarioForPrompt(scenarios.pessimistic)}
    
    SCENARIO REALISTICO (con ottimizzazioni implementate in modo standard):
    ${this._formatScenarioForPrompt(scenarios.realistic)}
    
    SCENARIO OTTIMISTICO (con ottimizzazioni implementate in modo particolarmente efficace):
    ${this._formatScenarioForPrompt(scenarios.optimistic)}
    
    OTTIMIZZAZIONI SELEZIONATE:
    ${selectedOptimizations.map((opt, idx) => 
      `${idx+1}. ${opt.title} (Impatto: ${opt.impact}, Timeframe: ${opt.timeframe}, Categoria: ${opt.category})\n${opt.description}`
    ).join('\n\n')}
    
    Per ciascuno scenario, fornisci:
    1. Una valutazione dettagliata dell'impatto sugli indicatori chiave (liquidità, redditività, struttura, indebitamento)
    2. I principali rischi e opportunità specifici di questo scenario
    3. Una stima della probabilità di successo e fattori che potrebbero influenzarla
    4. Raccomandazioni strategiche su come gestire e massimizzare i benefici in questo scenario
    5. Una timeline ottimale per l'implementazione delle azioni in questo scenario
    
    Fornisci un'analisi approfondita e dettagliata per CIASCUNO dei tre scenari, con almeno 300-400 parole per ogni scenario.
    Sii specifico riguardo agli impatti sugli indicatori finanziari chiave in ciascuno scenario.
    
    Formatta la risposta in modo strutturato, utilizzando per ogni scenario le cinque sezioni sopra indicate.
    Usa il formato:
    
    ANALISI SCENARIO PESSIMISTICO:
    1. Valutazione impatto: [analisi]
    2. Rischi e opportunità: [analisi]
    3. Probabilità di successo: [analisi]
    4. Raccomandazioni: [analisi]
    5. Timeline: [analisi]
    
    E così via per gli altri scenari.
    `;
    
    try {
      const analysis = await this.aiService.generateCompletion(prompt, {
        systemPrompt: "Sei un esperto in pianificazione finanziaria strategica e modellazione di scenari. Analizza gli scenari con approccio analitico e formula raccomandazioni concrete e dettagliate. Fornisci analisi approfondite e complete senza riassumere eccessivamente.",
        temperature: 0.5,
        maxTokens: 3500
      });
      
      // Analizza e struttura la risposta
      return this._parseScenarioAnalysis(scenarios, analysis);
    } catch (error) {
      console.error("Errore nell'analisi degli scenari:", error);
      // In caso di errore, crea delle analisi di fallback
      return this._createFallbackAnalysis(scenarios);
    }
  }
  
  async _generateScenariosComparison(scenarios, selectedOptimizations) {
    const prompt = `
    Genera un confronto approfondito tra i seguenti tre scenari finanziari:
    
    SCENARIO PESSIMISTICO:
    ${scenarios.pessimistic.description}
    ${this._formatKeyMetrics(scenarios.pessimistic.projections)}
    
    SCENARIO REALISTICO:
    ${scenarios.realistic.description}
    ${this._formatKeyMetrics(scenarios.realistic.projections)}
    Ottimizzazioni: ${selectedOptimizations.map(opt => opt.title).join(', ')}
    
    SCENARIO OTTIMISTICO:
    ${scenarios.optimistic.description}
    ${this._formatKeyMetrics(scenarios.optimistic.projections)}
    Ottimizzazioni: ${selectedOptimizations.map(opt => opt.title).join(', ')}
    
    Fornisci un'analisi comparativa che includa:
    1. Confronto dettagliato dell'impatto sugli indicatori finanziari chiave nei tre scenari
    2. Analisi rischio-rendimento dei tre scenari
    3. Quali sono i principali fattori che determinano quale scenario si realizzerà
    4. Raccomandazioni su come massimizzare la probabilità di realizzare lo scenario ottimistico
    5. Strategie di mitigazione del rischio per evitare lo scenario pessimistico
    
    Fornisci un confronto approfondito di almeno 500-600 parole che evidenzi chiaramente le differenze tra i tre scenari
    e offra indicazioni pratiche su come gestire la pianificazione strategica in base a queste proiezioni.
    `;
    
    try {
      const comparison = await this.aiService.generateCompletion(prompt, {
        systemPrompt: "Sei un consulente finanziario strategico esperto nell'analisi comparativa di scenari finanziari. Fornisci un'analisi dettagliata, approfondita e fruibile che evidenzi chiaramente le differenze tra gli scenari e offra raccomandazioni pratiche.",
        temperature: 0.5,
        maxTokens: 2000
      });
      
      return comparison;
    } catch (error) {
      console.error("Errore nella generazione della comparazione degli scenari:", error);
      return "Non è stato possibile generare un confronto dettagliato degli scenari a causa di un errore tecnico. Si consiglia di rivedere le analisi individuali degli scenari per comprendere le differenze e le implicazioni.";
    }
  }
  
  _formatKeyMetrics(projections) {
    const keyMetrics = [
      'ebitda', 'redditCapitaleInvestito', 'redditCapitaleProprio',
      'liquiditaCorrente', 'indiceCapitalizzazione', 'debitiTotaliEbitda',
      'capitaleCircolanteNettoOperativo'
    ];
    
    return keyMetrics
      .filter(key => projections[key] !== undefined)
      .map(key => `${key}: ${projections[key]}`)
      .join(', ');
  }
  
  _formatScenarioForPrompt(scenario) {
    let text = `Nome: ${scenario.name}\nDescrizione: ${scenario.description}\n`;
    
    if (scenario.optimizations && scenario.optimizations.length > 0) {
      text += `\nOttimizzazioni implementate:\n`;
      scenario.optimizations.forEach((opt, idx) => {
        text += `- ${opt.title} (Impatto: ${opt.impact}, Timeframe: ${opt.timeframe}, Categoria: ${opt.category})\n`;
      });
    }
    
    text += `\nProiezioni finanziarie:\n`;
    const keyIndicators = [
      'ebitda', 'redditCapitaleInvestito', 'redditCapitaleProprio',
      'liquiditaCorrente', 'liquiditaSecca', 'indiceCapitalizzazione',
      'debitiTotaliEbitda', 'leverage', 'capitaleCircolanteNettoOperativo',
      'margineStruttura', 'indiceAutofinanziamento'
    ];
    
    keyIndicators.forEach(key => {
      if (scenario.projections[key] !== undefined) {
        text += `- ${key}: ${scenario.projections[key]}\n`;
      }
    });
    
    return text;
  }
  
  _parseScenarioAnalysis(scenarios, analysisText) {
    // Patterns di ricerca più flessibili
    const pessimisticPattern = /(ANALISI\s+)?SCENARIO\s+PESSIMISTICO/i;
    const realisticPattern = /(ANALISI\s+)?SCENARIO\s+REALISTICO/i;
    const optimisticPattern = /(ANALISI\s+)?SCENARIO\s+OTTIMISTICO/i;
    const comparisonPattern = /CONFRONTO\s+TRA\s+SCENARI/i;

    // Estrai le sezioni per ciascuno scenario
    const pessimisticAnalysis = this._extractScenarioSection(analysisText, pessimisticPattern, realisticPattern);
    const realisticAnalysis = this._extractScenarioSection(analysisText, realisticPattern, optimisticPattern);
    const optimisticAnalysis = this._extractScenarioSection(analysisText, optimisticPattern, comparisonPattern);
    const comparison = this._extractScenarioSection(analysisText, comparisonPattern, null);

    // Log di debug per verificare l'estrazione
    console.log("Lunghezza analisi pessimistica:", pessimisticAnalysis.length);
    console.log("Lunghezza analisi realistica:", realisticAnalysis.length);
    console.log("Lunghezza analisi ottimistica:", optimisticAnalysis.length);

    // Verifica che le sezioni non siano vuote
    if (optimisticAnalysis.length < 100) {
      console.warn("Estrazione analisi ottimistica fallita o troppo breve");
      // Cerca di estrarre con un pattern più generico o con confini diversi
      const alternativeOptimisticAnalysis = this._extractAlternativeOptimisticAnalysis(analysisText);
      if (alternativeOptimisticAnalysis.length > 100) {
          console.log("Utilizzando analisi ottimistica alternativa");
          optimisticAnalysis = alternativeOptimisticAnalysis;
      }
    }
    
    // Aggiorna gli scenari con le analisi
    const updatedScenarios = { ...scenarios };
    
    updatedScenarios.pessimistic.analysis = this._structureScenarioAnalysis(pessimisticAnalysis);
    updatedScenarios.realistic.analysis = this._structureScenarioAnalysis(realisticAnalysis);
    updatedScenarios.optimistic.analysis = this._structureScenarioAnalysis(optimisticAnalysis);
    updatedScenarios.comparison = comparison;
     
    return updatedScenarios;
  }

  // Metodo ausiliario per tentare estrazione alternativa
_extractAlternativeOptimisticAnalysis(analysisText) {
  // Cerca una sezione che parla di scenario ottimistico in qualsiasi formato
  const match = analysisText.match(/ottimistico[^]*?(?:CONFRONTO|$)/i);
  return match ? match[0] : "";
}
  
  _extractScenarioSection(text, sectionStart, sectionEnd) {
    const startIdx = text.indexOf(sectionStart);
    if (startIdx === -1) return 'Analisi non disponibile.';
    
    const endIdx = sectionEnd ? text.indexOf(sectionEnd) : undefined;
    return text.substring(startIdx, endIdx !== undefined ? endIdx : undefined).trim();
  }
  
  _structureScenarioAnalysis(analysisText) {
    // Estrai informazioni strutturate dall'analisi testuale
    const impactMatch = analysisText.match(/1\.\s*Valutazione\s*[^:]*:([^]*?)(?:2\.|$)/i);
    const risksMatch = analysisText.match(/2\.\s*Rischi\s*[^:]*:([^]*?)(?:3\.|$)/i);
    const successMatch = analysisText.match(/3\.\s*Probabilità\s*[^:]*:([^]*?)(?:4\.|$)/i);
    const recommendationsMatch = analysisText.match(/4\.\s*Raccomandaz[^:]*:([^]*?)(?:5\.|$)/i);
    const timelineMatch = analysisText.match(/5\.\s*Timeline[^:]*:([^]*?)(?:$)/i);
    const fullAnalysisMatch = analysisText.match(/ANALISI COMPLETA([^]*?)$/i);
    
    return {
      impact: impactMatch ? impactMatch[1].trim() : 'Valutazione impatto non disponibile.',
      risksAndOpportunities: risksMatch ? risksMatch[1].trim() : 'Rischi e opportunità non disponibili.',
      successProbability: successMatch ? successMatch[1].trim() : 'Probabilità di successo non disponibile.',
      recommendations: recommendationsMatch ? recommendationsMatch[1].trim() : 'Raccomandazioni non disponibili.',
      timeline: timelineMatch ? timelineMatch[1].trim() : 'Timeline non disponibile.',
      fullAnalysis: fullAnalysisMatch ? fullAnalysisMatch[1].trim() : analysisText
    };
  }
  
  _createFallbackAnalysis(scenarios) {
    // Crea analisi di fallback in caso di errore nella chiamata AI
    const updatedScenarios = { ...scenarios };
    
    const createBasicAnalysis = (scenario, type) => {
      let impactText, risksText, successText, recommendText, timelineText;
      
      if (type === 'pessimistic') {
        impactText = "In questo scenario pessimistico, si prevede un deterioramento degli indicatori finanziari chiave. La liquidità corrente e la redditività potrebbero diminuire, mentre l'indebitamento potrebbe aumentare.";
        risksText = "I principali rischi includono problemi di liquidità, difficoltà nel far fronte ai debiti a breve termine e possibile riduzione della redditività. L'opportunità principale è la possibilità di identificare tempestivamente le aree problematiche e intervenire.";
        successText = "La probabilità di incorrere in questo scenario è moderata, ma può aumentare in caso di deterioramento delle condizioni di mercato o mancata implementazione di strategie correttive.";
        recommendText = "Si raccomanda di monitorare attentamente la liquidità, preparare piani di contingenza e identificare precocemente segnali di deterioramento delle condizioni finanziarie.";
        timelineText = "Occorre implementare immediatamente un sistema di monitoraggio più rigoroso degli indicatori finanziari e prepararsi ad agire rapidamente in caso di segnali negativi.";
      } else if (type === 'realistic') {
        impactText = "Nello scenario realistico, con l'implementazione delle ottimizzazioni selezionate, si prevede un miglioramento moderato degli indicatori finanziari. La gestione del capitale circolante migliorerà, con effetti positivi sulla liquidità e sulla redditività.";
        risksText = "I rischi principali riguardano i tempi di implementazione e l'accettazione dei cambiamenti da parte dell'organizzazione. Le opportunità includono un miglioramento sostanziale dell'efficienza operativa e della redditività.";
        successText = "La probabilità di successo è elevata, assumendo un'implementazione metodica delle ottimizzazioni e un monitoraggio costante dei progressi.";
        recommendText = "Si raccomanda di adottare un approccio graduale all'implementazione, con formazione adeguata del personale e monitoraggio costante dei risultati, apportando aggiustamenti quando necessario.";
        timelineText = "L'implementazione dovrebbe avvenire in un periodo di 6-12 mesi, con revisioni trimestrali per valutare i progressi e apportare eventuali correzioni.";
      } else { // optimistic
        impactText = "Nello scenario ottimistico, con un'implementazione particolarmente efficace delle ottimizzazioni, si prevede un miglioramento significativo di tutti gli indicatori finanziari chiave, con un impatto molto positivo sulla redditività e sulla struttura finanziaria.";
        risksText = "Il rischio principale è creare aspettative troppo elevate. Le opportunità includono un significativo miglioramento della posizione competitiva dell'azienda e un aumento sostanziale del valore per gli stakeholder.";
        successText = "La probabilità di realizzare pienamente questo scenario è moderata, ma può aumentare con un forte impegno organizzativo, risorse adeguate e condizioni di mercato favorevoli.";
        recommendText = "Si raccomanda di investire adeguatamente nelle risorse necessarie per l'implementazione, formare e motivare il personale, e monitorare attentamente i progressi con KPI chiari.";
        timelineText = "Questo scenario richiede un'implementazione ben pianificata su 12-18 mesi, con revisioni frequenti e possibili aggiustamenti strategici per massimizzare i risultati.";
      }
      
      return {
        impact: impactText,
        risksAndOpportunities: risksText,
        successProbability: successText,
        recommendations: recommendText,
        timeline: timelineText,
        fullAnalysis: `ANALISI SCENARIO ${type.toUpperCase()}:\n\n1. Valutazione impatto: ${impactText}\n\n2. Rischi e opportunità: ${risksText}\n\n3. Probabilità di successo: ${successText}\n\n4. Raccomandazioni: ${recommendText}\n\n5. Timeline: ${timelineText}`
      };
    };
    
    updatedScenarios.pessimistic.analysis = createBasicAnalysis(scenarios.pessimistic, 'pessimistic');
    updatedScenarios.realistic.analysis = createBasicAnalysis(scenarios.realistic, 'realistic');
    updatedScenarios.optimistic.analysis = createBasicAnalysis(scenarios.optimistic, 'optimistic');
    
    return updatedScenarios;
  }
}

module.exports = ScenarioGenerationAgent;