const { OpenAI } = require('openai');
const config = require('../config/aiConfig');

class AIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.defaultModel = config.model || 'gpt-4';
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

  async generateCompletion(prompt, options = {}) {
    try {
      console.log("Chiamata OpenAI in corso con modello:", options.model || this.defaultModel);
      
      // Aggiungi un meccanismo di retry
      let attempts = 0;
      const maxAttempts = 2;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Tentativo ${attempts} di chiamata OpenAI`);
          
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
          console.log("Risposta OpenAI ricevuta correttamente, lunghezza:", resultado.length);
          return resultado;
        } catch (retryError) {
          console.error(`Errore tentativo ${attempts}:`, retryError);
          lastError = retryError;
          
          // Attendi prima di riprovare
          if (attempts < maxAttempts) {
            console.log("Attesa prima del prossimo tentativo...");
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
      
      throw lastError || new Error("Tutti i tentativi falliti");
    } catch (error) {
      console.error("Errore dettagliato nella chiamata OpenAI:", error);

      if (options.throwOnError) {
        throw new Error(`Generazione AI fallita: ${error.message}`);
      }
      
      // Genera una risposta di fallback leggibile ma che indica l'errore
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