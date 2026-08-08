// scripts/checkModels.js
import { ai } from '../src/config/gemini.js';

async function checkAllModels() {
  try {
    console.log('Querying Gemini Model Registry...\n');
    const response = await ai.models.list();

    console.log('--- ALL AVAILABLE MODELS ---');
    for await (const model of response) {
      console.log(`ID: ${model.name}`);
    }
  } catch (err) {
    console.error('Failed to list models:', err.message || err);
  }
}

checkAllModels();