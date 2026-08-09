import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
const AI_MODE = (process.env.AI_MODE || "real").toLowerCase();

const openai = new OpenAI({
  apiKey: API_KEY || "dummy_key",
});

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
 * Generates vector embeddings for curriculum documents and queries using OpenAI.
 * @param {string} text - Input query string.
 * @returns {Promise<number[]>} Vector array.
 */
export async function generateEmbedding(text) {
  if (AI_MODE === 'mock' && !API_KEY) {
    return new Array(768).fill(0.01);
  }

  if (!API_KEY) {
    throw new Error('OPENAI_API_KEY is missing from environment variables.');
  }

  const modelName = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

  return callWithRetry(async () => {
    const response = await openai.embeddings.create({
      model: modelName,
      input: text,
      dimensions: 768, // Forces OpenAI to output 768 dimensions to match your MongoDB database index
    });

    const values = response?.data?.[0]?.embedding;

    if (!values) {
      throw new Error(`[Embedding API] Could not parse vector values from OpenAI response for model '${modelName}'.`);
    }

    return values;
  });
}