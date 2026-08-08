import { Candidate } from '../models/Candidate.js';
import { Curriculum } from '../models/Curriculum.js';
import crypto from 'crypto';

export const handleInitialTurn = async (req, res, next) => {
  try {
    const { candidateId, message, messages = [] } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }

    const candidate = await Candidate.findOne({ candidateId });
    if (!candidate) {
      return res.status(404).json({ error: `Candidate with ID ${candidateId} not found` });
    }

    const curriculum = await Curriculum.findOne();

    const safeMessages = (Array.isArray(messages) ? messages : []).map((msg) => ({
      role: msg?.role || 'user',
      content: msg?.content || ''
    }));

    const safeMissions = (candidate?.missions || []).map((m) => ({
      day: m?.day,
      title: m?.title || '',
      passed: Boolean(m?.passed)
    }));

    const safeModules = (curriculum?.modules || []).map((mod) => ({
      n: mod?.n,
      title: mod?.title || ''
    }));

    const sessionId = req.body.sessionId || `sess_${crypto.randomBytes(8).toString('hex')}`;
    const candidateName = candidate?.member?.name || candidate?.name || 'Candidate';
    const jobRole = candidate?.member?.jobRole || 'Software Engineer';

    const responseContent = `Hello ${candidateName}. Welcome to your interview evaluation for the ${jobRole} role. Ready for your first technical topic?`;

    return res.status(200).json({
      sessionId,
      candidateId: candidate.candidateId,
      turn: 1,
      role: 'assistant',
      content: responseContent,
      contextSummary: {
        completedMissionsCount: safeMissions.length,
        curriculumModulesCount: safeModules.length,
        processedHistoryLength: safeMessages.length
      }
    });
  } catch (error) {
    next(error);
  }
};