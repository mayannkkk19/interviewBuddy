import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  day: { type: Number }, // <-- 1. ADDED THIS
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

export async function createSessionInDB(sessionId, candidateProfile, initialQuestion, day) {
  return await InterviewSession.create({
    sessionId,
    candidate: candidateProfile,
    currentDay: day,
    turnCount: 1,
    status: 'active',
    history: [
      {
        role: 'assistant',
        content: initialQuestion,
        day: day, // <-- 2. SAVE INITIAL DAY
        timestamp: new Date(),
      },
    ],
  });
}

export async function updateSessionInDB(sessionId, userAnswer, nextQuestion, nextDay, isComplete, evaluation) {
  const session = await InterviewSession.findOne({ sessionId });
  if (!session) throw new Error(`Session ${sessionId} not found`);

  // 1. Push Candidate Response
  session.history.push({
    role: 'user',
    content: userAnswer,
    day: session.currentDay, // <-- 3. SAVE USER RESPONSE DAY
    timestamp: new Date(),
    evaluation: evaluation ? {
      score: evaluation.score,
      coveredObjectives: evaluation.strengths || [],
      notes: evaluation.feedback || ''
    } : undefined
  });

  session.turnCount += 1;

  // 2. Push Next Assistant Question (or complete interview)
  if (isComplete) {
    session.status = 'completed';
    session.feedback = evaluation?.compiledFeedback || {
      summary: "Interview completed.",
      strengths: evaluation?.strengths || [],
      gaps: evaluation?.weaknesses || [],
      next: []
    };
  } else if (nextQuestion) {
    const targetDay = nextDay || session.currentDay;
    session.currentDay = targetDay;
    session.history.push({
      role: 'assistant',
      content: nextQuestion,
      day: targetDay, // <-- 4. SAVE ASSISTANT NEXT QUESTION DAY
      timestamp: new Date(),
    });
  }

  return await session.save();
}

export const InterviewSession = mongoose.models.InterviewSession || mongoose.model('InterviewSession', interviewSessionSchema);