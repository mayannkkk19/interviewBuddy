import { retrieveCurriculum } from "../rag/retriever.js";
import { generateText } from "../ai/gemini.service.js";
import { analyzeCandidateAnswer } from "../ai/evaluator.js";
import { generateFollowUpQuestion } from "./followUp.service.js";

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

  if (!state.daysCovered.includes(questionData.day)) {
    state.daysCovered.push(questionData.day);
  }

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

  const evaluation = await analyzeCandidateAnswer({
    question,
    answer,
    curriculumContext: state.currentCurriculum,
  });

  state.evaluations.push(evaluation);

  if (evaluation.strengths) {
    state.topicsCovered.push(...evaluation.strengths);
  }

  if (state.questionsAsked >= 8) {
    state.isComplete = true;

    return {
      isComplete: true,
      evaluation,
      state,
    };
  }

  let nextQuestion;

  if (state.daysCovered.length < 4) {
    const nextQuestionData = await generateNextQuestion(state);
    nextQuestion = nextQuestionData.question;
  } else if (evaluation.shouldAskFollowUp) {
    nextQuestion = await generateFollowUpQuestion({
      question,
      answer,
      evaluation,
      curriculumContext: state.currentCurriculum,
    });
  } else {
    const nextQuestionData = await generateNextQuestion(state);
    nextQuestion = nextQuestionData.question;
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
    evaluation,
    state,
  };
}

async function generateNextQuestion(state) {
  const candidateProfile = state.candidateProfile;

  const completedDays = Array.isArray(candidateProfile.completedDays)
    ? candidateProfile.completedDays.map(Number)
    : [];

  const skippedDays = Array.isArray(candidateProfile.skippedDays)
    ? candidateProfile.skippedDays.map(Number)
    : [];

  const searchQuery = `Find curriculum topics suitable for technical interview question.`;

  let curriculumContext = await retrieveCurriculum(searchQuery, 8);

  if (!Array.isArray(curriculumContext)) {
    curriculumContext = [];
  }

  // 1. Sanitize retrieved items against profile completion
  curriculumContext = curriculumContext.filter((item) => {
    const day = Number(item.day);
    return (
      Number.isInteger(day) &&
      completedDays.includes(day) &&
      !skippedDays.includes(day)
    );
  });

  // 2. Safely extract uncovered items without destroying full context if none exist
  if (state.daysCovered.length < 4) {
    const uncovered = curriculumContext.filter(
      (item) => !state.daysCovered.includes(Number(item.day))
    );

    if (uncovered.length > 0) {
      curriculumContext = uncovered;
    } else {
      // Clear context to explicitly trigger fallback retrieval below
      curriculumContext = [];
    }
  }

  // 3. Fallback: Directly pull remaining unvisited completed days if vector search exhausted available pool
  if (state.daysCovered.length < 4 && curriculumContext.length === 0) {
    const availableCompletedDays = completedDays.filter(
      (day) => !skippedDays.includes(day) && !state.daysCovered.includes(day)
    );

    for (const day of availableCompletedDays) {
      try {
        const retrieved = await retrieveCurriculum(`curriculum day ${day}`, 1);
        if (Array.isArray(retrieved) && retrieved.length > 0) {
          curriculumContext.push({ ...retrieved[0], day: Number(day) });
        }
      } catch (err) {
        console.warn(`[Interview Engine] Error fetching day ${day}:`, err.message);
      }
      if (curriculumContext.length >= 4) break;
    }
  }

  // 4. Deduplicate items by day
  const uniqueMap = new Map();
  for (const item of curriculumContext) {
    const d = Number(item.day);
    if (!uniqueMap.has(d)) uniqueMap.set(d, { ...item, day: d });
  }

  curriculumContext = Array.from(uniqueMap.values());
  state.currentCurriculum = curriculumContext;

  const availableDays = curriculumContext.map((item) => Number(item.day));

  const prompt = `
Curriculum days already covered:
${JSON.stringify(state.daysCovered)}

AVAILABLE CURRICULUM DAYS FOR THIS QUESTION:
${JSON.stringify(availableDays)}

Return ONLY valid JSON format:
{
  "question": "Your interview question here",
  "day": ${availableDays[0] || 11}
}
`;

  const response = await generateText(prompt);
  const cleaned = response.replace(/```json/gi, "").replace(/```/g, "").trim();
  const questionData = JSON.parse(cleaned);

  let finalSelectedDay = Number(questionData.day);

  // 5. Force progression to an uncovered day if mock or LLM returned an already covered day
  if (state.daysCovered.length < 4) {
    const uncoveredDay = availableDays.find((day) => !state.daysCovered.includes(day));
    if (uncoveredDay !== undefined && state.daysCovered.includes(finalSelectedDay)) {
      finalSelectedDay = uncoveredDay;
    }
  }

  // Commit selected day
  if (!state.daysCovered.includes(finalSelectedDay)) {
    state.daysCovered.push(finalSelectedDay);
  }

  return {
    question: questionData.question.trim(),
    day: finalSelectedDay,
  };
}