class ReportAgent {
    constructor(aiService) {
      this.aiService = aiService;
    }
    
    async generateReport(financialAnalysis, optimizations, validationResult, scenarios) {
      // Genera un report completo con tutte le analisi
      const reportSections = {
        executive: await this._generateExecutiveSummary(financialAnalysis, scenarios),
        financial: this._formatFinancialAnalysis(financialAnalysis),
        optimizations: this._formatOptimizations(optimizations, validationResult),
        scenarios: this._formatScenarios(scenarios),
        recommendations: await this._generateRecommendations(scenarios, optimizations),
        implementation: await this._generateImplementationPlan(scenarios.realistic, optimizations)
      };
      
      // Combina tutte le sezioni in un report completo
      return {
        title: "Report di Analisi Finanziaria e Scenari di Ottimizzazione",
        date: new Date().toISOString().split('T')[0],
        sections: reportSections,
        fullText: this._combineReportSections(reportSections)
      };
    }
    
    async _generateExecutiveSummary(financialAnalysis, scenarios) {
      const prompt = `
      Crea un executive summary conciso (massimo 300 parole) di un'analisi finanziaria aziendale.
      
      L'analisi ha identificato il seguente stato di salute finanziaria:
      ${financialAnalysis.analysis.substring(0, 500)}...
      
      Sono stati sviluppati tre scenari: base (senza cambiamenti), realistico e ottimistico.
      Lo scenario realistico prevede miglioramenti in: ${Object.keys(scenarios.realistic.projections).join(', ')}
      
      L'executive summary deve:
      1. Sintetizzare lo stato attuale
      2. Evidenziare le principali opportunità di miglioramento
      3. Descrivere brevemente il potenziale impatto degli interventi
      4. Fornire indicazioni chiare su quali dovrebbero essere le prossime azioni
      
      Usa un tono professionale ma diretto, adatto per decisori aziendali.
      `;
      
      return await this.aiService.generateCompletion(prompt, {
        systemPrompt: "Sei un consulente finanziario senior specializzato nella comunicazione efficace con i decisori aziendali."
      });
    }
    
    _formatFinancialAnalysis(financialAnalysis) {
      // Struttura l'analisi finanziaria in un formato adatto al report
      return {
        overview: this._extractSection(financialAnalysis.analysis, /stato di salute|panoramica|overview/i, /analisi dettagliata|punti di forza/i),
        strengths: this._extractSection(financialAnalysis.analysis, /punti di forza|strengths/i, /criticità|aree di miglioramento|debolezze/i),
        weaknesses: this._extractSection(financialAnalysis.analysis, /criticità|aree di miglioramento|debolezze/i, /valutazione del rischio|conclusioni/i),
        riskAssessment: this._extractSection(financialAnalysis.analysis, /valutazione del rischio|risk assessment/i, /conclusioni|$/)
      };
    }
    
    _formatOptimizations(optimizations, validationResult) {
      // Formatta le ottimizzazioni per il report
      const selectedOptimizations = optimizations.filter(opt => opt.selected);
      
      return {
        selected: selectedOptimizations.map(opt => ({
          title: opt.title,
          description: opt.description,
          impact: opt.impact,
          timeframe: opt.timeframe,
          category: opt.category
        })),
        validation: {
          overallRating: validationResult.overallRating,
          points: validationResult.evaluationPoints,
          uncoveredAreas: validationResult.uncoveredAreas,
          suggestions: validationResult.suggestions
        }
      };
    }
    
    _formatScenarios(scenarios) {
      // Formatta gli scenari per il report
      return {
        base: {
          name: scenarios.base.name,
          description: scenarios.base.description,
          keyMetrics: this._extractKeyMetrics(scenarios.base.projections),
          analysis: scenarios.base.analysis
        },
        realistic: {
          name: scenarios.realistic.name,
          description: scenarios.realistic.description,
          keyMetrics: this._extractKeyMetrics(scenarios.realistic.projections),
          analysis: scenarios.realistic.analysis,
          optimizations: scenarios.realistic.optimizations.map(opt => opt.title)
        },
        optimistic: {
          name: scenarios.optimistic.name,
          description: scenarios.optimistic.description,
          keyMetrics: this._extractKeyMetrics(scenarios.optimistic.projections),
          analysis: scenarios.optimistic.analysis,
          optimizations: scenarios.optimistic.optimizations.map(opt => opt.title)
        },
        comparison: scenarios.comparison
      };
    }
    
    async _generateRecommendations(scenarios, optimizations) {
      const selectedOptimizations = optimizations.filter(opt => opt.selected);
      
      const prompt = `
      Basandoti sui seguenti scenari e ottimizzazioni selezionate, formula raccomandazioni strategiche concrete:
      
      OTTIMIZZAZIONI SELEZIONATE:
      ${selectedOptimizations.map(opt => `- ${opt.title} (${opt.impact}, ${opt.timeframe})`).join('\n')}
      
      ANALISI SCENARIO REALISTICO:
      ${scenarios.realistic.analysis ? scenarios.realistic.analysis.fullAnalysis : 'Non disponibile'}
      
      CONFRONTO TRA SCENARI:
      ${scenarios.comparison || 'Non disponibile'}
      
      Genera 5-7 raccomandazioni strategiche concrete che l'azienda dovrebbe implementare. 
      Per ciascuna raccomandazione, indica:
      1. Titolo della raccomandazione
      2. Descrizione dettagliata
      3. Priorità (Alta, Media, Bassa)
      4. Benefici attesi
      5. Rischi potenziali
      
      Organizza le raccomandazioni in ordine di priorità.
      `;
      
      const recommendationsText = await this.aiService.generateCompletion(prompt, {
        systemPrompt: "Sei un consulente strategico finanziario esperto in trasformazioni aziendali."
      });
      
      return recommendationsText;
    }
    
    async _generateImplementationPlan(realisticScenario, optimizations) {
      const selectedOptimizations = optimizations.filter(opt => opt.selected);
      
      const prompt = `
      Crea un piano di implementazione per le seguenti ottimizzazioni:
      
      ${selectedOptimizations.map((opt, idx) => 
        `${idx+1}. ${opt.title} (Impatto: ${opt.impact}, Difficoltà: ${opt.difficulty}, Timeframe: ${opt.timeframe})`
      ).join('\n')}
      
      Il piano deve includere:
      1. Una sequenza logica di implementazione
      2. Timeline di attuazione (con milestones)
      3. Risorse necessarie
      4. KPI per monitorare il successo
      5. Potenziali ostacoli e strategie di mitigazione
      
      Organizza il piano in fasi chiare, considerando le interdipendenze tra le ottimizzazioni.
      `;
      
      return await this.aiService.generateCompletion(prompt, {
        systemPrompt: "Sei un project manager specializzato nell'implementazione di trasformazioni finanziarie aziendali."
      });
    }
    
    _extractKeyMetrics(projections) {
      // Estrai le metriche chiave dai dati delle proiezioni
      const keyMetricNames = [
        'ebitda', 'redditCapitaleInvestito', 'redditCapitaleProprio',
        'liquiditaCorrente', 'indiceCapitalizzazione', 'debitiTotaliEbitda'
      ];
      
      return Object.fromEntries(
        Object.entries(projections)
          .filter(([key]) => keyMetricNames.includes(key))
      );
    }
    
    _extractSection(text, startRegex, endRegex) {
      const startMatch = text.match(startRegex);
      if (!startMatch) return '';
      
      const startIdx = startMatch.index;
      const endMatch = text.match(endRegex);
      const endIdx = endMatch ? endMatch.index : text.length;
      
      return text.substring(startIdx, endIdx).trim();
    }
    
    _combineReportSections(sections) {
      let fullText = `# ${sections.title}\n\n`;
      
      fullText += `## Executive Summary\n\n${sections.executive}\n\n`;
      
      fullText += `## Analisi Finanziaria\n\n`;
      fullText += `### Panoramica\n\n${sections.financial.overview}\n\n`;
      fullText += `### Punti di Forza\n\n${sections.financial.strengths}\n\n`;
      fullText += `### Criticità\n\n${sections.financial.weaknesses}\n\n`;
      fullText += `### Valutazione del Rischio\n\n${sections.financial.riskAssessment}\n\n`;
      
      fullText += `## Ottimizzazioni Selezionate\n\n`;
      sections.optimizations.selected.forEach((opt, idx) => {
        fullText += `### ${idx+1}. ${opt.title}\n\n`;
        fullText += `**Categoria**: ${opt.category}\n`;
        fullText += `**Impatto**: ${opt.impact}\n`;
        fullText += `**Timeframe**: ${opt.timeframe}\n\n`;
        fullText += `${opt.description}\n\n`;
      });
      
      fullText += `## Scenari\n\n`;
      fullText += `### Scenario Base\n\n${sections.scenarios.base.analysis.fullAnalysis || 'Non disponibile'}\n\n`;
      fullText += `### Scenario Realistico\n\n${sections.scenarios.realistic.analysis.fullAnalysis || 'Non disponibile'}\n\n`;
      fullText += `### Scenario Ottimistico\n\n${sections.scenarios.optimistic.analysis.fullAnalysis || 'Non disponibile'}\n\n`;
      fullText += `### Confronto tra Scenari\n\n${sections.scenarios.comparison}\n\n`;
      
      fullText += `## Raccomandazioni\n\n${sections.recommendations}\n\n`;
      
      fullText += `## Piano di Implementazione\n\n${sections.implementation}\n\n`;
      
      return fullText;
    }
  }
  
  module.exports = ReportAgent;