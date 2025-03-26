require('dotenv').config();

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error('ERRORE CRITICO: API key OpenAI non configurata!');
}

module.exports = {
  apiKey: API_KEY,
  model: process.env.AI_MODEL || 'gpt-4',
  temperature: 0.3,
  maxTokens: 3000
};