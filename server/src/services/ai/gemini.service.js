import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;
const AI_MODE = (process.env.AI_MODE || "real").toLowerCase();
const MODEL_NAME = process.env.OPENAI_MODEL || "gpt-4o-mini";

console.log(`[AI Service - OpenAI] Mode: ${AI_MODE.toUpperCase()} | Model: ${MODEL_NAME}`);

let mockQuestionCount = 0;
const mockUsedDays = new Set();

const openai = new OpenAI({
  apiKey: API_KEY || "dummy_key",
});

// ========================================
// UNIFIED TURN PROCESSOR
// ========================================

export async function processTurnUnified({
  currentQuestion,
  userAnswer,
  currentDay,
  allowedNextDays = [],
  coveredDays = [],
  isLastTurn = false,
}) {
  if (AI_MODE === "mock") {
    return handleMockTurnUnified(currentDay, allowedNextDays, coveredDays, isLastTurn);
  }

  if (!API_KEY) {
    throw new Error("OPENAI_API_KEY is missing from environment variables.");
  }

  const prompt = `
You are an expert AI Technical Interviewer evaluating a software engineering candidate.
You MUST respond strictly in valid JSON format. Do not include markdown codeblocks or extra text.

### CURRENT TURN CONTEXT
- Question Asked: "${currentQuestion}"
- Candidate Answer: "${userAnswer}"
- Current Topic Day: ${currentDay}

### SELECTION CONTEXT
- Available Days for Next Question: ${JSON.stringify(allowedNextDays)}
- Days Already Covered: ${JSON.stringify(coveredDays)}
- Is Final Turn: ${isLastTurn}

### INSTRUCTIONS
1. Evaluate the candidate's response (score 1-10, strengths, gaps). Adapt strictly to what they answered.
2. ${
    isLastTurn
      ? "Since this is the final turn, generate a compiled final assessment summary."
      : "Select the best UNCOVERED day from 'Available Days' and formulate a brand new, tailored next technical question."
  }

### REQUIRED JSON SCHEMA
{
  "evaluation": {
    "score": 7,
    "strengths": ["string"],
    "gaps": ["string"]
  },
  ${
    isLastTurn
      ? `"finalFeedback": {
          "summary": "string",
          "strengths": ["string"],
          "gaps": ["string"],
          "next": ["string"]
        }`
      : `"nextQuestion": {
          "question": "string",
          "day": 9
        }`
  }
}
`;

  try {
    const rawResponse = await generateText(prompt, { expectJson: true });
    const parsed = JSON.parse(rawResponse);
    
    if (!parsed.evaluation) {
      console.warn("[OpenAI Service] Missing evaluation field, falling back to mock structure.");
      return handleMockTurnUnified(currentDay, allowedNextDays, coveredDays, isLastTurn);
    }
    return parsed;
  } catch (error) {
    console.error("[OpenAI Service Error]:", error.message);
    return handleMockTurnUnified(currentDay, allowedNextDays, coveredDays, isLastTurn);
  }
}

function handleMockTurnUnified(currentDay, allowedNextDays, coveredDays, isLastTurn) {
  const selectedDay =
    allowedNextDays.find((d) => !coveredDays.includes(d)) || allowedNextDays[0] || 9;

  return {
    evaluation: {
      score: 7,
      strengths: ["Demonstrates solid foundational technical knowledge."],
      gaps: ["Consider elaborating further on system production trade-offs."],
    },
    ...(isLastTurn
      ? {
          finalFeedback: {
            summary: "Candidate successfully demonstrated standard system engineering competencies.",
            strengths: ["Clean modular design focus", "Good architecture awareness"],
            gaps: ["Deep-dive performance trade-offs under high load"],
            next: ["Study distributed state consensus patterns"],
          },
        }
      : {
          nextQuestion: {
            question: buildMockQuestion(selectedDay),
            day: selectedDay,
          },
        }),
  };
}

// ========================================
// CORE GENERATION & EMBEDDINGS
// ========================================

export async function generateText(prompt, options = {}) {
  if (AI_MODE === "mock") {
    return handleMockGeneration(prompt);
  }

  if (!API_KEY) {
    throw new Error("OPENAI_API_KEY is missing from environment variables.");
  }

  const isJsonRequest =
    options.expectJson ||
    /json/i.test(prompt) ||
    /return strictly valid json/i.test(prompt);

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      ...(isJsonRequest ? { response_format: { type: "json_object" } } : {}),
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error(`[OpenAI API Real Error]:`, error.status || error.code, error.message);
    console.warn(`[OpenAI API] Falling back to mock data...`);
    return handleMockGeneration(prompt);
  }
}

export async function getEmbedding(text) {
  if (AI_MODE === "mock") {
    return new Array(768).fill(0.1);
  }

  if (!API_KEY) {
    throw new Error("OPENAI_API_KEY is missing from environment variables.");
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 768,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("[OpenAI Embedding Error]:", error.message);
    return new Array(768).fill(0.1);
  }
}

// ========================================
// MOCK FALLBACK UTILITIES
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

function extractAllowedDays(prompt) {
  const match = prompt.match(
    /(?:AVAILABLE CURRICULUM DAYS FOR THIS QUESTION|Available Days for selection|Available Days for Next Question):\s*(\[[^\]]*\])/is
  );
  if (!match) return [];
  try {
    return JSON.parse(match[1]).map(Number).filter(Number.isInteger);
  } catch {
    return [];
  }
}

function extractCoveredDays(prompt) {
  const match = prompt.match(
    /(?:Curriculum days already covered|Days already covered):\s*(\[[^\]]*\])/is
  );
  if (!match) return [];
  try {
    return JSON.parse(match[1]).map(Number).filter(Number.isInteger);
  } catch {
    return [];
  }
}

function chooseMockDay(prompt) {
  const allowedDays = extractAllowedDays(prompt);
  const coveredDays = extractCoveredDays(prompt);

  let selectedDay = allowedDays.find((day) => !coveredDays.includes(day));

  if (selectedDay === undefined) {
    const defaultPool = [8, 9, 10, 11, 12, 14, 20, 21, 22, 24, 30];
    const poolRemaining = defaultPool.filter((day) => !mockUsedDays.has(day));
    selectedDay =
      poolRemaining.length > 0
        ? poolRemaining[0]
        : defaultPool[mockQuestionCount % defaultPool.length];
  }

  mockUsedDays.add(selectedDay);
  return selectedDay;
}

function buildMockQuestion(day) {
  return (
    mockQuestionBank[day] ||
    `How would you design and implement a production-ready system related to the concepts covered in curriculum day ${day}, and what trade-offs would you consider?`
  );
}

function handleMockGeneration(prompt) {
  const isUnifiedPrompt = /REQUIRED JSON SCHEMA/i.test(prompt) || /processTurnUnified/i.test(prompt);

  if (isUnifiedPrompt) {
    const allowedDays = extractAllowedDays(prompt);
    const coveredDays = extractCoveredDays(prompt);
    const isLastTurn = /Is Final Turn:\s*true/i.test(prompt);
    const currentDay = allowedDays[0] || 8;

    return JSON.stringify(handleMockTurnUnified(currentDay, allowedDays, coveredDays, isLastTurn));
  }

  const lowerPrompt = prompt.toLowerCase();
  const isFollowUpPrompt =
    /generate\s+(a\s+)?follow[- ]up question/i.test(prompt) ||
    /generate\s+one\s+follow[- ]up question/i.test(prompt);

  if (isFollowUpPrompt) {
    const allowedDays = extractAllowedDays(prompt);
    const followUpDay = allowedDays.length > 0 ? allowedDays[0] : 11;
    return JSON.stringify({
      question:
        "Can you explain how you would implement this approach in a real production system and what trade-offs you would consider?",
      day: followUpDay,
    });
  }

  const isEvaluationPrompt =
    lowerPrompt.includes("analyze the candidate's answer") ||
    lowerPrompt.includes("analyze candidate answer") ||
    lowerPrompt.includes("evaluate the candidate's answer") ||
    lowerPrompt.includes("evaluate candidate answer");

  if (isEvaluationPrompt) {
    return JSON.stringify({
      score: 7,
      strengths: [
        "Demonstrates understanding of core architecture.",
        "Identifies an appropriate technical approach.",
      ],
      weaknesses: ["Could include more specific edge-case handling."],
      missingConcepts: ["Production monitoring", "Error handling"],
      incorrectConcepts: [],
      shouldAskFollowUp: false,
      followUpReason: "The candidate demonstrated sufficient understanding.",
    });
  }

  const selectedDay = chooseMockDay(prompt);
  const question = buildMockQuestion(selectedDay);
  mockQuestionCount++;

  return JSON.stringify({
    question,
    day: selectedDay,
  });
}