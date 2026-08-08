import { logger } from '../../utils/logger.js';

/**
 * MOCK IMPLEMENTATION: Temporary stub for testing backend infrastructure.
 * Your teammate will replace this file with real Gemini API & RAG orchestration.
 */
export const runInterviewTurn = async ({ candidate, history, message }) => {
  logger.info({ candidateName: candidate?.name, turnCount: history.length }, 'Mock AI Agent processing turn');

  const userTurns = history.filter(msg => msg.role === 'user').length;

  // Turn 1: Initial greeting and first question
  if (!message || userTurns === 0) {
    return {
      reply: `Welcome ${candidate?.name || 'Candidate'}. To start off, could you briefly describe your experience with Python virtual environments and package isolation?`,
      done: false
    };
  }

  // Turn 2: Second technical question
  if (userTurns === 1) {
    return {
      reply: "Great. Now moving on to data foundations: how do you optimize a Pandas dataframe when processing a 5GB CSV file that exceeds memory limits?",
      done: false
    };
  }

  // Turn 3: Final turn -> Terminal state with feedback payload
  return {
    reply: "Thank you for answering our questions. The interview is now complete.",
    done: true,
    feedback: {
      summary: `${candidate?.name || 'Candidate'} demonstrated strong foundational knowledge in environment setup and data handling.`,
      strengths: [
        "Solid understanding of virtual environment isolation",
        "Awareness of batch processing for large datasets"
      ],
      gaps: [
        "Lacks deep exposure to vector database indexing trade-offs",
        "Limited experience with Model Context Protocol (MCP)"
      ],
      next: [
        "Review PyPDF and pdfplumber document chunking techniques",
        "Implement a local ChromaDB vector store with SentenceTransformers"
      ]
    }
  };
};