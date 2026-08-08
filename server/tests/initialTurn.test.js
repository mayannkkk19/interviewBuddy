import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { Candidate } from '../src/models/Candidate.js';
import { Curriculum } from '../src/models/Curriculum.js';

describe('POST /api/interview - Initial Turn Integration Test', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_interview_test_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Seed test Curriculum
    await Curriculum.findOneAndUpdate(
      { cohort: 'AI Cohort · 31 days · 8 modules' },
      {
        cohort: 'AI Cohort · 31 days · 8 modules',
        modules: [{ n: 1, title: 'Environment & Tooling', days: [1, 3] }],
        days: [{ day: 1, title: 'VS Code Setup', type: 'SETUP', tools: [], objectives: [] }]
      },
      { upsert: true, new: true }
    );

    // Seed test Candidate
    await Candidate.findOneAndUpdate(
      { candidateId: 'CAND-001' },
      {
        id: 'CAND-001',
        candidateId: 'CAND-001',
        name: 'Sarah Johnson',
        member: {
          id: 'CAND-001',
          name: 'Sarah Johnson',
          jobRole: 'Senior Data Engineer',
          yearsExperience: 9,
          education: 'MS Computer Science',
          status: 'COMPLETED'
        },
        missions: [
          { day: 1, title: 'Environment Setup', passed: true, skipped: false, attempts: 1 }
        ],
        signals: { commitDays: 5, missionsCompleted: 1, missionsFirstTry: 1 }
      },
      { upsert: true, new: true }
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should initialize conversation for CAND-001 on first turn', async () => {
    const res = await request(app)
      .post('/api/interview')
      .send({
        candidateId: 'CAND-001',
        message: 'Hello'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('sessionId');
    expect(res.body).toHaveProperty('content');
    expect(typeof res.body.content).toBe('string');
    expect(res.body.candidateId).toBe('CAND-001');
    expect(res.body.turn).toBe(1);
  });

  it('should return 404 for a non-existent candidate', async () => {
    const res = await request(app)
      .post('/api/interview')
      .send({
        candidateId: 'NON-EXISTENT-ID',
        message: 'Hello'
      });

    expect(res.statusCode).toEqual(404);
  });
});