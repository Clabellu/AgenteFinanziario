// Modello per gli scenari finanziari
class Scenario {
    constructor(name, description, optimizations = [], projections = {}) {
      this.name = name;
      this.description = description;
      this.optimizations = optimizations;
      this.projections = projections;
      this.riskLevel = '';
      this.potentialBenefits = '';
      this.implementationChallenges = '';
    }
    
    // Calcola l'impatto totale delle ottimizzazioni
    calculateTotalImpact() {
      // Logica per calcolare l'impatto cumulativo
      const impacts = { 'Alto': 3, 'Medio': 2, 'Basso': 1 };
      
      return this.optimizations.reduce((sum, opt) => sum + impacts[opt.impact], 0);
    }
  }
  
  module.exports = { Scenario };