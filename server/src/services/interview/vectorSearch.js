import { GoogleGenAI } from '@google/genai';
import { CurriculumVector } from '../../models/CurriculumVector.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function findRelevantCurriculum(candidateAnswer) {
  // 1. Embed the candidate's latest response
  const embeddingResponse = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: candidateAnswer
  });

  const queryVector = embeddingResponse.embedding.values;

  // 2. Perform Atlas Vector Search aggregation
  const results = await CurriculumVector.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: queryVector,
        numCandidates: 10,
        limit: 2
      }
    },
    {
      $project: {
        day: 1,
        topic: 1,
        module: 1,
        content: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    }
  ]);

  return results;
}