node tests/test-vector-flow.js
◇ injected env (0) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from .env // tip: ⌘ custom filepath { path: '/custom/path/.env' }
◇ injected env (0) from .env // tip: ⌁ auth for agents [www.vestauth.com]
[AI Service - OpenAI] Mode: MOCK | Model: gpt-4o-mini
=== STEP 1: Testing Vector Retriever Standalone ===
[2026-08-09 17:49:06.548] INFO: MongoDB connected successfully
    host: "ac-xj3ykea-shard-00-00.qc8wcte.mongodb.net"
    database: "ai_interview_db"
[2026-08-09 17:49:06.583] WARN: [Curriculum Retrieval] Vector search returned 0 results. Executing keyword fallback query.
    query: "How do vector databases handle approximate nearest neighbor search and indexing?"
Retrieved 0 curriculum documents:
⚠️ Warning: Vector retrieval returned 0 documents. Make sure your curriculum collection is seeded!

=== STEP 2: Initializing Interview Session with Candidate Profile ===
[2026-08-09 17:49:06.608] INFO: [Curriculum Retrieval] Search executed
    query: "How do vector databases handle approximate nearest neighbor search and indexing?"
    count: 0
    daysMatched: []
Session Initialized Successfully!
- Assigned Day: 1
- Initial Question: "How would you design and implement a production-ready system related to the concepts covered in curriculum day 1, and what trade-offs would you consider?"

=== STEP 3: Simulating Answer & Turn Progression ===

--- Submitting Turn 1 Answer ---
Candidate Answer: "I used HNSW indexing combined with cosine similarity to map high-dimensional embedding vectors efficiently."
[2026-08-09 17:49:06.637] INFO: [Curriculum Direct Retrieval] Days fetched successfully
    days: [
      1,
      5,
      11,
      18
    ]
    count: 4
    daysMatched: [
      1,
      5,
      11,
      18
    ]
Turn Status - Complete: false
Current Questions Asked: 2
Days Covered So Far: [1, 5]
Next Question: "How would you design and implement a production-ready system related to the concepts covered in curriculum day 5, and what trade-offs would you consider?"

--- Submitting Turn 2 Answer ---
Candidate Answer: "Chunking strategy depends on token constraints; overlapping windows help retain semantic continuity across boundaries."
[2026-08-09 17:49:08.669] INFO: [Curriculum Direct Retrieval] Days fetched successfully
    days: [
      5,
      11,
      18,
      22
    ]
    count: 4
    daysMatched: [
      5,
      11,
      18,
      22
    ]
Turn Status - Complete: false
Current Questions Asked: 3
Days Covered So Far: [1, 5, 11]
Next Question: "How would you design a prompt that ensures an LLM answers only from retrieved context and clearly states when the required information is not available?"

--- Submitting Turn 3 Answer ---
Candidate Answer: "Guardrails are enforced via prompt engineering constraints and post-processing filters to verify response grounding."
[2026-08-09 17:49:10.706] INFO: [Curriculum Direct Retrieval] Days fetched successfully
    days: [
      11,
      18,
      22,
      25
    ]
    count: 4
    daysMatched: [
      11,
      18,
      22,
      25
    ]
Turn Status - Complete: false
Current Questions Asked: 4
Days Covered So Far: [1, 5, 11, 18]
Next Question: "How would you design and implement a production-ready system related to the concepts covered in curriculum day 18, and what trade-offs would you consider?"

✅ All vector flow integration tests passed successfully!
[2026-08-09 17:49:12.743] INFO: [Curriculum Direct Retrieval] Days fetched successfully
    days: [
      18,
      22,
      25
    ]
    count: 3
    daysMatched: [
      18,
      22,
      25
    ]