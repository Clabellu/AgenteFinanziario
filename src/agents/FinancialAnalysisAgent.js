const indicators = require('../models/FinancialIndicators');

class FinancialAnalysisAgent {
  constructor(aiService, calculationService) {
    this.aiService = aiService;
    this.calculationService = calculationService;
  }
  
  async analyze(indicatorValues) {
    // Calcola metriche derivate
    const enhancedIndicators = this.calculationService.calculateDerivedMetrics(indicatorValues);
    
    // Prepara i dati per l'analisi
    const formattedIndicators = this._formatIndicatorsForAnalysis(enhancedIndicators);
    
    // Genera il prompt per l'AI
    const prompt = this._generateAnalysisPrompt(formattedIndicators);
    
    // Ottieni l'analisi dall'AI
    const analysis = await this.aiService.generateCompletion(prompt, {
      systemPrompt: "Sei un esperto analista finanziario. Fornisci una valutazione dettagliata e consigli pratici basati sugli indicatori finanziari forniti."
    });
    
    return {
      rawIndicators: indicatorValues,
      enhancedIndicators: enhancedIndicators,
      analysis: analysis
    };
  }
  
  _formatIndicatorsForAnalysis(values) {
    return Object.entries(indicators).map(([key, indicator]) => {
      if (values[key] !== undefined) {
        return {
          ...indicator,
          value: values[key],
          formattedValue: `${values[key]} ${indicator.unit}`
        };
      }
      return null;
    }).filter(Boolean);
  }
  
  _generateAnalysisPrompt(formattedIndicators) {
    // Raggruppa indicatori per categoria
    const categorizedIndicators = formattedIndicators.reduce((acc, indicator) => {
      if (!acc[indicator.category]) {
        acc[indicator.category] = [];
      }
      acc[indicator.category].push(indicator);
      return acc;
    }, {});
    
    // Genera il prompt con indicatori raggruppati
    let prompt = "Analizza i seguenti indicatori finanziari e fornisci una valutazione approfondita dello stato di salute dell'azienda:\n\n";
    
    for (const [category, indicators] of Object.entries(categorizedIndicators)) {
      prompt += `## ${category.toUpperCase()}\n`;
      for (const indicator of indicators) {
        prompt += `${indicator.name}: ${indicator.formattedValue}\n`;
      }
      prompt += "\n";
    }
    
    prompt += `
    Fornisci un'analisi strutturata che includa:
    1. Valutazione generale dello stato di salute finanziaria
    2. Analisi dettagliata di ciascuna area (struttura, liquidità, redditività, sostenibilità del debito)
    3. Identificazione di 3-5 punti di forza principali
    4. Identificazione di 3-5 criticità o aree di miglioramento
    5. Valutazione del rischio finanziario complessivo
    
    Formatta la risposta in modo strutturato con sezioni chiaramente identificabili.
    `;
    
    return prompt;
  }
}

module.exports = FinancialAnalysisAgent;