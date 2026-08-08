import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  evaluation: {
    score: Number,
    coveredObjectives: [String],
    notes: String
  }
});

const interviewSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  candidate: { type: Object, required: true },
  history: [messageSchema],
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  currentModuleIndex: { type: Number, default: 0 },
  currentDay: { type: Number, default: 1 },
  turnCount: { type: Number, default: 0 },
  feedback: {
    summary: String,
    strengths: [String],
    gaps: [String],
    next: [String]
  }
}, { timestamps: true });

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);