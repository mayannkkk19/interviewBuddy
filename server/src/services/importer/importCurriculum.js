import fs from 'fs/promises';
import { Curriculum } from '../../models/Curriculum.js';
import { logger } from '../../utils/logger.js';

export const importCurriculum = async (filePath) => {
  try {
    const rawData = await fs.readFile(filePath, 'utf-8');
    const curriculumData = JSON.parse(rawData);

    await Curriculum.findOneAndUpdate(
      { cohort: curriculumData.cohort },
      curriculumData,
      { upsert: true, new: true }
    );

    logger.info({ cohort: curriculumData.cohort }, 'Successfully imported curriculum into MongoDB');
    return curriculumData;
  } catch (error) {
    logger.error({ err: error.message }, 'Failed to import curriculum');
    throw error;
  }
};