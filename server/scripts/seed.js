import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, closeDB } from '../src/config/db.js';
import { importCandidates } from '../src/services/importer/importCandidates.js';
import { importCurriculum } from '../src/services/importer/importCurriculum.js';
import { logger } from '../src/utils/logger.js';

// Import your Mongoose Models to clear collections
import { Candidate } from '../src/models/Candidate.js'; // Adjust path as needed
import { Curriculum } from '../src/models/Curriculum.js'; // Adjust path as needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seed = async () => {
  try {
    await connectDB();

    const candidatesPath = path.resolve(__dirname, '../candidates.json');
    const curriculumPath = path.resolve(__dirname, '../data/curriculum.json');

    logger.info('Starting database seeding...');

    // Clear stale database collections before importing
    await Candidate.deleteMany({});
    await Curriculum.deleteMany({});
    logger.info('Cleared existing candidate and curriculum records.');

    await importCandidates(candidatesPath);
    await importCurriculum(curriculumPath);

    logger.info('Database seeding completed successfully!');
  } catch (err) {
    logger.error({ err: err.message }, 'Seeding script failed');
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
};

seed();