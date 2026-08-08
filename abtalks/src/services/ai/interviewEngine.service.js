import { retrieveCurriculum } from "./retrieval.service.js";
import { generateText } from "./gemini.service.js";
import { analyzeCandidateAnswer } from "./answerAnalysis.service.js";
import { generateFollowUpQuestion } from "./followUp.service.js";

export async function startInterview(candidateProfile) {
  const state = {
    candidateProfile,
    conversationHistory: [],
    questionsAsked: 0,

    // Curriculum days that have been covered
    daysCovered: [],

    topicsCovered: [],
    evaluations: [],

    currentQuestion: null,
    currentCurriculum: [],

    isComplete: false
  };

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

  // Store candidate answer
  state.conversationHistory.push({
    role: "candidate",
    content: answer
  });

  // Analyze answer
  const evaluation = await analyzeCandidateAnswer({
    question,
    answer,
    curriculumContext: state.currentCurriculum
  });

  state.evaluations.push(evaluation);

  // Update topics/learning signals
  if (evaluation.strengths) {
    state.topicsCovered.push(...evaluation.strengths);
  }

  // Interview is complete after 8 questions
  if (state.questionsAsked >= 8) {
    state.isComplete = true;

    return {
      isComplete: true,
      evaluation,
      state
    };
  }

  let nextQuestion;

  /*
   * During the first 4 questions, we deliberately force the
   * interview to cover 4 different curriculum days.
   *
   * We do NOT allow Gemini's response to violate this rule.
   */
  if (state.daysCovered.length < 4) {
    const nextQuestionData = await generateNextQuestion(state);

    nextQuestion = nextQuestionData.question;
  } else if (evaluation.shouldAskFollowUp) {
    /*
     * Once 4 different days have been covered, follow-up
     * questions are allowed to stay on the current topic.
     */
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

Completed days:
${JSON.stringify(completedDays)}

Skipped days:
${JSON.stringify(skippedDays)}

Learning signals:
${JSON.stringify(candidateProfile.learningSignals || {})}

Previous conversation:
${JSON.stringify(state.conversationHistory)}

Find curriculum topics suitable for a technical interview question.
`;

  /*
   * ============================================================
   * STEP 1: INITIAL RETRIEVAL
   * ============================================================
   */

  let curriculumContext = await retrieveCurriculum(
    searchQuery,
    8
  );

  if (!Array.isArray(curriculumContext)) {
    curriculumContext = [];
  }

  /*
   * ============================================================
   * STEP 2: REMOVE INVALID / SKIPPED DAYS
   * ============================================================
   */

  curriculumContext = curriculumContext.filter((item) => {
    const day = Number(item.day);

    return (
      Number.isInteger(day) &&
      !skippedDays.includes(day)
    );
  });

  /*
   * ============================================================
   * STEP 3: ONLY USE COMPLETED DAYS
   * ============================================================
   *
   * The interviewer should only ask about curriculum the
   * candidate has completed.
   */

  curriculumContext = curriculumContext.filter((item) => {
    const day = Number(item.day);

    return completedDays.includes(day);
  });

  /*
   * ============================================================
   * STEP 4: REMOVE ALREADY-COVERED DAYS
   * ============================================================
   *
   * During the first four unique curriculum days, we need
   * to deliberately select a new day.
   */

  if (state.daysCovered.length < 4) {
    const uncovered = curriculumContext.filter((item) => {
      const day = Number(item.day);

      return !state.daysCovered.includes(day);
    });

    if (uncovered.length > 0) {
      curriculumContext = uncovered;
    }
  }

  /*
   * ============================================================
   * STEP 5: ROBUST FALLBACK RETRIEVAL
   * ============================================================
   *
   * This is the important fix.
   *
   * The previous implementation performed one broad retrieval,
   * but that retrieval could still return zero usable curriculum
   * days.
   *
   * We now progressively broaden the search until we have
   * usable curriculum.
   */

  if (
    state.daysCovered.length < 4 &&
    curriculumContext.length === 0
  ) {
    console.log(
      "[Interview Engine] Initial retrieval returned no new usable curriculum days."
    );

    /*
     * First fallback: retrieve the entire curriculum.
     */
    let fallbackContext = await retrieveCurriculum(
      "technical interview curriculum",
      31
    );

    if (!Array.isArray(fallbackContext)) {
      fallbackContext = [];
    }

    /*
     * Keep only:
     *
     * - completed days
     * - non-skipped days
     * - not-yet-covered days
     */
    fallbackContext = fallbackContext.filter((item) => {
      const day = Number(item.day);

      return (
        Number.isInteger(day) &&
        completedDays.includes(day) &&
        !skippedDays.includes(day) &&
        !state.daysCovered.includes(day)
      );
    });

    if (fallbackContext.length > 0) {
      curriculumContext = fallbackContext;

      console.log(
        "[Interview Engine] Fallback retrieval found:",
        fallbackContext.map((item) => Number(item.day))
      );
    }
  }

  /*
   * ============================================================
   * STEP 6: FINAL COVERAGE FALLBACK
   * ============================================================
   *
   * If retrieval still failed, build the allowed curriculum
   * directly from the candidate's completed days.
   *
   * This prevents us from ever sending Gemini:
   *
   *   AVAILABLE CURRICULUM DAYS: []
   *
   * during the first four questions.
   *
   * We try retrieval for each remaining completed day.
   */

  if (
    state.daysCovered.length < 4 &&
    curriculumContext.length === 0
  ) {
    console.log(
      "[Interview Engine] Broad retrieval still returned no usable days."
    );

    const remainingDays = completedDays.filter(
      (day) =>
        !skippedDays.includes(day) &&
        !state.daysCovered.includes(day)
    );

    /*
     * Try retrieving each remaining day individually.
     *
     * This is more reliable than depending on one semantic
     * search to return all required curriculum topics.
     */
    const recoveredContext = [];

    for (const day of remainingDays) {
      try {
        const dayContext = await retrieveCurriculum(
          `curriculum day ${day} technical interview`,
          1
        );

        if (Array.isArray(dayContext)) {
          for (const item of dayContext) {
            const itemDay = Number(item.day);

            if (
              itemDay === day &&
              !skippedDays.includes(itemDay) &&
              !state.daysCovered.includes(itemDay)
            ) {
              recoveredContext.push(item);
            }
          }
        }
      } catch (error) {
        console.warn(
          `[Interview Engine] Could not retrieve curriculum day ${day}:`,
          error.message
        );
      }

      /*
       * Stop once we have enough unique options.
       */
      if (recoveredContext.length >= 4) {
        break;
      }
    }

    if (recoveredContext.length > 0) {
      curriculumContext = recoveredContext;

      console.log(
        "[Interview Engine] Recovered curriculum days:",
        recoveredContext.map((item) => Number(item.day))
      );
    }
  }

  /*
   * ============================================================
   * STEP 7: LAST-RESORT VALIDATION
   * ============================================================
   *
   * At this point we refuse to call Gemini/mock with an empty
   * curriculum list.
   *
   * This is much safer than allowing Gemini to invent a day.
   */

  if (
    state.daysCovered.length < 4 &&
    curriculumContext.length === 0
  ) {
    const availableCompletedDays = completedDays.filter(
      (day) =>
        !skippedDays.includes(day) &&
        !state.daysCovered.includes(day)
    );

    throw new Error(
      "Could not find any uncovered completed curriculum days. " +
      `Completed days: ${completedDays.join(", ") || "none"}. ` +
      `Skipped days: ${skippedDays.join(", ") || "none"}. ` +
      `Covered days: ${state.daysCovered.join(", ") || "none"}. ` +
      `Remaining eligible days: ${availableCompletedDays.join(", ") || "none"}.`
    );
  }

  /*
   * ============================================================
   * STEP 8: NORMALIZE CURRICULUM
   * ============================================================
   *
   * Remove duplicate curriculum days.
   */

  const uniqueCurriculum = [];
  const seenDays = new Set();

  for (const item of curriculumContext) {
    const day = Number(item.day);

    if (
      Number.isInteger(day) &&
      !seenDays.has(day)
    ) {
      seenDays.add(day);
      uniqueCurriculum.push({
        ...item,
        day
      });
    }
  }

  curriculumContext = uniqueCurriculum;

  /*
   * We must still have at least one valid curriculum day.
   */

  if (curriculumContext.length === 0) {
    throw new Error(
      "Interview engine could not build a valid curriculum context."
    );
  }

  /*
   * Store the curriculum used for the current question.
   */
  state.currentCurriculum = curriculumContext;

  /*
   * ============================================================
   * STEP 9: BUILD AI CONTEXT
   * ============================================================
   */

  const context = curriculumContext
    .map((item) => {
      return `
Day ${item.day}
Title: ${item.title}

Objectives:
${JSON.stringify(item.objectives || [])}

Tools:
${JSON.stringify(item.tools || [])}

Content:
${item.text || ""}
`;
    })
    .join("\n");

  /*
   * IMPORTANT:
   *
   * availableDays is now guaranteed to contain at least one
   * valid day before generateText() is called.
   */

  const availableDays = curriculumContext.map(
    (item) => Number(item.day)
  );

  if (availableDays.length === 0) {
    throw new Error(
      "No available curriculum days exist for the next question."
    );
  }

  console.log(
    "[Interview Engine] Available curriculum days:",
    availableDays
  );

  console.log(
    "[Interview Engine] Covered curriculum days:",
    state.daysCovered
  );

  /*
   * ============================================================
   * STEP 10: GEMINI / MOCK PROMPT
   * ============================================================
   */

  const prompt = `
You are a technical interviewer conducting an interview
for the ABTalks AI Engineering Cohort.

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
${JSON.stringify(
    curriculumContext.map((item) => ({
      day: Number(item.day),
      title: item.title
    })),
    null,
    2
  )}

IMPORTANT RULE:

You MUST choose the "day" from the AVAILABLE CURRICULUM
DAYS FOR THIS QUESTION list.

Do NOT choose a day that is not in that list.

The application is currently trying to cover at least
4 different curriculum days.

Your task:

Generate ONE technical interview question.

Rules:

1. Ask about something the candidate has completed.

2. Do NOT ask about skipped topics.

3. The interview must cover at least 4 different curriculum days.

4. Prefer curriculum days that have NOT already been covered.

5. Once 4 different days have been covered, you may return to
   a previous day if a follow-up question is appropriate.

6. Prefer practical engineering questions over simple definitions.

7. Avoid repeating questions already asked.

8. Increase difficulty when the candidate demonstrates strong knowledge.

9. If the previous answer showed a misunderstanding, a follow-up
   question may continue the same topic.

10. Ask only ONE question.

11. Do not provide the answer.

12. Do not mention the curriculum.

13. Do not mention that you are an AI.

Return ONLY valid JSON in this exact format:

{
  "question": "The interview question",
  "day": 11
}

The "day" MUST be one of the AVAILABLE CURRICULUM DAYS.

Do not wrap the JSON in Markdown.
`;

  /*
   * ============================================================
   * STEP 11: GENERATE QUESTION
   * ============================================================
   */

  const response = await generateText(prompt);

  let questionData;

  try {
    const cleanedResponse = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    questionData = JSON.parse(cleanedResponse);
  } catch (error) {
    console.error(
      "Could not parse interview question:"
    );

    console.error(response);

    throw new Error(
      "Gemini returned an invalid interview question format."
    );
  }

  /*
   * ============================================================
   * STEP 12: VALIDATE QUESTION
   * ============================================================
   */

  if (
    !questionData ||
    typeof questionData.question !== "string" ||
    questionData.question.trim().length === 0
  ) {
    throw new Error(
      "Gemini did not provide a valid interview question."
    );
  }

  const selectedDay = Number(questionData.day);

  if (!Number.isInteger(selectedDay)) {
    throw new Error(
      "Gemini did not provide a valid curriculum day."
    );
  }

  /*
   * ============================================================
   * STEP 13: CRITICAL SAFETY CHECK
   * ============================================================
   *
   * Gemini/mock is NEVER allowed to select a day outside the
   * curriculum that the application supplied.
   */

  if (!availableDays.includes(selectedDay)) {
    throw new Error(
      `Gemini selected invalid curriculum day ${selectedDay}. ` +
      `Allowed days: ${availableDays.join(", ")}`
    );
  }

  /*
   * ============================================================
   * STEP 14: ENFORCE UNIQUE CURRICULUM COVERAGE
   * ============================================================
   *
   * During the first four unique days, the application—not
   * Gemini—controls coverage.
   */

  if (
    state.daysCovered.length < 4 &&
    state.daysCovered.includes(selectedDay)
  ) {
    /*
     * This should normally never happen because the prompt and
     * mock service both receive only uncovered days.
     *
     * However, we protect against it here too.
     */

    const unusedDay = availableDays.find(
      (day) => !state.daysCovered.includes(day)
    );

    if (unusedDay !== undefined) {
      throw new Error(
        `Gemini selected already-covered curriculum day ${selectedDay} ` +
        `while uncovered day ${unusedDay} was available.`
      );
    }
  }

  /*
   * ============================================================
   * STEP 15: RECORD COVERED DAY
   * ============================================================
   */

  if (!state.daysCovered.includes(selectedDay)) {
    state.daysCovered.push(selectedDay);
  }

  return {
    question: questionData.question.trim(),
    day: selectedDay
  };
}