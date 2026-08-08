import { connectDB } from "../../config/mongodb.js";
import { generateEmbedding } from "./embedding.service.js";

/**
 * Retrieve curriculum documents using MongoDB vector search.
 *
 * The interview engine is responsible for deciding:
 * - which curriculum days are allowed
 * - which days have already been covered
 * - which topics should be skipped
 *
 * This service is intentionally responsible only for retrieval.
 */
export async function retrieveCurriculum(query, limit = 5) {
  const db = await connectDB();

  const collection = db.collection("curriculum_documents");

  if (!query || typeof query !== "string") {
    throw new Error(
      "retrieveCurriculum requires a non-empty query string."
    );
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error(
      "retrieveCurriculum limit must be a positive integer."
    );
  }

  // Convert the query into an embedding.
  const queryEmbedding = await generateEmbedding(query);

  /**
   * Retrieve more candidates than the requested limit.
   *
   * This gives the interview engine more curriculum diversity
   * to work with instead of forcing it to depend on the first
   * few vector-search results.
   */
  const numCandidates = Math.max(
    50,
    limit * 10
  );

  const results = await collection
    .aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,

          numCandidates,

          limit
        }
      },

      {
        $project: {
          _id: 0,

          id: 1,

          day: 1,

          title: 1,

          module: 1,

          topic: 1,

          objectives: 1,

          tools: 1,

          text: 1,

          score: {
            $meta: "vectorSearchScore"
          }
        }
      }
    ])
    .toArray();

  console.log(
    `[Curriculum Retrieval] Query returned ${results.length} documents.`
  );

  console.log(
    "[Curriculum Retrieval] Days:",
    [...new Set(results.map((item) => item.day))]
  );

  return results;
}