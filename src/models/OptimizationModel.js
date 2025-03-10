// Modello per le ottimizzazioni finanziarie
class Optimization {
    constructor(id, title, description, impact, difficulty, timeframe, category) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.impact = impact; // Alto, Medio, Basso
      this.difficulty = difficulty; // Alta, Media, Bassa
      this.timeframe = timeframe; // Breve, Medio, Lungo termine
      this.category = category;
      this.selected = false;
    }
    
    // Calcola un punteggio di priorità
    calculatePriorityScore() {
      const impactScore = { 'Alto': 3, 'Medio': 2, 'Basso': 1 };
      const difficultyScore = { 'Bassa': 3, 'Media': 2, 'Alta': 1 };
      const timeframeScore = { 'Breve': 3, 'Medio': 2, 'Lungo': 1 };
      
      return (impactScore[this.impact] * 2) + difficultyScore[this.difficulty] + timeframeScore[this.timeframe];
    }
  }
  
  module.exports = { Optimization };