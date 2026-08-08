import { generateText } from "./gemini.service.js";

export async function analyzeCandidateAnswer({
  question,
  answer,
  curriculumContext
}) {
  const prompt = `
You are evaluating a candidate during a technical interview.

QUESTION:
${question}

CANDIDATE ANSWER:
${answer}

CURRICULUM CONTEXT:
${JSON.stringify(curriculumContext, null, 2)}

Analyze the candidate's answer.

Evaluate:

1. Technical correctness
2. Depth of understanding
3. Missing concepts
4. Incorrect concepts
5. Practical engineering understanding

Return ONLY valid JSON in this format:

{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "missingConcepts": [],
  "incorrectConcepts": [],
  "shouldAskFollowUp": true,
  "followUpReason": ""
}

The score must be from 0 to 10.
`;

  const response = await generateText(prompt);

try {
  // Gemini sometimes wraps JSON inside Markdown code fences.
  // Remove them before parsing.
  const cleanedResponse = response
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Could not parse Gemini evaluation:");
    console.error(response);

    return {
      score: 0,
      strengths: [],
      weaknesses: [],
      missingConcepts: [],
      incorrectConcepts: [],
      shouldAskFollowUp: true,
      followUpReason: "Unable to evaluate answer"
    };
  }
}