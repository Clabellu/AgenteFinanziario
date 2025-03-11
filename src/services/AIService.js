const { OpenAI } = require('openai');
const config = require('../config/aiConfig');

class AIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.defaultModel = config.model || 'gpt-4';
  }
  
  async generateCompletion(prompt, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || this.defaultModel,
        messages: [
          { role: "system", content: options.systemPrompt || "Sei un esperto analista finanziario." },
          { role: "user", content: prompt }
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 2000
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Errore nella chiamata OpenAI:", error);
      throw new Error(`Generazione AI fallita: ${error.message}`);
    }
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


}


module.exports = AIService; 