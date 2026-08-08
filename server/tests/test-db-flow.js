// test-db-flow.js
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/interview';

const sampleAnswers = [
  "To implement hybrid search, I combine dense vector embeddings for semantic retrieval with sparse BM25 indices for exact keyword matches, then re-rank using reciprocal rank fusion.",
  "I evaluate retrieval relevance using offline metrics like NDCG@k and MRR on a golden evaluation dataset, alongside LLM-as-a-judge frameworks.",
  "I use system prompts with strict negative constraints, explicit grounding instructions, and instruct the model to return 'Information unavailable' if context is missing.",
  "For chunking, I use semantic chunking on sentence boundaries with a 500 token limit and 10% overlap to retain context across boundaries.",
  "I track retrieval accuracy using MRR and NDCG, alongside generation metrics like faithfulness, answer relevance, and end-to-end P99 latency.",
  "I prevent prompt injections using structural input delimiters, regex-based input filtering, and pre-execution guardrail evaluation models.",
  "To reduce costs, I implement semantic caching with Redis vector search and load balance across fallback model tiers.",
  "For fine-tuning, I generate high-quality synthetic QA pairs from production logs and evaluate using automated LLM-as-a-judge frameworks."
];

async function runTest() {
  console.log("=== STEP 1: Initializing Interview Session ===");
  
  // 1. Start session
  const startRes = await fetch(`${BASE_URL}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId: 'cand_mayank_01' })
  });

  const startData = await startRes.json();
  console.log("Start Response:", startData);

  const sessionId = startData.sessionId;
  if (!sessionId) {
    console.error("Failed to obtain sessionId. Exiting.");
    return;
  }

  console.log(`\nSession initialized with ID: ${sessionId}`);

  // 2. Loop through turns
  for (let turn = 0; turn < sampleAnswers.length; turn++) {
    console.log(`\n=== STEP 2.${turn + 1}: Submitting Answer ${turn + 1} ===`);

    const answerRes = await fetch(`${BASE_URL}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        message: sampleAnswers[turn]
      })
    });

    const answerData = await answerRes.json();
    console.log(`Status Code: ${answerRes.status}`);
    console.log(`Current Turn: ${answerData.turn}`);
    console.log(`Session Status: ${answerData.status || (answerData.isComplete ? 'completed' : 'active')}`);

    if (answerData.isComplete) {
      console.log("\n==========================================");
      console.log(" 🎉 INTERVIEW COMPLETED AND SAVED TO DB ");
      console.log("==========================================");
      console.log("\nCompiled Feedback stored in MongoDB:");
      console.log(JSON.stringify(answerData.feedback, null, 2));
      break;
    }
  }
}

runTest();