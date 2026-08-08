import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

const AI_MODE =
  process.env.AI_MODE || "real";

console.log(
  `[Gemini Service] Mode: ${AI_MODE.toUpperCase()}`
);

// ========================================
// MOCK STATE
// ========================================

let mockQuestionCount = 0;

// ========================================
// MOCK QUESTION BANK
// ========================================

const mockQuestionBank = {
  8: "How would you design and populate a vector database for an AI application, and what factors would you consider when choosing the data to store?",

  9: "How would you design a retrieval pipeline that combines vector search with keyword search, and why might hybrid retrieval improve the quality of results?",

  10: "How would you evaluate whether the documents returned by a vector search system are actually relevant to a user's query?",

  11: "How would you design a prompt that ensures an LLM answers only from retrieved context and clearly states when the required information is not available?",

  12: "How would you diagnose and improve a retrieval system when relevant information exists in the knowledge base but is not being returned?",

  14: "How would you evaluate the quality of an AI system in production, and what metrics would you monitor?",

  20: "How would you design a query router that decides between SQL lookup, vector search, and hybrid retrieval?",

  21: "How would you design an agent that can decide which tool to use for a user's request, and what factors would influence that decision?",

  22: "How would you design reliable tool calling for an AI agent and handle failures or invalid tool arguments?",

  24: "How would you design a production-ready system for monitoring the quality and reliability of an AI application?",

  30: "How would you handle data preprocessing and validation before using the data in an AI pipeline?"
};

// ========================================
// HELPER: EXTRACT ALLOWED DAYS
// ========================================

function extractAllowedDays(prompt) {
  const match = prompt.match(
    /AVAILABLE CURRICULUM DAYS FOR THIS QUESTION:\s*(\[[\s\S]*?\])\s*(?:\n|$)/i
  );

  if (!match) {
    console.log(
      "[MOCK MODE] Could not find AVAILABLE CURRICULUM DAYS."
    );
    return [];
  }

  try {
    const days = JSON.parse(match[1]);

    return days
      .map((day) => Number(day))
      .filter((day) => Number.isInteger(day));
  } catch (error) {
    console.error(
      "[MOCK MODE] Could not parse allowed curriculum days:"
    );
    console.error(match[1]);

    return [];
  }
}

// ========================================
// HELPER: EXTRACT DAYS ALREADY COVERED
// ========================================

function extractCoveredDays(prompt) {
  const match = prompt.match(
    /Curriculum days already covered:\s*(\[[\s\S]*?\])/i
  );

  if (!match) {
    return [];
  }

  try {
    const days = JSON.parse(match[1]);

    return days
      .map((day) => Number(day))
      .filter((day) => Number.isInteger(day));
  } catch (error) {
    return [];
  }
}

// ========================================
// HELPER: CHOOSE MOCK DAY
// ========================================

function chooseMockDay(prompt) {
  const allowedDays = extractAllowedDays(prompt);
  const coveredDays = extractCoveredDays(prompt);

  console.log(
    "[MOCK MODE] Allowed days:",
    allowedDays
  );

  console.log(
    "[MOCK MODE] Covered days:",
    coveredDays
  );

  // Prefer an allowed day that has not been covered.
  const uncoveredDay = allowedDays.find(
    (day) => !coveredDays.includes(day)
  );

  if (uncoveredDay !== undefined) {
    return uncoveredDay;
  }

  // If all allowed days have been covered,
  // safely reuse the first allowed day.
  if (allowedDays.length > 0) {
    return allowedDays[0];
  }

  // No valid curriculum day was provided.
// Fail loudly instead of returning an invalid day.
throw new Error(
  "[MOCK MODE] No allowed curriculum days were provided."
);
}

// ========================================
// HELPER: BUILD MOCK QUESTION
// ========================================

function buildMockQuestion(day) {
  return (
    mockQuestionBank[day] ||
    `How would you design and implement a production-ready system related to the concepts covered in curriculum day ${day}, and what trade-offs would you consider?`
  );
}

// ========================================
// MAIN GEMINI FUNCTION
// ========================================

export async function generateText(prompt) {

  // ======================================
  // MOCK MODE
  // ======================================

  if (AI_MODE === "mock") {

    console.log(
      "[MOCK MODE] Gemini API request skipped."
    );

    const lowerPrompt =
      prompt.toLowerCase();

    // ====================================
    // FOLLOW-UP QUESTION
    // ====================================

    /*
     * IMPORTANT:
     *
     * Do NOT simply check for:
     *
     *   "follow-up question"
     *
     * because the normal interview prompt itself
     * contains that phrase.
     *
     * We only treat the prompt as a follow-up
     * request when it explicitly asks Gemini
     * to generate a follow-up question.
     */

    const isFollowUpPrompt =
      /generate\s+(a\s+)?follow[- ]up question/i.test(
        prompt
      ) ||
      /generate\s+one\s+follow[- ]up question/i.test(
        prompt
      );

    if (isFollowUpPrompt) {

      const allowedDays =
        extractAllowedDays(prompt);

      const followUpDay =
        allowedDays.length > 0
          ? allowedDays[0]
          : 11;

      const response =
        JSON.stringify({
          question:
            "Can you explain how you would implement this approach in a real production system and what trade-offs you would consider?",
          day: followUpDay
        });

      console.log(
        "[MOCK RESPONSE]"
      );

      console.log(response);

      return response;
    }

    // ====================================
    // ANSWER EVALUATION
    // ====================================

    const isEvaluationPrompt =
      lowerPrompt.includes(
        "analyze the candidate's answer"
      ) ||
      lowerPrompt.includes(
        "analyze candidate answer"
      ) ||
      lowerPrompt.includes(
        "evaluate the candidate's answer"
      ) ||
      lowerPrompt.includes(
        "evaluate candidate answer"
      );

    if (isEvaluationPrompt) {

      const mockEvaluation = {

        score: 7,

        strengths: [
          "The candidate demonstrates understanding of the core concept.",
          "The candidate identifies an appropriate technical approach."
        ],

        weaknesses: [
          "The explanation could include more implementation details."
        ],

        missingConcepts: [
          "Evaluation methodology",
          "Production considerations"
        ],

        incorrectConcepts: [],

        shouldAskFollowUp: false,

        followUpReason:
          "The candidate demonstrated sufficient understanding for this question."
      };

      const response =
        JSON.stringify(
          mockEvaluation
        );

      console.log(
        "[MOCK RESPONSE]"
      );

      console.log(response);

      return response;
    }

    // ====================================
    // NORMAL INTERVIEW QUESTION
    // ====================================

    const selectedDay =
      chooseMockDay(prompt);

    const question =
      buildMockQuestion(selectedDay);

    mockQuestionCount++;

    const response =
      JSON.stringify({
        question,
        day: selectedDay
      });

    console.log(
      "[MOCK RESPONSE]"
    );

    console.log(response);

    return response;
  }

  // ======================================
  // REAL GEMINI MODE
  // ======================================

  if (!API_KEY) {

    throw new Error(
      "GEMINI_API_KEY is missing."
    );
  }

  const ai =
    new GoogleGenAI({
      apiKey: API_KEY
    });

  try {

    const result =
      await ai.models.generateContent({

        model: "gemini-2.5-flash",

        contents: prompt
      });

    return result.text;

  } catch (error) {

    if (
      error?.status === 429 ||
      error?.message?.includes("quota")
    ) {

      throw new Error(
        "Gemini API quota exceeded. Please wait before making more requests."
      );
    }

    throw error;
  }
}