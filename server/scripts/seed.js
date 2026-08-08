import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { importCandidates } from '../src/services/importer/importCandidates.js';
import { importCurriculum } from '../src/services/importer/importCurriculum.js';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seed = async () => {
  await connectDB();

  // Resolves json files from root directory
  const candidatesPath = path.resolve(__dirname, '../../candidates.json');
  const curriculumPath = path.resolve(__dirname, '../../curriculum.json');

  logger.info('Starting database seeding...');
  await importCandidates(candidatesPath);
  await importCurriculum(curriculumPath);

  logger.info('Database seeding completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  logger.error({ err: err.message }, 'Seeding script failed');
  process.exit(1);
});