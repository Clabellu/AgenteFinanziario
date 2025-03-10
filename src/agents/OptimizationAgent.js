const { Optimization } = require('../models/OptimizationModel');

class OptimizationAgent {
  constructor(aiService) {
    this.aiService = aiService;
  }
  
  async generateOptimizations(financialAnalysis) {
    const prompt = this._generateOptimizationPrompt(financialAnalysis);
    
    try {
      // Genera ottimizzazioni con AI
      const optimizationsText = await this.aiService.generateCompletion(prompt, {
        systemPrompt: "Sei un consulente finanziario esperto in ottimizzazione aziendale. Basandoti sull'analisi finanziaria, identifica opportunità concrete di miglioramento."
      });
      
      // Estrai e struttura le ottimizzazioni
      const optimizations = this._parseOptimizations(optimizationsText);
      
      return optimizations;
    } catch (error) {
      console.error("Errore nella generazione delle ottimizzazioni:", error);
      throw new Error("Impossibile generare ottimizzazioni: " + error.message);
    }
  }
  
  _generateOptimizationPrompt(financialAnalysis) {
    return `
    Basandoti sulla seguente analisi finanziaria:
    
    ${financialAnalysis.analysis}
    
    Identifica 8-10 potenziali ottimizzazioni concrete che l'azienda potrebbe implementare.
    
    Per ciascuna ottimizzazione, fornisci le seguenti informazioni nel formato JSON:
    
    [
      {
        "title": "Titolo conciso dell'ottimizzazione",
        "description": "Descrizione dettagliata dell'intervento proposto",
        "impact": "Alto|Medio|Basso", 
        "difficulty": "Alta|Media|Bassa",
        "timeframe": "Breve|Medio|Lungo",
        "category": "liquidità|redditività|struttura|indebitamento|efficienza|operatività"
      },
      ...
    ]
    
    Le ottimizzazioni devono essere specifiche, praticabili e direttamente correlate ai problemi o opportunità identificati nell'analisi.
    `;
  }
  
  _parseOptimizations(optimizationsText) {
    try {
      // Cerca di estrarre solo la parte JSON dalla risposta
      const jsonMatch = optimizationsText.match(/\[\s*\{.*\}\s*\]/s);
      const jsonText = jsonMatch ? jsonMatch[0] : optimizationsText;
      
      // Converti da stringa JSON a oggetti
      const optimizationsData = JSON.parse(jsonText);
      
      // Crea istanze del modello Optimization
      return optimizationsData.map((opt, index) => 
        new Optimization(
          `opt_${index + 1}`,
          opt.title,
          opt.description,
          opt.impact,
          opt.difficulty,
          opt.timeframe,
          opt.category
        )
      );
    } catch (error) {
      console.error("Errore nel parsing delle ottimizzazioni:", error);
      // Fallback: estrazione testuale
      return this._extractOptimizationsFromText(optimizationsText);
    }
  }
  
  _extractOptimizationsFromText(text) {
    // Logica di fallback per estrarre ottimizzazioni da testo non-JSON
    const optimizations = [];
    const lines = text.split('\n');
    
    let currentOpt = null;
    
    for (const line of lines) {
      if (line.match(/^\d+\.\s+.+/) || line.match(/^Ottimizzazione \d+:/)) {
        // Nuova ottimizzazione trovata
        if (currentOpt) {
          optimizations.push(currentOpt);
        }
        
        const title = line.replace(/^\d+\.\s+/, '').replace(/^Ottimizzazione \d+:\s*/, '');
        currentOpt = new Optimization(
          `opt_${optimizations.length + 1}`,
          title,
          '',
          'Medio', // Valori di default
          'Media',
          'Medio',
          'generale'
        );
      } else if (currentOpt && line.includes('Impatto:')) {
        currentOpt.impact = line.includes('Alto') ? 'Alto' : 
                            line.includes('Basso') ? 'Basso' : 'Medio';
      } else if (currentOpt && line.includes('Difficoltà:')) {
        currentOpt.difficulty = line.includes('Alta') ? 'Alta' : 
                                line.includes('Bassa') ? 'Bassa' : 'Media';
      } else if (currentOpt && line.includes('Timeframe:')) {
        currentOpt.timeframe = line.includes('Breve') ? 'Breve' : 
                               line.includes('Lungo') ? 'Lungo' : 'Medio';
      } else if (currentOpt && line.includes('Categoria:')) {
        currentOpt.category = line.split(':')[1]?.trim().toLowerCase() || 'generale';
      } else if (currentOpt && line.trim()) {
        // Aggiungi alla descrizione
        currentOpt.description += line.trim() + ' ';
      }
    }
    
    // Aggiungi l'ultima ottimizzazione
    if (currentOpt) {
      optimizations.push(currentOpt);
    }
    
    return optimizations;
  }
}

module.exports = OptimizationAgent;