import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().url().or(z.string().min(1, "MONGO_URI is required")),
  
  // Replace Gemini validation with OpenAI validation
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_MODEL: z.string().default('gpt-4o'), // Or your preferred model like 'gpt-4o-mini'
  
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info')
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment configuration:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;