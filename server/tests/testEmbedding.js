// tests/testEmbedding.js
import { generateEmbedding } from '../src/services/rag/embedding.service.js';

async function testEmbedding() {
  try {
    console.log('Testing embedding generation...\n');
    const text = 'RAG combines retrieval with language model generation.';

    const embedding = await generateEmbedding(text);

    console.log('Embedding generated successfully!');
    console.log('Number of dimensions:', embedding.length);
    console.log('\nFirst 10 values:');
    console.log(embedding.slice(0, 10));

  } catch (error) {
    console.error('Embedding generation failed:');
    console.error(error.message || error);
  }
}

testEmbedding();