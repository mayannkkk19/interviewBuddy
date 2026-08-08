import { retrieveCurriculum } from "./retrieval.service.js";
import { generateText } from "./gemini.service.js";

export async function generateInterviewQuestion({
  candidateProfile,
  conversationHistory = []
}) {
  // Create a search query based on the candidate's learning journey
  const searchQuery = `
Candidate's completed topics:
${JSON.stringify(candidateProfile.completedDays)}

Candidate's skipped topics:
${JSON.stringify(candidateProfile.skippedDays)}

Candidate learning signals:
${JSON.stringify(candidateProfile.learningSignals)}

Generate a technical interview question based on this candidate's learning journey.
`;

  // Retrieve relevant curriculum
  const curriculumContext = await retrieveCurriculum(searchQuery, 5);

  // Build the context that will be given to Gemini
  const context = curriculumContext
    .map((item) => {
      return `
Day ${item.day}
Title: ${item.title}

Learning Objectives:
${JSON.stringify(item.objectives)}

Tools:
${JSON.stringify(item.tools)}

Content:
${item.text}
`;
    })
    .join("\n");

  // Ask Gemini to act as the interviewer
  const prompt = `
You are a technical interviewer for the ABTalks AI Engineering Cohort.

Your job is to conduct a realistic technical interview.

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
6. If the previous conversation contains an answer, use it to decide whether to ask a follow-up question.
7. If the candidate answered correctly, increase the difficulty.
8. If the candidate showed a misunderstanding, ask a follow-up question that tests that misunderstanding.
9. Do not provide the answer.
10. Do not mention the curriculum or RAG.
11. Keep the question concise.

Return ONLY the interview question.
`;

  const question = await generateText(prompt);

  return {
    question,
    retrievedCurriculum: curriculumContext
  };
}