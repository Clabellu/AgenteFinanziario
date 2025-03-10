// src/utils/promptTemplates.js

const financialAnalysisTemplate = (indicators) => `
Analizza i seguenti indicatori finanziari e fornisci una valutazione approfondita dello stato di salute dell'azienda:

${formatIndicators(indicators)}

Fornisci un'analisi strutturata che includa:
1. Valutazione generale dello stato di salute finanziaria
2. Analisi dettagliata di ciascuna area (struttura, liquidità, redditività, sostenibilità del debito)
3. Identificazione di 3-5 punti di forza principali
4. Identificazione di 3-5 criticità o aree di miglioramento
5. Valutazione del rischio finanziario complessivo

Formatta la risposta in modo strutturato con sezioni chiaramente identificabili.
`;

const optimizationTemplate = (financialAnalysis) => `
Basandoti sulla seguente analisi finanziaria:

${financialAnalysis}

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

// Funzione helper per formattare gli indicatori
function formatIndicators(indicators) {
  const categorizedIndicators = {};
  
  // Organizza gli indicatori per categoria
  Object.entries(indicators).forEach(([key, value]) => {
    // Determina la categoria in base al nome dell'indicatore
    let category = 'Altri';
    
    if (key.includes('liquidit') || key.includes('tesoreria') || key.includes('circolante')) {
      category = 'Liquidità';
    } else if (key.includes('reddit') || key.includes('ebitda')) {
      category = 'Redditività';
    } else if (key.includes('struttura') || key.includes('immobilizz') || key.includes('capital')) {
      category = 'Struttura';
    } else if (key.includes('debit') || key.includes('pn') || key.includes('finanziaria')) {
      category = 'Indebitamento';
    } else if (key.includes('score') || key.includes('rischio')) {
      category = 'Rischio';
    }
    
    if (!categorizedIndicators[category]) {
      categorizedIndicators[category] = [];
    }
    
    categorizedIndicators[category].push({ key, value });
  });
  
  // Genera il testo formattato
  let result = '';
  
  Object.entries(categorizedIndicators).forEach(([category, items]) => {
    result += `## ${category.toUpperCase()}\n`;
    items.forEach(({ key, value }) => {
      result += `${key}: ${value}\n`;
    });
    result += '\n';
  });
  
  return result;
}

module.exports = {
  financialAnalysisTemplate,
  optimizationTemplate
};