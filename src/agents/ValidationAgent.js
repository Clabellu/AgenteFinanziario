class ValidationAgent {
    constructor(aiService) {
      this.aiService = aiService;
    }
    
    async validateSelections(financialAnalysis, allOptimizations, selectedOptimizations) {
      // Estrai solo le ottimizzazioni selezionate
      const selections = allOptimizations.filter(opt => 
        selectedOptimizations.includes(opt.id)
      );
      
      // Genera il prompt per la validazione
      const prompt = this._generateValidationPrompt(financialAnalysis, selections);
      
      // Ottieni la validazione dall'AI
      const validationResult = await this.aiService.generateCompletion(prompt, {
        systemPrompt: "Sei un esperto finanziario specializzato nella valutazione della fattibilità e coerenza di interventi di ottimizzazione aziendale.",
        temperature: 0.2
      });
      
      // Analizza e struttura il risultato
      return this._parseValidationResult(validationResult, selections);
    }
    
    _generateValidationPrompt(financialAnalysis, selections) {
      return `
      Analizza la coerenza e fattibilità delle seguenti ottimizzazioni selezionate dall'utente, 
      tenendo conto dell'analisi finanziaria dell'azienda:
      
      ANALISI FINANZIARIA:
      ${financialAnalysis.analysis}
      
      OTTIMIZZAZIONI SELEZIONATE:
      ${selections.map((opt, idx) => 
        `${idx+1}. ${opt.title}\n   Descrizione: ${opt.description}\n   Impatto: ${opt.impact}\n   Difficoltà: ${opt.difficulty}\n   Timeframe: ${opt.timeframe}\n   Categoria: ${opt.category}`
      ).join('\n\n')}
      
      Valuta se queste ottimizzazioni:
      1. Sono coerenti tra loro o presentano conflitti
      2. Sono adeguate alla situazione finanziaria dell'azienda
      3. Hanno un equilibrio adeguato tra breve, medio e lungo termine
      4. Coprono le principali aree di criticità evidenziate nell'analisi
      5. Rappresentano un mix efficace di interventi ad alto impatto e facile implementazione
      
      Per ciascuno di questi 5 punti, fornisci una valutazione (Ottimale, Adeguato, Inadeguato) e una breve spiegazione.
      
      Inoltre, identifica:
      - Possibili conflitti tra le ottimizzazioni selezionate
      - Aree critiche non affrontate dalle ottimizzazioni scelte
      - Suggerimenti per migliorare l'efficacia complessiva delle ottimizzazioni
      
      Formula la risposta in un formato strutturato.
      `;
    }
    
    _parseValidationResult(validationText, selections) {
      // Analisi base del testo per estrarre struttura
      const validationPoints = {
        coherence: this._extractValidationPoint(validationText, /coeren|conflitti/i, 1),
        adequacy: this._extractValidationPoint(validationText, /adeguat|situazione finanziaria/i, 2),
        timeBalance: this._extractValidationPoint(validationText, /equilibrio|breve.*medio.*lungo/i, 3),
        coverageCriticalAreas: this._extractValidationPoint(validationText, /cop|aree di criticità/i, 4),
        impactMix: this._extractValidationPoint(validationText, /mix|impatto.*implementazione/i, 5)
      };
      
      // Estrai conflitti, aree non coperte e suggerimenti
      const conflicts = this._extractSection(validationText, /conflitti/i, /aree critiche/i);
      const uncoveredAreas = this._extractSection(validationText, /aree critiche/i, /suggerimenti/i);
      const suggestions = this._extractSection(validationText, /suggerimenti/i, /$/);
      
      // Calcola punteggio complessivo della validazione
      const scoreMapping = { 'Ottimale': 3, 'Adeguato': 2, 'Inadeguato': 1 };
      
      const scores = Object.values(validationPoints).map(point => {
        const rating = point.rating || 'Adeguato';
        return scoreMapping[rating] || 2;
      });
      
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const overallRating = 
        averageScore > 2.5 ? 'Ottimale' : 
        averageScore > 1.5 ? 'Adeguato' : 'Inadeguato';
      
      return {
        evaluationPoints: validationPoints,
        conflicts: conflicts,
        uncoveredAreas: uncoveredAreas,
        suggestions: suggestions,
        overallRating: overallRating,
        rawValidation: validationText
      };
    }
    
    _extractValidationPoint(text, regex, pointNumber) {
      // Cerca il punto della validazione nel testo
      const pointRegex = new RegExp(`${pointNumber}[.)]\\s*([^\\n]+)`, 'i');
      const match = text.match(pointRegex);
      
      if (!match) return { rating: 'Adeguato', explanation: '' };
      
      const pointText = match[1];
      
      // Estrai rating e spiegazione
      const ratingMatch = pointText.match(/(Ottimale|Adeguato|Inadeguato)/i);
      const rating = ratingMatch ? ratingMatch[1] : 'Adeguato';
      
      // Cerca la spiegazione nelle righe successive
      const explanationRegex = new RegExp(`${pointNumber}[.)]\\s*[^\\n]*\\n+\\s*([^\\n]+)`);
      const explanationMatch = text.match(explanationRegex);
      const explanation = explanationMatch ? explanationMatch[1].trim() : '';
      
      return {
        rating: rating,
        explanation: explanation || pointText.replace(ratingMatch?.[0] || '', '').trim()
      };
    }
    
    _extractSection(text, startRegex, endRegex) {
      const startMatch = text.match(startRegex);
      if (!startMatch) return '';
      
      const startIdx = startMatch.index;
      const endMatch = text.match(endRegex);
      const endIdx = endMatch ? endMatch.index : text.length;
      
      return text.substring(startIdx, endIdx).trim();
    }
  }
  
  module.exports = ValidationAgent;