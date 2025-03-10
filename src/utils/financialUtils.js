// src/utils/financialUtils.js

/**
 * Estrae una sezione di testo tra due pattern
 * @param {string} text - Il testo da cui estrarre
 * @param {RegExp} startRegex - Espressione regolare per l'inizio della sezione
 * @param {RegExp} endRegex - Espressione regolare per la fine della sezione
 * @returns {string} - La sezione estratta
 */
 function extractSection(text, startRegex, endRegex) {
    const startMatch = text.match(startRegex);
    if (!startMatch) return '';
    
    const startIdx = startMatch.index;
    const endMatch = endRegex ? text.match(endRegex) : null;
    const endIdx = endMatch ? endMatch.index : text.length;
    
    return text.substring(startIdx, endIdx).trim();
  }
  
  /**
   * Formatta un numero come percentuale
   * @param {number} value - Il valore da formattare
   * @param {number} decimals - Numero di decimali
   * @returns {string} - La stringa formattata
   */
  function formatPercentage(value, decimals = 2) {
    return `${Number(value).toFixed(decimals)}%`;
  }
  
  /**
   * Formatta un valore monetario
   * @param {number} value - Il valore da formattare
   * @param {string} currency - La valuta da utilizzare
   * @returns {string} - La stringa formattata
   */
  function formatCurrency(value, currency = '€') {
    return `${currency} ${Number(value).toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  
  /**
   * Calcola la variazione percentuale tra due valori
   * @param {number} current - Valore attuale
   * @param {number} previous - Valore precedente
   * @returns {number} - Variazione percentuale
   */
  function calculatePercentageChange(current, previous) {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  }
  
  module.exports = {
    extractSection,
    formatPercentage,
    formatCurrency,
    calculatePercentageChange
  };