import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

logger.info({ model: env.GEMINI_MODEL }, 'Google GenAI SDK initialized');

export { ai, env };