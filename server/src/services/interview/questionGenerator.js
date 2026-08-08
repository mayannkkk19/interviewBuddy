import { generateText } from "../ai/gemini.service.js";
import { retrieveCurriculum } from "../rag/retriever.js";

export async function generateFollowUpQuestion({ question, answer, evaluation, curriculumContext }) {
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

export async function generateInterviewQuestion({ candidateProfile, conversationHistory = [] }) {
  const searchQuery = `
Candidate's completed topics:
${JSON.stringify(candidateProfile.completedDays)}

Candidate's skipped topics:
${JSON.stringify(candidateProfile.skippedDays)}

Candidate learning signals:
${JSON.stringify(candidateProfile.learningSignals)}

Generate a technical interview question based on this candidate's learning journey.
`;

  const curriculumContext = await retrieveCurriculum(searchQuery, 5);

  const context = curriculumContext
    .map((item) => `
Day ${item.day}
Title: ${item.title}

Learning Objectives:
${JSON.stringify(item.objectives)}

Tools:
${JSON.stringify(item.tools)}

Content:
${item.text}
`)
    .join("\n");

  const prompt = `
You are a technical interviewer for the ABTalks AI Engineering Cohort.

Candidate Profile:
${JSON.stringify(candidateProfile, null, 2)}

Relevant Curriculum:
${context}

Previous Conversation:
${JSON.stringify(conversationHistory, null, 2)}

Your task:
Generate ONE technical interview question.

Rules:
1. Ask only ONE question.
2. Ask about something the candidate actually learned.
3. Prefer engineering and practical questions over simple definitions.
4. Personalize the question using the candidate's learning journey.
5. Do not ask about skipped topics.
6. If the candidate answered correctly, increase difficulty.
7. If the candidate showed a misunderstanding, ask a follow-up question that tests that misunderstanding.
8. Do not provide the answer.
9. Do not mention curriculum or RAG.
10. Keep the question concise.

Return ONLY the interview question.
`;

  const question = await generateText(prompt);

  return {
    question,
    retrievedCurriculum: curriculumContext
  };
}