import { generateText } from "../services/ai/gemini.service.js";

async function testGemini() {
  try {
    console.log("Testing Gemini...\n");

    const response = await generateText(
      "In one sentence, explain what RAG is."
    );

    console.log("Gemini response:");
    console.log(response);

  } catch (error) {
    console.error("Gemini test failed:");
    console.error(error);
  }
}

testGemini();