import mongoose from "mongoose";
import {
  startInterview,
  processAnswer,
} from "../src/services/interview/interviewEngine.service.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  try {
    console.log("Starting full e2e interview test...\n");

    const profile = {
      completedDays: [8, 9, 10, 11],
      skippedDays: [],
    };

    let { state, question, day } = await startInterview(profile);

    console.log(`--------------------------------------------------`);
    console.log(`[Q1] (Day ${day}) ${question}`);
    console.log(`--------------------------------------------------`);

    while (!state.isComplete) {
      // 4000ms delay ensures RPM and burst thresholds stay clean
      await sleep(6000);

      const mockAnswer =
        "We managed state using React local state and Redux Toolkit. Real-time updates were pushed using WebSockets, and database access was optimized using Mongoose indices.";

      console.log(`\n> Candidate: "${mockAnswer}"`);

      const result = await processAnswer(state, mockAnswer);
      state = result.state;

      if (!result.isComplete) {
        console.log(`--------------------------------------------------`);
        console.log(
          `[Q${state.questionsAsked}] (Day ${result.day || "Follow-up"}) ${result.question}`,
        );
        console.log(`--------------------------------------------------`);
      } else {
        console.log(`\n==================================================`);
        console.log(
          `Interview Complete! Total Questions: ${state.questionsAsked}`,
        );
        console.log(`==================================================`);
      }
    }
  } catch (error) {
    console.error("\n[Test Error]:", error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.removeAllListeners("disconnected");
      await mongoose.connection.close();
      console.log("\n[Cleanup] MongoDB connection closed cleanly.");
    }
  }
}

runTest();
