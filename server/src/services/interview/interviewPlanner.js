import { retrieveCurriculum } from "../rag/retriever.js";
import { generateText } from "../ai/gemini.service.js";
import { analyzeCandidateAnswer } from "../ai/evaluator.js";
import { generateFollowUpQuestion } from "./questionGenerator.js";

export function createInterviewState(candidateProfile) {
  return {
    candidateProfile,
    conversationHistory: [],
    questionsAsked: 0,
    daysCovered: [],
    topicsCovered: [],
    evaluations: [],
    currentQuestion: null,
    currentCurriculum: [],
    isComplete: false
  };
}

export async function startInterview(candidateProfile) {
  const state = createInterviewState(candidateProfile);

  const questionData = await generateNextQuestion(state);

  state.currentQuestion = questionData.question;
  state.questionsAsked = 1;

  state.conversationHistory.push({
    role: "interviewer",
    content: questionData.question
  });

  return {
    question: questionData.question,
    day: questionData.day,
    state
  };
}

export async function processAnswer(state, answer) {
  const question = state.currentQuestion;

  state.conversationHistory.push({
    role: "candidate",
    content: answer
  });

  const evaluation = await analyzeCandidateAnswer({
    question,
    answer,
    curriculumContext: state.currentCurriculum
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
      state
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
      curriculumContext: state.currentCurriculum
    });
  } else {
    const nextQuestionData = await generateNextQuestion(state);
    nextQuestion = nextQuestionData.question;
  }

  state.currentQuestion = nextQuestion;
  state.questionsAsked += 1;

  state.conversationHistory.push({
    role: "interviewer",
    content: nextQuestion
  });

  return {
    isComplete: false,
    question: nextQuestion,
    evaluation,
    state
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

  const searchQuery = `
Candidate learning journey:
Completed days: ${JSON.stringify(completedDays)}
Skipped days: ${JSON.stringify(skippedDays)}
Learning signals: ${JSON.stringify(candidateProfile.learningSignals || {})}
Previous conversation: ${JSON.stringify(state.conversationHistory)}

Find curriculum topics suitable for a technical interview question.
`;

  let curriculumContext = await retrieveCurriculum(searchQuery, 8);
  if (!Array.isArray(curriculumContext)) curriculumContext = [];

  curriculumContext = curriculumContext.filter((item) => {
    const day = Number(item.day);
    return Number.isInteger(day) && !skippedDays.includes(day);
  });

  curriculumContext = curriculumContext.filter((item) => completedDays.includes(Number(item.day)));

  if (state.daysCovered.length < 4) {
    const uncovered = curriculumContext.filter((item) => !state.daysCovered.includes(Number(item.day)));
    if (uncovered.length > 0) curriculumContext = uncovered;
  }

  if (state.daysCovered.length < 4 && curriculumContext.length === 0) {
    let fallbackContext = await retrieveCurriculum("technical interview curriculum", 31);
    if (Array.isArray(fallbackContext)) {
      fallbackContext = fallbackContext.filter((item) => {
        const day = Number(item.day);
        return (
          Number.isInteger(day) &&
          completedDays.includes(day) &&
          !skippedDays.includes(day) &&
          !state.daysCovered.includes(day)
        );
      });
      if (fallbackContext.length > 0) curriculumContext = fallbackContext;
    }
  }

  if (state.daysCovered.length < 4 && curriculumContext.length === 0) {
    const remainingDays = completedDays.filter(
      (day) => !skippedDays.includes(day) && !state.daysCovered.includes(day)
    );

    const recoveredContext = [];
    for (const day of remainingDays) {
      try {
        const dayContext = await retrieveCurriculum(`curriculum day ${day} technical interview`, 1);
        if (Array.isArray(dayContext)) {
          for (const item of dayContext) {
            const itemDay = Number(item.day);
            if (itemDay === day && !skippedDays.includes(itemDay) && !state.daysCovered.includes(itemDay)) {
              recoveredContext.push(item);
            }
          }
        }
      } catch (err) {
        console.warn(`[Interview Engine] Error fetching day ${day}:`, err.message);
      }
      if (recoveredContext.length >= 4) break;
    }

    if (recoveredContext.length > 0) curriculumContext = recoveredContext;
  }

  if (state.daysCovered.length < 4 && curriculumContext.length === 0) {
    const availableCompletedDays = completedDays.filter(
      (day) => !skippedDays.includes(day) && !state.daysCovered.includes(day)
    );
    throw new Error(
      `Could not find any uncovered completed curriculum days. Remaining eligible days: ${availableCompletedDays.join(", ") || "none"}.`
    );
  }

  const uniqueCurriculum = [];
  const seenDays = new Set();
  for (const item of curriculumContext) {
    const day = Number(item.day);
    if (Number.isInteger(day) && !seenDays.has(day)) {
      seenDays.add(day);
      uniqueCurriculum.push({ ...item, day });
    }
  }

  curriculumContext = uniqueCurriculum;

  if (curriculumContext.length === 0) {
    throw new Error("Interview engine could not build a valid curriculum context.");
  }

  state.currentCurriculum = curriculumContext;

  const context = curriculumContext
    .map((item) => `
Day ${item.day}
Title: ${item.title}
Objectives: ${JSON.stringify(item.objectives || [])}
Tools: ${JSON.stringify(item.tools || [])}
Content: ${item.text || ""}
`)
    .join("\n");

  const availableDays = curriculumContext.map((item) => Number(item.day));

  const prompt = `
You are a technical interviewer conducting an interview for the ABTalks AI Engineering Cohort.

Candidate profile:
${JSON.stringify(candidateProfile, null, 2)}

Relevant curriculum:
${context}

Conversation history:
${JSON.stringify(state.conversationHistory, null, 2)}

Curriculum days already covered:
${JSON.stringify(state.daysCovered)}

AVAILABLE CURRICULUM DAYS FOR THIS QUESTION:
${JSON.stringify(availableDays)}

Available curriculum topics:
${JSON.stringify(curriculumContext.map((item) => ({ day: Number(item.day), title: item.title })), null, 2)}

IMPORTANT RULE:
You MUST choose the "day" from the AVAILABLE CURRICULUM DAYS FOR THIS QUESTION list.

Return ONLY valid JSON in this exact format:
{
  "question": "The interview question",
  "day": 11
}
`;

  const response = await generateText(prompt);

  let questionData;
  try {
    const cleanedResponse = response.replace(/```json/gi, "").replace(/```/g, "").trim();
    questionData = JSON.parse(cleanedResponse);
  } catch {
    throw new Error("Gemini returned an invalid interview question format.");
  }

  const selectedDay = Number(questionData.day);

  if (!availableDays.includes(selectedDay)) {
    throw new Error(`Gemini selected invalid curriculum day ${selectedDay}. Allowed days: ${availableDays.join(", ")}`);
  }

  if (state.daysCovered.length < 4 && state.daysCovered.includes(selectedDay)) {
    const unusedDay = availableDays.find((day) => !state.daysCovered.includes(day));
    if (unusedDay !== undefined) {
      throw new Error(`Gemini selected already-covered day ${selectedDay} while uncovered day ${unusedDay} was available.`);
    }
  }

  if (!state.daysCovered.includes(selectedDay)) {
    state.daysCovered.push(selectedDay);
  }

  return {
    question: questionData.question.trim(),
    day: selectedDay
  };
}