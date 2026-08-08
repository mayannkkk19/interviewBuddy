import fs from 'fs/promises';
import { Candidate } from '../../models/Candidate.js';
import { logger } from '../../utils/logger.js';

export const importCandidates = async (filePath) => {
  try {
    const rawData = await fs.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(rawData);

    // Support both top-level array or nested `{ candidates: [...] }`
    const candidates = Array.isArray(parsedData)
      ? parsedData
      : parsedData.candidates || [];

    if (!Array.isArray(candidates) || candidates.length === 0) {
      throw new Error('No valid array of candidates found in JSON file.');
    }

    let count = 0;
    for (const cand of candidates) {
      const candidateId = cand.member?.id || cand.id;

      if (!candidateId) {
        logger.warn({ cand }, 'Skipping candidate entry: missing ID');
        continue;
      }

      await Candidate.findOneAndUpdate(
        { 'member.id': candidateId },
        cand,
        { upsert: true, returnDocument: 'after' }
      );
      count++;
    }

    logger.info({ count }, 'Successfully imported candidates into MongoDB');
    return count;
  } catch (error) {
    logger.error({ err: error.message }, 'Failed to import candidates');
    throw error;
  }
};