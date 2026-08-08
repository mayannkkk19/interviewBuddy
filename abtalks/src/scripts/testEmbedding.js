import { generateEmbedding } from "../services/ai/embedding.service.js";

async function testEmbedding() {
  try {
    const text =
      "RAG combines retrieval with language model generation.";

    const embedding = await generateEmbedding(text);

    console.log("Embedding generated successfully.");

    console.log("Number of dimensions:");
    console.log(embedding.length);

    console.log("\nFirst 10 values:");
    console.log(embedding.slice(0, 10));

  } catch (error) {
    console.error("Embedding generation failed:");
    console.error(error.message);
  }
}

testEmbedding();