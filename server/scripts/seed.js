import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, closeDB } from '../src/config/db.js';
import { importCandidates } from '../src/services/importer/importCandidates.js';
import { importCurriculum } from '../src/services/importer/importCurriculum.js';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seed = async () => {
  try {
    await connectDB();

    const candidatesPath = path.resolve(__dirname, '../candidates.json');
    const curriculumPath = path.resolve(__dirname, '../data/curriculum.json');

    logger.info('Starting database seeding...');

    await importCandidates(candidatesPath);
    await importCurriculum(curriculumPath);

    logger.info('Database seeding completed successfully!');
  } catch (err) {
    logger.error({ err: err.message }, 'Seeding script failed');
    process.exitCode = 1;
  } finally {
    // Single point of disconnection handling
    await closeDB();
  }
};

seed();