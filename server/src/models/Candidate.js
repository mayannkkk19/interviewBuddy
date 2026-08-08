import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  day: Number,
  title: String,
  passed: Boolean,
  skipped: Boolean,
  attempts: Number
}, { _id: false });

const memberSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  jobRole: String,
  yearsExperience: Number,
  education: String,
  status: String
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  candidateId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  member: memberSchema,
  missions: [missionSchema],
  signals: {
    commitDays: Number,
    missionsCompleted: Number,
    missionsFirstTry: Number
  }
}, { timestamps: true });

export const Candidate = mongoose.model('Candidate', candidateSchema);