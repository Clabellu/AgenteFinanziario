// src/services/FinancialCalculationService.js
class FinancialCalculationService {
    // Calcola metriche derivate dagli indicatori base
    calculateDerivedMetrics(indicators) {
      const metrics = { ...indicators };
      
      // Calcolo sostenibilità del debito
      if (metrics.debitiTotaliEbitda && metrics.ebitda) {
        metrics.debtoRepaymentYears = metrics.debitiTotaliEbitda;
        metrics.debtSustainability = metrics.debtoRepaymentYears < 5 ? 'Sostenibile' : 
                                     metrics.debtoRepaymentYears < 7 ? 'Moderato' : 'Critico';
      }
      
      // Calcolo equilibrio finanziario
      if (metrics.indiceCapitalizzazione && metrics.liquiditaCorrente) {
        metrics.financialBalance = 
          (metrics.indiceCapitalizzazione > 25 && metrics.liquiditaCorrente > 120) ? 'Buono' :
          (metrics.indiceCapitalizzazione > 15 && metrics.liquiditaCorrente > 100) ? 'Adeguato' : 'Debole';
      }
      
      // Calcolo salute finanziaria complessiva
      let healthFactors = 0;
      let totalFactors = 0;
      
      if (metrics.liquiditaCorrente) {
        healthFactors += metrics.liquiditaCorrente > 150 ? 1 : 0;
        totalFactors += 1;
      }
      
      if (metrics.indiceCapitalizzazione) {
        healthFactors += metrics.indiceCapitalizzazione > 30 ? 1 : 0;
        totalFactors += 1;
      }
      
      if (metrics.redditCapitaleInvestito) {
        healthFactors += metrics.redditCapitaleInvestito > 10 ? 1 : 0;
        totalFactors += 1;
      }
      
      if (metrics.debitiTotaliEbitda) {
        healthFactors += metrics.debitiTotaliEbitda < 4 ? 1 : 0;
        totalFactors += 1;
      }
      
      if (metrics.emScore) {
        healthFactors += metrics.emScore > 3 ? 1 : 0;
        totalFactors += 1;
      }
      
      if (totalFactors > 0) {
        const healthScore = (healthFactors / totalFactors) * 100;
        metrics.overallHealthScore = healthScore;
        metrics.overallHealthStatus = 
          healthScore >= 80 ? 'Eccellente' :
          healthScore >= 60 ? 'Buono' :
          healthScore >= 40 ? 'Adeguato' :
          healthScore >= 20 ? 'Problematico' : 'Critico';
      }
      
      return metrics;
    }
    
    // Simulazione scenari con ottimizzazioni
    simulateScenario(baseIndicators, optimizations, options = {}) {
      const simulatedIndicators = { ...baseIndicators };
      const impactMultiplier = options.impactMultiplier || 1.0;
      
      // Mappatura degli impatti per categoria
      const impactMapping = {
        'liquidità': {
          indicators: ['liquiditaCorrente', 'liquiditaSecca', 'capitaleCircolanteNetto', 'margineTesoreria'],
          factors: {
            'Alto': 1.25 * impactMultiplier,
            'Medio': 1.15 * impactMultiplier,
            'Basso': 1.05 * impactMultiplier
          }
        },
        'redditività': {
          indicators: ['ebitda', 'redditCapitaleInvestito', 'redditCapitaleProprio'],
          factors: {
            'Alto': 1.3 * impactMultiplier,
            'Medio': 1.15 * impactMultiplier,
            'Basso': 1.05 * impactMultiplier
          }
        },
        'struttura': {
          indicators: ['indiceCapitalizzazione', 'patrimonioNettoTangCap', 'margineStruttura'],
          factors: {
            'Alto': 1.2 * impactMultiplier,
            'Medio': 1.1 * impactMultiplier,
            'Basso': 1.05 * impactMultiplier
          }
        },
        'indebitamento': {
          indicators: ['posizioneFinanziariaNetta', 'leverage', 'debitiTotaliEbitda', 'pfnPn'],
          factors: {
            'Alto': 0.7 * impactMultiplier, // Riduzione del debito
            'Medio': 0.85 * impactMultiplier,
            'Basso': 0.95 * impactMultiplier
          },
          isReduction: true // Indica che per questi indicatori un valore più basso è migliore
        },
      };
      
      // Applica l'effetto di ogni ottimizzazione selezionata
      optimizations.forEach(opt => {
        if (opt.selected) {
          const category = opt.category.toLowerCase();
          const mapping = impactMapping[category];
          
          if (mapping) {
            const factor = mapping.factors[opt.impact] || 1.0;
            const isReduction = mapping.isReduction || false;
            
            mapping.indicators.forEach(indicator => {
              if (simulatedIndicators[indicator] !== undefined) {
                if (isReduction) {
                  // Per indicatori come debito dove la riduzione è positiva
                  simulatedIndicators[indicator] *= factor;
                } else {
                  // Per indicatori dove l'aumento è positivo
                  simulatedIndicators[indicator] *= (2 - factor);
                }
              }
            });
          }
          
          // Effetti speciali per ottimizzazioni specifiche
          if (opt.title.toLowerCase().includes('capitale circolante')) {
            if (simulatedIndicators.capitaleCircolanteNettoOperativo) {
              simulatedIndicators.capitaleCircolanteNettoOperativo *= 1.2 * impactMultiplier;
            }
          }
          
          if (opt.title.toLowerCase().includes('costo del lavoro') || 
              opt.title.toLowerCase().includes('costi operativi')) {
            if (simulatedIndicators.ebitda) {
              simulatedIndicators.ebitda *= 1.15 * impactMultiplier;
            }
          }
        }
      });
      
      // Ricalcola le metriche derivate
      return this.calculateDerivedMetrics(simulatedIndicators);
    }
  }
  
  module.exports = FinancialCalculationService;