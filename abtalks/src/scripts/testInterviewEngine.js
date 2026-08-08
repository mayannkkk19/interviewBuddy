import {
  startInterview,
  processAnswer
} from "../services/ai/interviewEngine.service.js";

async function testInterviewEngine() {
  try {
    const candidateProfile = {
      name: "Test Candidate",

      completedDays: [
        8,
        9,
        10,
        11
      ],

      skippedDays: [
        15,
        16
      ],

      learningSignals: {
        rag: "strong",
        vectorDatabases: "strong",
        agents: "beginner"
      }
    };

    console.log("Starting interview...\n");

    const interview = await startInterview(candidateProfile);

    console.log("QUESTION 1:");
console.log(interview.question);

console.log("CURRICULUM DAY:");
console.log(interview.day);

    let state = interview.state;

    const answer =
      "I would use vector embeddings to represent the documents and query, then use cosine similarity to retrieve the most relevant documents.";

    console.log("\nCANDIDATE ANSWER:");
    console.log(answer);

    const result = await processAnswer(
      state,
      answer
    );

    console.log("\nEVALUATION:");
    console.log(
      JSON.stringify(result.evaluation, null, 2)
    );

    if (!result.isComplete) {
  console.log("\nNEXT QUESTION:");
  console.log(result.question);

  console.log("CURRICULUM DAY:");
  console.log(result.state.daysCovered);
}

  } catch (error) {
    console.error("Interview engine test failed:");
    console.error(error);
  }
}

testInterviewEngine();