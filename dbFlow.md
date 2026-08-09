node tests/test-db-flow.js     
=== STEP 1: Initializing Interview Session ===
Start Response: {
  sessionId: 'sess_7c085a1c7bf1afed',
  candidateId: 'cand_mayank_01',
  turn: 1,
  day: 8,
  role: 'assistant',
  content: 'How would you design and populate a vector database for an AI application, and what factors would you consider when choosing the data to store?',
  status: 'active'
}

Session initialized with ID: sess_7c085a1c7bf1afed

=== STEP 2.1: Submitting Answer 1 ===
Status Code: 200
Current Turn: 2
Session Status: active

=== STEP 2.2: Submitting Answer 2 ===
Status Code: 200
Current Turn: 3
Session Status: active

=== STEP 2.3: Submitting Answer 3 ===
Status Code: 200
Current Turn: 4
Session Status: active

=== STEP 2.4: Submitting Answer 4 ===
Status Code: 200
Current Turn: 5
Session Status: active

=== STEP 2.5: Submitting Answer 5 ===
Status Code: 200
Current Turn: 6
Session Status: active

=== STEP 2.6: Submitting Answer 6 ===
Status Code: 200
Current Turn: 7
Session Status: active

=== STEP 2.7: Submitting Answer 7 ===
Status Code: 200
Current Turn: 8
Session Status: active

=== STEP 2.8: Submitting Answer 8 ===
Status Code: 200
Current Turn: 9
Session Status: completed

==========================================
 🎉 INTERVIEW COMPLETED AND SAVED TO DB 
==========================================

Compiled Feedback stored in MongoDB:
{
  "summary": "Candidate successfully demonstrated standard system engineering competencies.",
  "strengths": [
    "Clean modular design focus",
    "Good architecture awareness"
  ],
  "gaps": [
    "Deep-dive performance trade-offs under high load"
  ],
  "next": [
    "Study distributed state consensus patterns"
  ]
}