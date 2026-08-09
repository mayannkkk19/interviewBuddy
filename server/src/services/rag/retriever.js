import { connectDB } from "../../config/db.js";
import { generateEmbedding } from "./embedding.service.js";
import { logger } from "../../utils/logger.js";

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

export const retrieveCurriculumByDays = async (days = []) => {
  if (!Array.isArray(days) || days.length === 0) {
    return [];
  }

  const client = await connectDB();
  const db = typeof client.db === "function" ? client.db("abTalks") : client;
  const collection = db.collection("curriculumvectors");

  const results = await collection
    .find({ day: { $in: days.map(Number) } })
    .project({
      _id: 0,
      id: { $ifNull: ["$id", "$_id"] },
      day: 1,
      title: { $ifNull: ["$title", "$topic"] },
      module: 1,
      topic: 1,
      objectives: 1,
      tools: 1,
      text: { $ifNull: ["$text", "$content"] },
    })
    .toArray();

  logger.info(
    {
      days,
      count: results.length,
      daysMatched: [...new Set(results.map((item) => item.day))],
    },
    "[Curriculum Direct Retrieval] Days fetched successfully"
  );

  return results;
};

export const retrieveCurriculum = async (query, limit = 5) => {
  if (!query || typeof query !== "string" || query.trim() === "") {
    throw new Error("retrieveCurriculum requires a non-empty query string.");
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("retrieveCurriculum limit must be a positive integer.");
  }

  const dayMatch = query.match(/curriculum\s+day\s+(\d+)/i);
  if (dayMatch) {
    const targetDay = parseInt(dayMatch[1], 10);
    const directDocs = await retrieveCurriculumByDays([targetDay]);
    if (directDocs.length > 0) {
      return directDocs;
    }
  }

  const client = await connectDB();
  const db = typeof client.db === "function" ? client.db("abTalks") : client;
  const collection = db.collection("curriculumvectors");

  const queryEmbedding = await generateEmbedding(query);

  let results = [];

  try {
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
    if (error.code === 31082 || error.message?.includes("SearchNotEnabled")) {
      logger.warn(
        "[Curriculum Retrieval] $vectorSearch not supported on engine. Falling back to local cosine similarity."
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

  if (results.length === 0) {
    logger.warn(
      { query },
      "[Curriculum Retrieval] Vector search returned 0 results. Executing keyword fallback query."
    );

    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safeQuery, "i");

    results = await collection
      .find({
        $or: [{ topic: regex }, { title: regex }, { text: regex }],
      })
      .limit(limit)
      .project({
        _id: 0,
        id: { $ifNull: ["$id", "$_id"] },
        day: 1,
        title: { $ifNull: ["$title", "$topic"] },
        module: 1,
        topic: 1,
        text: { $ifNull: ["$text", "$content"] },
      })
      .toArray();
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

export const retrieveRelevantCurriculum = retrieveCurriculum;