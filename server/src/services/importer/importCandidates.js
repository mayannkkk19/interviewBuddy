import fs from 'fs/promises';
import { Candidate } from '../../models/Candidate.js';
import { logger } from '../../utils/logger.js';

export const importCandidates = async (filePath) => {
  try {
    const rawData = await fs.readFile(filePath, 'utf-8');
    const candidates = JSON.parse(rawData);

    let count = 0;
    for (const cand of candidates) {
      await Candidate.findOneAndUpdate(
        { id: cand.id },
        cand,
        { upsert: true, new: true }
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