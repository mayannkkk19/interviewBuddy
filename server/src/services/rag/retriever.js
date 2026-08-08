import { connectDB } from "../../config/db.js";
import { generateEmbedding } from "./embedding.service.js";
import { logger } from "../../utils/logger.js";

/**
 * Calculates cosine similarity between two vector arrays.
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Retrieves relevant curriculum documents using MongoDB Atlas Vector Search
 * with an in-memory cosine similarity fallback for local standalone MongoDB.
 *
 * @param {string} query - Natural language search query or candidate answer.
 * @param {number} [limit=5] - Maximum number of matched documents to return.
 * @returns {Promise<Array<Object>>} Structured curriculum objects with relevance scores.
 */
export const retrieveCurriculum = async (query, limit = 5) => {
  if (!query || typeof query !== "string" || query.trim() === "") {
    throw new Error("retrieveCurriculum requires a non-empty query string.");
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("retrieveCurriculum limit must be a positive integer.");
  }

  const client = await connectDB();
  const db = typeof client.db === "function" ? client.db("abTalks") : client;
  const collection = db.collection("curriculumvectors");

  // Step 1: Generate query embedding vector
  const queryEmbedding = await generateEmbedding(query);

  let results = [];

  try {
    // Step 2: Run Atlas Vector Search aggregation
    const numCandidates = Math.max(50, limit * 10);
    
    results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates,
            limit,
          },
        },
        {
          $project: {
            _id: 0,
            id: { $ifNull: ["$id", "$_id"] },
            day: 1,
            title: { $ifNull: ["$title", "$topic"] },
            module: 1,
            topic: 1,
            text: { $ifNull: ["$text", "$content"] },
            score: { $meta: "vectorSearchScore" },
          },
        },
      ])
      .toArray();
  } catch (error) {
    // Step 3: Local MongoDB Fallback (Catch Error 31082: SearchNotEnabled)
    if (error.code === 31082 || error.message?.includes("SearchNotEnabled")) {
      logger.warn(
        "[Curriculum Retrieval] $vectorSearch not supported on local engine. Falling back to local cosine similarity calculation."
      );

      const allDocs = await collection.find({}).toArray();

      results = allDocs
        .filter(
          (doc) => Array.isArray(doc.embedding) && doc.embedding.length > 0
        )
        .map((doc) => ({
          id: doc.id || doc._id,
          day: doc.day,
          title: doc.title || doc.topic,
          module: doc.module,
          topic: doc.topic,
          objectives: doc.objectives,
          tools: doc.tools,
          text: doc.text || doc.content,
          score: cosineSimilarity(queryEmbedding, doc.embedding),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } else {
      throw error;
    }
  }

  logger.info(
    {
      query,
      count: results.length,
      daysMatched: [...new Set(results.map((item) => item.day))],
    },
    "[Curriculum Retrieval] Search executed"
  );

  return results;
};

/**
 * Backward-compatibility alias for existing service imports.
 */
export const retrieveRelevantCurriculum = retrieveCurriculum;