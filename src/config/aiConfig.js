require('dotenv').config();

module.exports = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.AI_MODEL || 'gpt-4',
  temperature: 0.3,
  maxTokens: 2000
};