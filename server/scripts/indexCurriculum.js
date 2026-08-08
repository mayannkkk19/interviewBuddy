import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Updated relative import paths
import { connectDB, closeDB } from "../src/config/db.js";
import { generateEmbedding } from "../src/services/rag/embedding.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const documentsPath = path.join(
  __dirname,
  "../data/processed/curriculumDocuments.json"
);

async function indexCurriculum() {
  try {
    console.log("Reading curriculum documents...");

    const file = await fs.readFile(
      documentsPath,
      "utf-8"
    );

    const documents = JSON.parse(file);

    console.log(
      `Found ${documents.length} curriculum documents.`
    );

    const db = await connectDB();

    const collection = db.collection(
      "curriculum_documents"
    );

    // Remove previous curriculum data
    await collection.deleteMany({});

    console.log(
      "Generating embeddings and storing documents..."
    );

    for (const document of documents) {
      console.log(
        `Processing Day ${document.day}...`
      );

      const embedding = await generateEmbedding(
        document.text
      );

      await collection.insertOne({
        ...document,
        embedding,
      });
    }

    console.log(
      "\nCurriculum indexing completed successfully."
    );

    const count = await collection.countDocuments();

    console.log(
      `Documents stored in MongoDB: ${count}`
    );

  } catch (error) {
    console.error(
      "\nCurriculum indexing failed:"
    );

    console.error(error.message);

  } finally {
    await closeDB();
  }
}

indexCurriculum();