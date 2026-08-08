import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const AI_MODE = process.env.AI_MODE || "real";

console.log(`[Gemini Service] Mode: ${AI_MODE.toUpperCase()}`);

let mockQuestionCount = 0;

/**
 * Exponential backoff wrapper for API calls hitting 429 / Quota limits.
 */
const callWithRetry = async (fn, retries = 5, delayMs = 4000) => {
  try {
    return await fn();
  } catch (error) {
    const errStr = String(error) + (error?.message || '');
    const isQuotaError = 
      error?.status === 429 || 
      error?.statusCode === 429 ||
      /quota|429|resource_exhausted/i.test(errStr);

    if (isQuotaError && retries > 0) {
      console.warn(`[Gemini API] Rate limit hit. Waiting ${delayMs / 1000}s before retrying (${retries} retries left)...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return callWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
};

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
  const match = prompt.match(/AVAILABLE CURRICULUM DAYS FOR THIS QUESTION:\s*(\[[^\]]*\])/is);
  if (!match) return [];
  try {
    return JSON.parse(match[1]).map(Number).filter(Number.isInteger);
  } catch {
    return [];
  }
}

function extractCoveredDays(prompt) {
  const match = prompt.match(/Curriculum days already covered:\s*(\[[^\]]*\])/is);
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

  // 1. Pick the first uncovered day among allowed days
  const uncoveredDay = allowedDays.find((day) => !coveredDays.includes(day));
  if (uncoveredDay !== undefined) return uncoveredDay;

  // 2. Otherwise pick the first allowed day
  if (allowedDays.length > 0) return allowedDays[0];

  return 1;
}

function buildMockQuestion(day) {
  return (
    mockQuestionBank[day] ||
    `How would you design and implement a production-ready system related to the concepts covered in curriculum day ${day}, and what trade-offs would you consider?`
  );
}

export async function generateText(prompt) {
  if (AI_MODE === "mock") {
    const lowerPrompt = prompt.toLowerCase();

    const isFollowUpPrompt =
      /generate\s+(a\s+)?follow[- ]up question/i.test(prompt) ||
      /generate\s+one\s+follow[- ]up question/i.test(prompt);

    if (isFollowUpPrompt) {
      const allowedDays = extractAllowedDays(prompt);
      const followUpDay = allowedDays.length > 0 ? allowedDays[0] : 11;
      return JSON.stringify({
        question: "Can you explain how you would implement this approach in a real production system and what trade-offs you would consider?",
        day: followUpDay
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
        strengths: ["Demonstrates understanding of the core concept.", "Identifies an appropriate technical approach."],
        weaknesses: ["Explanation could include more implementation details."],
        missingConcepts: ["Evaluation methodology", "Production considerations"],
        incorrectConcepts: [],
        shouldAskFollowUp: false,
        followUpReason: "The candidate demonstrated sufficient understanding for this question."
      });
    }

    const selectedDay = chooseMockDay(prompt);
    const question = buildMockQuestion(selectedDay);
    mockQuestionCount++;

    return JSON.stringify({
      question,
      day: selectedDay
    });
  }

  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Execute call wrapped inside callWithRetry
  return callWithRetry(async () => {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    return result.text;
  });
}