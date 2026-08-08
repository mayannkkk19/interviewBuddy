import { Curriculum } from '../../models/Curriculum.js';
import { generateEmbedding } from './embedding.service.js';

/**
 * Calculates cosine similarity between two vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Retrieves top K relevant curriculum chunks based on a semantic query
 */
export const retrieveRelevantCurriculum = async (queryText, limit = 2) => {
  const queryVector = await generateEmbedding(queryText);
  const allCurriculum = await Curriculum.find({});

  // Rank all chunks by cosine similarity
  const ranked = allCurriculum
    .map((doc) => ({
      doc,
      score: cosineSimilarity(queryVector, doc.embedding),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit).map((item) => item.doc.contentChunk);
};