import { Candidate } from '../models/Candidate.js';
import { generateTurnResponse } from '../services/llm.service.js';
import crypto from 'crypto';

export const handleChatTurn = async (req, res) => {
  try {
    const { candidateId, message, sessionId } = req.body;

    // Step 1: Database Lookup
    const candidate = await Candidate.findOne({ candidateId });
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Step 2: Context Injection & LLM Call
    const llmResult = await generateTurnResponse(candidate.member, message);

    // Step 3: Format Output Payload for Turn 1
    const currentSessionId = sessionId || `sess_${crypto.randomBytes(8).toString('hex')}`;

    return res.status(200).json({
      sessionId: currentSessionId,
      candidateId: candidate.candidateId,
      turn: 1,
      role: 'assistant',
      content: llmResult.text
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};