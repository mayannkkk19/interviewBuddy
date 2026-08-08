import { generateInterviewQuestion } from "../services/ai/interview.service.js";

async function testInterview() {
  try {
    const candidateProfile = {
      name: "Test Candidate",

      completedDays: [8, 9, 10, 11],

      skippedDays: [15, 16],

      learningSignals: {
        rag: "strong",
        vectorDatabases: "strong",
        agents: "beginner"
      }
    };

    const conversationHistory = [];

    console.log("Generating personalized interview question...\n");

    const result = await generateInterviewQuestion({
      candidateProfile,
      conversationHistory
    });

    console.log("INTERVIEW QUESTION:");
    console.log(result.question);

    console.log("\nRETRIEVED CURRICULUM:");

    result.retrievedCurriculum.forEach((item, index) => {
      console.log(
        `${index + 1}. Day ${item.day} - ${item.title}`
      );
    });

  } catch (error) {
    console.error("Interview generation failed:");
    console.error(error);
  }
}

testInterview();