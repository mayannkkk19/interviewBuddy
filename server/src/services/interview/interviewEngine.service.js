import { retrieveCurriculumByDays } from "../rag/retriever.js";
import { generateText } from "../ai/gemini.service.js";
import { analyzeCandidateAnswer } from "../ai/evaluator.js";
import { generateFollowUpQuestion } from "./followUp.service.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function startInterview(candidateProfile) {
  const state = {
    candidateProfile,
    conversationHistory: [],
    questionsAsked: 0,
    daysCovered: [],
    topicsCovered: [],
    evaluations: [],
    currentQuestion: null,
    currentCurriculum: [],
    isComplete: false,
  };

  const questionData = await generateNextQuestion(state);

  state.currentQuestion = questionData.question;
  state.questionsAsked = 1;

  state.conversationHistory.push({
    role: "interviewer",
    content: questionData.question,
  });

  return {
    question: questionData.question,
    day: questionData.day,
    state,
  };
}

export async function processAnswer(state, answer) {
  const question = state.currentQuestion;

  state.conversationHistory.push({
    role: "candidate",
    content: answer,
  });

  // 1. Analyze Candidate Answer
  const evaluation = await analyzeCandidateAnswer({
    question,
    answer,
    curriculumContext: state.currentCurriculum,
  });

  state.evaluations.push(evaluation);

  if (Array.isArray(evaluation.strengths)) {
    state.topicsCovered.push(...evaluation.strengths);
  }

  // 2. Check Assessment Termination Rule (8 Turns)
  if (state.questionsAsked >= 8) {
    state.isComplete = true;
    return {
      isComplete: true,
      evaluation,
      state,
    };
  }

  // 3. Pause 2 seconds to respect API rate limits
  await delay(2000);

  // 4. Generate Next Question & Advance State
  let nextQuestion;
  let nextDay;

  if (state.daysCovered.length < 4) {
    const nextQuestionData = await generateNextQuestion(state);
    nextQuestion = nextQuestionData.question;
    nextDay = nextQuestionData.day;
  } else if (evaluation.shouldAskFollowUp) {
    nextQuestion = await generateFollowUpQuestion({
      question,
      answer,
      evaluation,
      curriculumContext: state.currentCurriculum,
    });
    // Maintain current day for follow-up turns
    nextDay = state.daysCovered[state.daysCovered.length - 1] || 1;
  } else {
    const nextQuestionData = await generateNextQuestion(state);
    nextQuestion = nextQuestionData.question;
    nextDay = nextQuestionData.day;
  }

  state.currentQuestion = nextQuestion;
  state.questionsAsked += 1;

  state.conversationHistory.push({
    role: "interviewer",
    content: nextQuestion,
  });

  return {
    isComplete: false,
    question: nextQuestion,
    day: nextDay,
    evaluation,
    state,
  };
}

async function generateNextQuestion(state) {
  const candidateProfile = state.candidateProfile || {};

  const completedDays = Array.isArray(candidateProfile.completedDays)
    ? candidateProfile.completedDays.map(Number)
    : [];

  const skippedDays = Array.isArray(candidateProfile.skippedDays)
    ? candidateProfile.skippedDays.map(Number)
    : [];

  // Filter for days that have not been asked yet
  const remainingDays = completedDays.filter(
    (day) => !skippedDays.includes(day) && !state.daysCovered.includes(day)
  );

  let curriculumContext = [];

  if (remainingDays.length > 0) {
    const targetDays = remainingDays.slice(0, 4);
    curriculumContext = await retrieveCurriculumByDays(targetDays);
  } else {
    // If all target days were covered once, reuse active pool without skipped days
    const validDays = completedDays.filter((day) => !skippedDays.includes(day));
    curriculumContext = await retrieveCurriculumByDays(validDays.slice(0, 4));
  }

  // Deduplicate retrieved items by day number
  const uniqueMap = new Map();
  for (const item of curriculumContext) {
    const d = Number(item.day);
    if (!uniqueMap.has(d)) uniqueMap.set(d, { ...item, day: d });
  }

  curriculumContext = Array.from(uniqueMap.values());
  state.currentCurriculum = curriculumContext;

  const availableDays = curriculumContext.map((item) => Number(item.day));

  const curriculumSummary = curriculumContext
    .map((c) => `Day ${c.day}: ${c.title || c.topic || "General Topics"} - ${c.text || ""}`)
    .join("\n");

  const prompt = `You are a technical interviewer. Generate ONE targeted interview question based on the provided curriculum material.

Curriculum Context:
${curriculumSummary}

Days already covered: ${JSON.stringify(state.daysCovered)}
Available Days for selection: ${JSON.stringify(availableDays)}

Return strictly valid JSON only:
{
  "question": "Your technical interview question here",
  "day": ${availableDays[0] || 1}
}`;

  const response = await generateText(prompt);

  let questionData;
  try {
    const cleaned = response.replace(/```json/gi, "").replace(/```/g, "").trim();
    questionData = JSON.parse(cleaned);
  } catch (err) {
    console.warn("[Interview Engine] Fallback used due to JSON parse error.");
    questionData = {
      question: "Can you walk through how you would architect a production-ready application using these modules?",
      day: availableDays[0] || 1,
    };
  }

  let finalSelectedDay = Number(questionData.day);

  // Guarantee selection of an uncovered day if available
  const uncoveredDay = availableDays.find((day) => !state.daysCovered.includes(day));
  if (uncoveredDay !== undefined && (isNaN(finalSelectedDay) || state.daysCovered.includes(finalSelectedDay))) {
    finalSelectedDay = uncoveredDay;
  }

  // Record day coverage in state array
  if (!state.daysCovered.includes(finalSelectedDay)) {
    state.daysCovered.push(finalSelectedDay);
  }

  return {
    question: String(questionData.question).trim(),
    day: finalSelectedDay,
  };
}