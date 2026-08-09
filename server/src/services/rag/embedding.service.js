import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const AI_MODE = process.env.AI_MODE || 'real';

/**
 * Exponential backoff wrapper for API calls hitting 429 / Quota limits.
 */
const callWithRetry = async (fn, retries = 5, delayMs = 4000) => {
  try {
    return await fn();
  } catch (error) {
    const errStr = String(error) + (error?.message || '');
    const isQuotaError =
      error?.status === 429 ||
      error?.statusCode === 429 ||
      /quota|429|resource_exhausted/i.test(errStr);

    if (isQuotaError && retries > 0) {
      console.warn(`[Embedding API] Rate limit hit. Waiting ${delayMs / 1000}s before retrying (${retries} retries left)...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return callWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
};

/**
 * Generates vector embeddings for curriculum documents and queries.
 * @param {string} text - Input query string.
 * @returns {Promise<number[]>} Vector array.
 */
export async function generateEmbedding(text) {
  if (AI_MODE === 'mock' && !API_KEY) {
    return new Array(3072).fill(0.01);
  }

  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const modelName = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';

  return callWithRetry(async () => {
    const response = await ai.models.embedContent({
      model: modelName,
      contents: text,
    });

    const values = response?.embedding?.values || response?.embeddings?.[0]?.values;

    if (!values) {
      throw new Error(`[Embedding API] Could not parse vector values from response for model '${modelName}'.`);
    }

    return values;
  });
}