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
    // Crea una tabella comparativa dettagliata degli indicatori chiave
    const comparisonsTable = this._createMetricComparisonTable(scenarios);
    
    // Prepara informazioni sulle ottimizzazioni selezionate
    const optimizationsInfo = selectedOptimizations
      .filter(opt => opt.selected)
      .map((opt, idx) => 
        `${idx+1}. ${opt.title} (Impatto: ${opt.impact}, Difficoltà: ${opt.difficulty}, Timeframe: ${opt.timeframe}, Categoria: ${opt.category})
        Descrizione: ${opt.description}`
      ).join('\n\n');
    
    const prompt = `
    Conduci un'analisi comparativa approfondita dei seguenti tre scenari finanziari basandoti su dati quantitativi concreti. Evita generalizzazioni o affermazioni non supportate da dati numerici.
    
    CONFRONTO NUMERICO DEGLI INDICATORI CHIAVE:
    ${comparisonsTable}
    
    OTTIMIZZAZIONI IMPLEMENTATE NEI MODELLI:
    ${optimizationsInfo}
    
    DETTAGLI DEGLI SCENARI:
    
    SCENARIO PESSIMISTICO:
    ${scenarios.pessimistic.description}
    ${scenarios.pessimistic.analysis ? scenarios.pessimistic.analysis.impact : ""}
    
    SCENARIO REALISTICO:
    ${scenarios.realistic.description}
    ${scenarios.realistic.analysis ? scenarios.realistic.analysis.impact : ""}
    
    SCENARIO OTTIMISTICO:
    ${scenarios.optimistic.description}
    ${scenarios.optimistic.analysis ? scenarios.optimistic.analysis.impact : ""}
    
    ANALISI RICHIESTA:
    
    1. Analisi quantitativa delle variazioni percentuali:
       - Calcola e commenta le variazioni percentuali specifiche tra gli scenari per ciascun indicatore finanziario
       - Quali indicatori mostrano le variazioni più significative e perché? Fornisci dati numerici a supporto
       - Come si manifestano queste variazioni in termini di performance finanziaria complessiva? Quantifica l'impatto
  
    2. Correlazioni tra ottimizzazioni e risultati numerici:
       - Quali ottimizzazioni specifiche hanno il maggiore impatto numerico sugli indicatori finanziari?
       - Quali combinazioni di ottimizzazioni producono effetti sinergici quantificabili?
       - Quantifica il rapporto costi-benefici delle ottimizzazioni in ciascuno scenario
  
    3. Analisi rischio-rendimento dettagliata:
       - Calcola il rapporto rischio-rendimento per ciascuno scenario utilizzando variazioni di redditività vs. stabilità finanziaria
       - Identifica soglie numeriche critiche per ciascun indicatore (punti di breakeven o livelli di allarme)
       - Quali indicatori fungono da leading indicator per prevedere lo scivolamento verso un diverso scenario?
  
    4. Analisi di sensitività:
       - Come variano i risultati finanziari al variare di specifici parametri operativi?
       - Quanto dovrebbe cambiare ciascun parametro chiave per passare da uno scenario all'altro?
       - Quali indicatori sono più sensibili all'implementazione delle ottimizzazioni e di quanto?
  
    5. Probabilità e fattori determinanti:
       - Assegna e giustifica una probabilità quantitativa a ciascuno scenario
       - Quali fattori specifici e misurabili determinano quale scenario si realizzerà?
       - Qual è il peso relativo di ciascun fattore? Fornisci percentuali approssimative
  
    6. Raccomandazioni basate su KPI specifici:
       - Identifica 5-7 KPI critici da monitorare con valori target e soglie di allarme specifici
       - Formula raccomandazioni concrete per massimizzare la probabilità dello scenario ottimistico
       - Definisci un piano di contingenza basato su trigger numerici specifici
  
    Il tuo confronto deve essere estremamente analitico e basato sui dati, con frequenti riferimenti a valori numerici, percentuali, rapporti e correlazioni. Evita completamente affermazioni generiche o non supportate da dati quantitativi. Fornisci un'analisi di almeno 800 parole che possa essere utilizzata come base per decisioni finanziarie strategiche.
    `;
    
    try {
      const comparison = await this.aiService.generateCompletion(prompt, {
        systemPrompt: "Sei un analista finanziario quantitativo con specializzazione in modellazione predittiva e analisi di scenari. La tua analisi è rigorosamente basata su dati numerici e modelli statistici. Non fai mai affermazioni qualitative senza supportarle con dati quantitativi. Hai una profonda comprensione delle correlazioni tra indicatori finanziari e sai identificare pattern non ovvi attraverso tecniche analitiche avanzate. Sei estremamente preciso nelle tue valutazioni numeriche e fornisci sempre intervalli di confidenza o margini di errore nelle tue previsioni.",
        temperature: 0.2, // Abbassato per ottenere risposte più precise e basate sui dati
        maxTokens: 3500 // Aumentato per consentire analisi più approfondite
      });
      
      return comparison;
    } catch (error) {
      console.error("Errore nella generazione della comparazione degli scenari:", error);
      return "Non è stato possibile generare un confronto dettagliato degli scenari a causa di un errore tecnico. Si consiglia di rivedere le analisi individuali degli scenari per comprendere le differenze e le implicazioni.";
    }
  }
  
  // Metodo helper per creare una tabella dettagliata di confronto tra gli indicatori nei vari scenari
  _createMetricComparisonTable(scenarios) {
    // Definisci gli indicatori chiave da confrontare
    const keyMetrics = [
      'ebitda', 'redditCapitaleInvestito', 'redditCapitaleProprio',
      'liquiditaCorrente', 'indiceCapitalizzazione', 'debitiTotaliEbitda',
      'leverage', 'capitaleCircolanteNettoOperativo', 'emScore'
    ];
    
    // Definisci se per ciascun indicatore è meglio un valore più alto o più basso
    const higherIsBetter = {
      'ebitda': true,
      'redditCapitaleInvestito': true,
      'redditCapitaleProprio': true,
      'liquiditaCorrente': true,
      'indiceCapitalizzazione': true,
      'debitiTotaliEbitda': false, // Per i rapporti di debito, valori più bassi sono migliori
      'leverage': false, // Per la leva finanziaria, valori più bassi indicano minor rischio
      'capitaleCircolanteNettoOperativo': true,
      'margineStruttura': true,
      'liquiditaSecca': true,
      'indiceAutofinanziamento': true,
      'emScore': true
    };
    
    // Crea l'intestazione della tabella
    let table = "| Indicatore | Pessimistico | Realistico | Ottimistico | Var% P vs R | Var% O vs R | Impatto |\n";
    table += "|------------|--------------|------------|--------------|------------|------------|--------|\n";
    
    // Popola la tabella con i dati
    keyMetrics.forEach(metric => {
      // Verifica che i dati dell'indicatore esistano nei vari scenari
      if (scenarios.realistic.projections[metric] !== undefined) {
        // Estrai i valori per ciascuno scenario
        const r = scenarios.realistic.projections[metric];
        const p = scenarios.pessimistic.projections[metric];
        const o = scenarios.optimistic.projections[metric];
        
        // Evita divisioni per zero
        const rAbs = Math.abs(r) < 0.000001 ? 0.000001 : Math.abs(r);
        
        // Calcola le variazioni percentuali
        const pDiff = ((p - r) / rAbs * 100).toFixed(2);
        const oDiff = ((o - r) / rAbs * 100).toFixed(2);
        
        // Determina se le variazioni sono positive o negative dal punto di vista aziendale
        const pImpact = ((pDiff > 0) === higherIsBetter[metric]) ? "Positivo" : "Negativo";
        const oImpact = ((oDiff > 0) === higherIsBetter[metric]) ? "Positivo" : "Negativo";
        
        // Formatta i valori numerici per la visualizzazione
        const pValue = typeof p === 'number' ? p.toFixed(2) : p;
        const rValue = typeof r === 'number' ? r.toFixed(2) : r;
        const oValue = typeof o === 'number' ? o.toFixed(2) : o;
        
        // Aggiungi la riga alla tabella
        table += `| ${metric} | ${pValue} | ${rValue} | ${oValue} | ${pDiff}% | ${oDiff}% | P: ${pImpact}, O: ${oImpact} |\n`;
      }
    });
    
    return table;
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
    let optimisticAnalysis = this._extractScenarioSection(analysisText, optimisticPattern, comparisonPattern);
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
  
  _extractScenarioSection(text, sectionStartPattern, sectionEndPattern) {
    const startMatch = text.match(sectionStartPattern);
    if (!startMatch) return 'Analisi non disponibile.';
    
    const startIdx = startMatch.index;

    let endIdx; 
    if (sectionEndPattern) {
      const endMatch = text.match(sectionEndPattern);
      endIdx = endMatch ? endMatch.index : undefined;
    }

    return text.substring(startIdx,endIdx).trim();
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