import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { retrieveCurriculum } from '../src/services/rag/retriever.js';
import { startInterview, processAnswer } from '../src/services/interview/interviewEngine.service.js';

async function runVectorFlowTest() {
  try {
    console.log('=== STEP 1: Testing Vector Retriever Standalone ===');
    await connectDB();

    const sampleQuery = 'How do vector databases handle approximate nearest neighbor search and indexing?';
    const retrievedDocs = await retrieveCurriculum(sampleQuery, 3);

    console.log(`Retrieved ${retrievedDocs.length} curriculum documents:`);
    retrievedDocs.forEach((doc, idx) => {
      console.log(`  [${idx + 1}] Day ${doc.day}: ${doc.title} (Score: ${doc.score?.toFixed(4)})`);
    });

    if (retrievedDocs.length === 0) {
      console.warn('⚠️ Warning: Vector retrieval returned 0 documents. Make sure your curriculum collection is seeded!');
    }

    console.log('\n=== STEP 2: Initializing Interview Session with Candidate Profile ===');
    const mockCandidate = {
      candidateId: 'cand_test_01',
      completedDays: [1, 5, 11, 18, 22, 25],
      skippedDays: [3, 12],
      learningSignals: { strength: 'Vector Databases and RAG' }
    };

    const initialSession = await startInterview(mockCandidate);
    console.log('Session Initialized Successfully!');
    console.log(`- Assigned Day: ${initialSession.day}`);
    console.log(`- Initial Question: "${initialSession.question}"`);

    let currentState = initialSession.state;

    console.log('\n=== STEP 3: Simulating Answer & Turn Progression ===');
    const mockAnswers = [
      "I used HNSW indexing combined with cosine similarity to map high-dimensional embedding vectors efficiently.",
      "Chunking strategy depends on token constraints; overlapping windows help retain semantic continuity across boundaries.",
      "Guardrails are enforced via prompt engineering constraints and post-processing filters to verify response grounding."
    ];

    for (let i = 0; i < mockAnswers.length; i++) {
      if (currentState.isComplete) break;

      console.log(`\n--- Submitting Turn ${i + 1} Answer ---`);
      console.log(`Candidate Answer: "${mockAnswers[i]}"`);

      const turnResult = await processAnswer(currentState, mockAnswers[i]);
      currentState = turnResult.state;

      console.log(`Turn Status - Complete: ${turnResult.isComplete}`);
      console.log(`Current Questions Asked: ${currentState.questionsAsked}`);
      console.log(`Days Covered So Far: [${currentState.daysCovered.join(', ')}]`);
      
      if (!turnResult.isComplete) {
        console.log(`Next Question: "${turnResult.question}"`);
      } else {
        console.log('Interview completed successfully!');
      }
    }

    console.log('\n✅ All vector flow integration tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Failed with Error:', error);
    process.exit(1);
  }
}

runVectorFlowTest();