import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../../config/db.js';
import { Candidate } from '../../models/Candidate.js';
import { Curriculum } from '../../models/Curriculum.js';

const seedDatabase = async () => {
  try {
    await connectDB();

    const candidatesPath = path.join(process.cwd(), 'candidates.json');
    const curriculumPath = path.join(process.cwd(), 'curriculum.json');

    const candidatesRaw = JSON.parse(await fs.readFile(candidatesPath, 'utf-8'));
    const curriculumRaw = JSON.parse(await fs.readFile(curriculumPath, 'utf-8'));

    // 1. Drop existing collections to clean old indexes and documents
    try {
      await Candidate.collection.drop();
      await Curriculum.collection.drop();
      console.log('[Seed] Dropped existing Candidate and Curriculum collections.');
    } catch (err) {
      // Ignore if collections do not exist yet on initial run
    }

    // 2. Format Candidates from candidates.json
    const rawCandidates = Array.isArray(candidatesRaw)
      ? candidatesRaw
      : (candidatesRaw.candidates || []);

    const formattedCandidates = rawCandidates.map((item) => {
      const member = item.member || {};
      const uniqueId = member.id || item.id || item.candidateId;

      return {
        id: uniqueId,
        candidateId: uniqueId,
        name: member.name || item.name || '',
        member: {
          id: member.id || uniqueId,
          name: member.name || '',
          jobRole: member.jobRole || '',
          yearsExperience: member.yearsExperience ?? 0,
          education: member.education || '',
          status: member.status || ''
        },
        missions: (item.missions || []).map((m) => ({
          day: m.day,
          title: m.title,
          passed: Boolean(m.passed),
          skipped: Boolean(m.skipped),
          attempts: m.attempts ?? 0
        })),
        signals: {
          commitDays: item.signals?.commitDays ?? 0,
          missionsCompleted: item.signals?.missionsCompleted ?? 0,
          missionsFirstTry: item.signals?.missionsFirstTry ?? 0
        }
      };
    });

    // 3. Format Curriculum as a single root document
    const curriculumDoc = {
      cohort: curriculumRaw.cohort,
      modules: curriculumRaw.modules || [],
      days: curriculumRaw.days || []
    };

    // 4. Insert formatted data into MongoDB
    console.log(`[Seed] Inserting ${formattedCandidates.length} candidate documents...`);
    await Candidate.insertMany(formattedCandidates);

    console.log(`[Seed] Inserting root curriculum document...`);
    await Curriculum.create(curriculumDoc);

    console.log('[Seed] Database seeding completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();