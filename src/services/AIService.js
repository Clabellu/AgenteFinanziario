const { OpenAI } = require('openai');
const config = require('../config/aiConfig');

class AIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.defaultModel = config.model || 'gpt-4';
    this.conversation = new Map();
  }
  
  /**
   * Inizializza una nuova conversazione con il contesto del report
   * @param {Object}   
   * @returns {string}
   */
  async initReoportConversation(reportData) {
    try {
      // Genera un ID univoco per la conversazione
      const conversationId = `conv_${Date.now()}`;

      // Crea un messaggio di sistema con il contesto completo
      const systemMessage = {
        role: "system", 
        content: `Sei un assistente finanziario esperto che risponde a domande basate sul seguente report finanziario.
        il report contiene analisi finanziaria, ottimizzazioni suggerite, scenari e raccomandazioni.
        Tutte le sezioni sono interdipendenti. Considera sempre il contesto completo nelle tue risposte.

        REPORT COMPLETO:
        ${JSON.stringify(reportData, null, 2)}

        Rispondi alle domande dell'utente in modo chiaro basandoti sulle informazioni contenute nel report.`
      };

      // Memorizza la conversazione
      this.conversation.set(conversationId, {
        messages: [systemMessage],
        reportData: reportData,
      });

      console.log(`Inizializzata nuova conversazione: ${conversationId}`);
      return conversationId;
    } catch (error) {
      console.error("Errore nell'inizializzazione della conversazione:", error);
      throw new Error(`Inizializzazione della conversazione fallita: ${error.message}`);
    }
  }

  /**
   * Continua una conversazione esistente con una nuova domanda
   * @param {string} conversationId ID della conversazione
   * @param {string} question Domanda dell'utente
   * @returns {string} Risposta dell'AI 
  */
  async sendReportQuestion(conversationId, question) {
    try {
      // Verifica se la conversazione esiste
      if (!this.conversation.has(conversationId)) {
        throw new Error(`Conversazione non trovata`);
      }
      const conversation = this.conversation.get(conversationId);

      // Aggiungi la domanda dell'utente alla conversazione
      conversation.messages.push({
        role: "user",
        content: question,
      });

      console.log(`Invio domanda alla conversazione ${conversationId}:`, question);

      // Invia la conversazione all'API OpenAI
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: conversation.messages,
        temperature: 0.3,
      });

      // Estrai la risposta
      const answer = response.choices[0].message.content;

      // Aggiungi la risposta alla conversazione
      conversation.messages.push({
        role: "assistant",
        content: answer,
      });

      // Aggiorna la conversazione nella mappa
      this.conversation.set(conversationId, conversation);

      console.log(`Risposta ricevuta per la conversazione ${conversationId}:`);
      return answer;
    } catch (error) {
      console.error("Errore nell'invio della domanda:", error);
      throw new Error(`Errore nell'invio della domanda: ${error.message}`);
    }
  }

  /**
   * Elimina una conversazione 
   * @param {string} conversationId ID della conversazione
   */
  deleteConversation(conversationId) {
    if (this.conversation.has(conversationId)) {
      this.conversation.delete(conversationId);
      console.log(`Conversazione ${conversationId} eliminata.`);
      return true;
    }
    return false;
  }

  // Per conversazioni multi-turno
  async generateChat(messages, options = {}) {
    try {
      const systemMessage = { 
        role: "system", 
        content: options.systemPrompt || "Sei un esperto analista finanziario."
      };
      
      const allMessages = [systemMessage, ...messages];
      
      const response = await this.client.chat.completions.create({
        model: options.model || this.defaultModel,
        messages: allMessages,
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 2000
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Errore nella chat OpenAI:", error);
      throw new Error(`Chat AI fallita: ${error.message}`);
    }
  }

  // src/services/AIService.js

// Lascia invariato il costruttore e il metodo generateChat

// Aggiungere questo nuovo metodo dopo i metodi esistenti
async generateCompletionWithRetry(prompt, options = {}, maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativo ${attempt}/${maxRetries} di chiamata OpenAI con modello:`, 
                 options.model || this.defaultModel);
      
      const response = await this.client.chat.completions.create({
        model: options.model || this.defaultModel,
        messages: [
          { role: "system", content: options.systemPrompt || "Sei un esperto analista finanziario." },
          { role: "user", content: prompt }
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 3000
      });
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error("Risposta AI senza scelte valide");
      }
      
      const resultado = response.choices[0].message.content;
      console.log(`Risposta OpenAI ricevuta correttamente al tentativo ${attempt}, lunghezza:`, resultado.length);
      return resultado;
      
    } catch (error) {
      lastError = error;
      
      // Se è l'ultimo tentativo, non attendere
      if (attempt === maxRetries) break;
      
      // Calcolo del tempo di attesa con backoff esponenziale
      // Base 2 secondi, con jitter casuale per evitare richieste sincronizzate
      const baseDelay = 2000; // 2 secondi di base
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1); // 2s, 4s, 8s, 16s, ...
      const jitter = Math.random() * 1000; // Aggiunge fino a 1 secondo casuale
      const delay = exponentialDelay + jitter;
      
      console.error(`Errore tentativo ${attempt}:`, error.message);
      console.log(`Nuovo tentativo tra ${Math.round(delay/1000)} secondi...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error("Tutti i tentativi di chiamata OpenAI falliti:", lastError);
  
  if (options.throwOnError) {
    throw new Error(`Generazione AI fallita dopo ${maxRetries} tentativi: ${lastError.message}`);
  }
  
  // Risposta di fallback
  return `Analisi finanziaria generica basata sui dati forniti:\n\n
    L'azienda mostra indicatori che richiedono un'analisi approfondita. 
    I principali punti da considerare sono la liquidità, la struttura del capitale
    e la redditività. Si consiglia di verificare in particolare il rapporto
    debito/EBITDA e la posizione finanziaria netta.\n\n
    [Nota: Questa è un'analisi generica generata in seguito a un errore di comunicazione
    con il servizio AI dopo ${maxRetries} tentativi. Errore: ${lastError.message}]`;
}

// Modificare il metodo generateCompletion esistente per usare il nuovo metodo
async generateCompletion(prompt, options = {}) {
  try {
    return await this.generateCompletionWithRetry(prompt, options, 3);
  } catch (error) {
    console.error("Errore dettagliato nella chiamata OpenAI:", error);

    if (options.throwOnError) {
      throw new Error(`Generazione AI fallita: ${error.message}`);
    }
    
    // Fallback esistente
    return `Analisi finanziaria generica basata sui dati forniti:\n\n
      L'azienda mostra indicatori che richiedono un'analisi approfondita. 
      I principali punti da considerare sono la liquidità, la struttura del capitale
      e la redditività. Si consiglia di verificare in particolare il rapporto
      debito/EBITDA e la posizione finanziaria netta.\n\n
      [Nota: Questa è un'analisi generica generata in seguito a un errore di comunicazione
      con il servizio AI. Errore: ${error.message}]`;
  }
}
}

  


module.exports = AIService; 