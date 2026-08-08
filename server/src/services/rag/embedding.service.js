import { ai } from '../../config/gemini.js';

export const generateEmbedding = async (text) => {
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
  });

  return response.embedding.values;
};