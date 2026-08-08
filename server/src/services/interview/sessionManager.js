import { InterviewSession } from '../../models/InterviewSession.js';
import { logger } from '../../utils/logger.js';

/**
 * Retrieves an existing session or creates a new one on first turn.
 */
export const getOrCreateSession = async (sessionId, candidatePayload = null) => {
  let session = await InterviewSession.findOne({ sessionId });

  if (!session) {
    if (!candidatePayload) {
      throw new Error(`Session ${sessionId} not found and no candidate data provided to initialize.`);
    }

    logger.info({ sessionId, candidateId: candidatePayload.id }, 'Initializing new interview session');
    session = await InterviewSession.create({
      sessionId,
      candidate: candidatePayload,
      history: [],
      status: 'active',
      turnCount: 0
    });
  }

  return session;
};

/**
 * Appends standard user and assistant messages to history and updates turn count.
 */
export const appendTurnToHistory = async (sessionId, userMessage, assistantReply) => {
  const updates = {
    $inc: { turnCount: 1 }
  };

  const pushItems = [];
  if (userMessage) {
    pushItems.push({ role: 'user', content: userMessage });
  }
  if (assistantReply) {
    pushItems.push({ role: 'assistant', content: assistantReply });
  }

  if (pushItems.length > 0) {
    updates.$push = { history: { $each: pushItems } };
  }

  const updatedSession = await InterviewSession.findOneAndUpdate(
    { sessionId },
    updates,
    { new: true }
  );

  return updatedSession;
};

/**
 * Marks a session as completed and stores the final feedback payload.
 */
export const finalizeSession = async (sessionId, feedback) => {
  const updatedSession = await InterviewSession.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        status: 'completed',
        feedback
      }
    },
    { new: true }
  );

  logger.info({ sessionId }, 'Session marked as completed');
  return updatedSession;
};