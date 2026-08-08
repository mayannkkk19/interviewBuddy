import { generateText } from "./gemini.service.js";

export async function generateFollowUpQuestion({
  question,
  answer,
  evaluation,
  curriculumContext
}) {
  const prompt = `
You are conducting a technical interview for the ABTalks AI Engineering Cohort.

PREVIOUS QUESTION:
${question}

CANDIDATE ANSWER:
${answer}

ANSWER EVALUATION:
${JSON.stringify(evaluation, null, 2)}

RELEVANT CURRICULUM:
${JSON.stringify(curriculumContext, null, 2)}

Generate ONE follow-up technical interview question.

Rules:
1. The follow-up must directly relate to the candidate's previous answer.
2. Focus on the weakness, missing concept, or misunderstanding identified in the evaluation.
3. Do not simply repeat the previous question.
4. Ask only ONE question.
5. Do not provide the answer.
6. Make the question practical and interview-like.
7. Do not mention the evaluation.
8. Do not mention that you are an AI.
9. Keep the question concise.

Return ONLY the follow-up question.
`;

  const followUpQuestion = await generateText(prompt);

  return followUpQuestion.trim();
}