process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { CurriculumVector } from '../src/models/CurriculumVector.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB Atlas for full 31-day vector seeding...`);

  const rawData = fs.readFileSync(path.resolve('../server/data/curriculum.json'), 'utf-8');
  const curriculumJson = JSON.parse(rawData);
  const daysData = curriculumJson.days;

  await CurriculumVector.deleteMany({});

  for (const item of daysData) {
  try {
    const contentText = `Day ${item.day}: ${item.title}. Type: ${item.type}. Tools: ${item.tools.join(', ')}. Objectives: ${item.objectives.join('. ')}`;

    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: contentText
    });

    const vector = response.embeddings?.[0]?.values || response.embedding?.values;
    
    if (!vector) {
      throw new Error(`Failed to extract embedding values for Day ${item.day}`);
    }

    const matchedModule = curriculumJson.modules.find(m => item.day >= m.days[0] && item.day <= m.days[1]);

    await CurriculumVector.create({
      day: item.day,
      topic: item.title,
      module: matchedModule ? matchedModule.title : 'General',
      content: contentText,
      embedding: vector
    });

    console.log(`Successfully seeded Day ${item.day}: ${item.title}`);
    
    // Optional: add a small delay to prevent hitting API rate limits
    await new Promise(resolve => setTimeout(resolve, 500));

  } catch (err) {
    console.error(`Failed at Day ${item.day}:`, err.message);
  }
}

  console.log('Full 31-day curriculum vector seeding complete!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});