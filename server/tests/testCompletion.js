// test-completion.js
const SESSION_ID = "sees_5704efc070587ed2";
const ENDPOINT = "http://localhost:5000/api/interview/answer";

const sampleAnswers = [
  "I would use strict system instructions with negative constraints, force JSON schema enforcement, and instruct the model to explicitly return 'NOT_FOUND' if the context does not contain the answer.",
  "For chunking, I prefer dynamic semantic chunking based on header hierarchies and sentence boundaries, keeping chunk size around 300-500 tokens with a 15% overlap.",
  "I would monitor retrieval precision@k, recall@k, latency across embedding/retrieval/generation phases, and LLM output metrics like faithfulness and context utilization.",
  "To protect against prompt injection, I enforce input sanitization, separate untrusted user input using clear XML delimiters, and run user inputs through an guardrail classifier.",
  "For production caching, I implement semantic caching with Redis Vector Search to hit cached response payloads when user query similarity exceeds a 0.92 threshold."
];

async function completeInterview() {
  console.log(`Starting automated turns for session: ${SESSION_ID}\n`);

  for (let i = 0; i < sampleAnswers.length; i++) {
    console.log(`--- Submitting Turn ${i + 3} ---`);
    
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          message: sampleAnswers[i]
        })
      });

      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log(`isComplete: ${data.isComplete}`);
      console.log(`Turn: ${data.turn}`);
      
      if (data.isComplete) {
        console.log("\n🎉 Interview Successfully Completed!");
        console.log("\nFinal Payload Output:");
        console.log(JSON.stringify(data, null, 2));
        break;
      }
    } catch (err) {
      console.error(`Error on turn ${i + 3}:`, err.message);
      break;
    }
  }
}

completeInterview();