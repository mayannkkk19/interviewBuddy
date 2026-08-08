import { generateText } from "./services/ai/gemini.service.js";

async function main() {
  try {
    const response = await generateText(
      "Explain RAG in exactly two sentences."
    );

    console.log("Gemini response:");
    console.log(response);
  } catch (error) {
    console.error("Something went wrong:");
    console.error(error);
  }
}

main();