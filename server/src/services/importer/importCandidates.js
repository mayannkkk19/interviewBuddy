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
      // 1. Resolve candidate ID from all possible candidate locations
      const cid = cand.candidateId || cand.id || cand.member?.id;

      if (!cid) {
        logger.warn({ cand }, 'Skipping candidate entry: missing ID');
        continue;
      }

      // 2. Resolve candidate Name from root or member object
      const cName = cand.name || cand.member?.name || `Candidate ${cid}`;

      // 3. Construct a strictly validated payload matching candidateSchema
      const formattedDoc = {
        ...cand,
        id: cid,                  // Ensures top-level unique 'id' is NOT null
        candidateId: cid,         // Ensures top-level unique 'candidateId' is NOT null
        name: cName,
        member: {
          id: cid,
          name: cName,
          jobRole: cand.member?.jobRole || cand.jobRole || 'Software Engineer',
          yearsExperience: cand.member?.yearsExperience || 0,
          education: cand.member?.education || '',
          status: cand.member?.status || 'active'
        }
      };

      // 4. Upsert using candidateId
      await Candidate.findOneAndUpdate(
        { candidateId: cid },
        formattedDoc,
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