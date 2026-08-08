import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api/interview";

// Helper delay to avoid Gemini Free Tier 15 RPM limits (4.5s delay)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runEdgeCaseTests() {
  console.log("==========================================");
  console.log("🧪 RUNNING PRIORITY 1: EDGE CASE TESTS");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- TEST 1: Missing Parameters on Start ---
  console.log("--- Test 1: Missing/Invalid Start Payload ---");
  try {
    const res = await fetch(`${BASE_URL}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(
      res.status === 200 || res.status === 400,
      `Start route handled empty payload with status ${res.status}`
    );
  } catch (err) {
    assert(false, `Test 1 crashed with error: ${err.message}`);
  }

  // --- TEST 2: Non-Existent Session ID ---
  console.log("\n--- Test 2: Non-Existent Session ID ---");
  try {
    const res = await fetch(`${BASE_URL}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "sess_non_existent_99999",
        message: "Valid answer to non-existent session.",
      }),
    });
    assert(
      res.status === 404,
      `Returns 404 for invalid sessionId (Got: ${res.status})`
    );
  } catch (err) {
    assert(false, `Test 2 crashed with error: ${err.message}`);
  }

  // --- TEST 3: Empty Message / Answer Payload ---
  console.log("\n--- Test 3: Empty Message / Blank Answer ---");
  try {
    const res = await fetch(`${BASE_URL}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "sess_test_session",
        message: "   ", // Whitespace only
      }),
    });
    assert(
      res.status === 400,
      `Returns 400 for empty/blank answer (Got: ${res.status})`
    );
  } catch (err) {
    assert(false, `Test 3 crashed with error: ${err.message}`);
  }

  // --- TEST 4: Double Submission on Completed Session ---
  console.log("\n--- Test 4: Submitting Answer to Completed Session ---");
  try {
    console.log("Initializing test session...");
    const startRes = await fetch(`${BASE_URL}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId: "cand_guardrail_test" }),
    });
    const startData = await startRes.json();
    const activeSessionId = startData.sessionId;

    let isComplete = false;
    let guard = 0;

    while (!isComplete && guard < 10) {
      console.log(`Pacing turn ${guard + 1}... waiting 4.5s for rate limits.`);
      await sleep(4500); // Prevents hitting Gemini 429 rate limit

      const turnRes = await fetch(`${BASE_URL}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: "Guardrail test turn answer explaining system design.",
        }),
      });

      const turnData = await turnRes.json();
      isComplete = turnData.isComplete || turnData.status === "completed";
      guard++;
    }

    console.log("Attempting extra submission on finished session...");
    await sleep(2000);

    const overSubmitRes = await fetch(`${BASE_URL}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        message: "Extra turn after interview is finished.",
      }),
    });

    assert(
      overSubmitRes.status === 400,
      `Rejects submission on completed session with 400 (Got: ${overSubmitRes.status})`
    );
  } catch (err) {
    assert(false, `Test 4 crashed with error: ${err.message}`);
  }

  // --- RESULTS SUMMARY ---
  console.log("\n==========================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================\n");
}

runEdgeCaseTests();