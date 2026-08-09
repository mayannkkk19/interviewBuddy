import {
  startInterview,
  processAnswer,
} from "../services/interview/interviewEngine.service.js";
import { Candidate } from "../models/Candidate.js";
import { InterviewSession } from "../models/interviewSession.js";
import { compileSessionFeedback } from "../services/interview/reportGenerator.js";
import { processTurnUnified } from "../services/ai/gemini.service.js";
import crypto from "crypto";

export const handleInitialTurn = async (req, res, next) => {
  try {
    const { candidateId, candidateProfile } = req.body;
    const targetCandidateId = candidateId || "cand_12345";

    let profile = candidateProfile;

    if (!profile) {
      let candidate = await Candidate.findOne({ candidateId: targetCandidateId });

      if (!candidate) {
        candidate = await Candidate.create({
          id: targetCandidateId,
          candidateId: targetCandidateId,
          name: "Mayank",
          member: { id: targetCandidateId, name: "Mayank", jobRole: "Software Engineer" },
          missions: [],
        });
      }

      profile = {
        name: candidate.name,
        completedDays: [8, 9, 10, 11, 12, 13, 14],
        skippedDays: [15, 16],
        learningSignals: { rag: "strong", agents: "beginner" },
      };
    }

    const { question, day, state } = await startInterview(profile);
    const sessionId = req.body.sessionId || `sess_${crypto.randomBytes(8).toString("hex")}`;

    const sessionDoc = await InterviewSession.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        candidate: { candidateId: targetCandidateId, ...profile },
        status: "active",
        currentDay: day,
        turnCount: state.questionsAsked,
        history: [
          {
            role: "assistant",
            content: question,
            day: day,
            timestamp: new Date(),
          },
        ],
      },
      { upsert: true, returnDocument: "after" }
    );

    return res.status(200).json({
      sessionId: sessionDoc.sessionId,
      candidateId: targetCandidateId,
      turn: sessionDoc.turnCount,
      day: sessionDoc.currentDay,
      role: "assistant",
      content: question,
      status: sessionDoc.status,
    });
  } catch (error) {
    next(error);
  }
};

export const handleAnswerTurn = async (req, res, next) => {
  try {
    const { sessionId, message, answer } = req.body;
    const userAnswer = message || answer;

    if (!sessionId || !userAnswer?.trim()) {
      return res.status(400).json({ error: "sessionId and message are required" });
    }

    const sessionDoc = await InterviewSession.findOne({ sessionId });

    if (!sessionDoc) {
      return res.status(404).json({ error: `Session ${sessionId} not found` });
    }

    if (sessionDoc.status === "completed") {
      return res.status(400).json({ error: "Session is already marked as completed." });
    }

    // 1. Reconstruct conversation history & unique covered days
    const conversationHistory = sessionDoc.history.map((h) => ({
      role: h.role === "user" ? "candidate" : "interviewer",
      content: h.content,
    }));

    const extractedDays = Array.from(
      new Set([
        ...sessionDoc.history
          .map((h) => Number(h.day))
          .filter((d) => Number.isInteger(d) && d > 0),
        Number(sessionDoc.currentDay),
      ])
    ).filter((d) => !isNaN(d) && d > 0);

    const currentQuestion = conversationHistory.slice(-1)[0]?.content || "";
    const isLastTurn = sessionDoc.turnCount >= 8; // Max turns ceiling
    const allowedNextDays = [8, 9, 10, 11, 12, 14, 20, 21, 22, 24, 30];

    // 2. UNIFIED GEMINI API CALL (1 call per turn instead of 2)
    const result = await processTurnUnified({
      currentQuestion,
      userAnswer: userAnswer.trim(),
      currentDay: sessionDoc.currentDay,
      allowedNextDays,
      coveredDays: extractedDays,
      isLastTurn,
    });

    // 3. Record user response entry with active turn day & evaluation
    sessionDoc.history.push({
      role: "user",
      content: userAnswer.trim(),
      day: sessionDoc.currentDay,
      timestamp: new Date(),
      evaluation: {
        score: result.evaluation?.score || 0,
        coveredObjectives: result.evaluation?.strengths || [],
        notes: result.evaluation?.gaps?.[0] || "",
      },
    });

    sessionDoc.turnCount += 1;

    // 4. Handle complete state path
    if (isLastTurn) {
      sessionDoc.status = "completed";
      sessionDoc.history.push({
        role: "assistant",
        content: "Interview completed. Thank you!",
        timestamp: new Date(),
      });

      const allEvaluations = sessionDoc.history
        .filter((h) => h.evaluation && typeof h.evaluation.score === "number")
        .map((h) => ({
          score: h.evaluation.score,
          strengths: h.evaluation.coveredObjectives || [],
          weaknesses: h.evaluation.notes ? [h.evaluation.notes] : [],
          missingConcepts: [],
        }));

      sessionDoc.feedback = result.finalFeedback || compileSessionFeedback(allEvaluations);
      await sessionDoc.save();

      return res.status(200).json({
        sessionId: sessionDoc.sessionId,
        status: sessionDoc.status,
        isComplete: true,
        turn: sessionDoc.turnCount,
        content: "Interview completed. Thank you!",
        evaluation: result.evaluation,
        feedback: sessionDoc.feedback,
      });
    }

    // 5. Update next day & append assistant question entry
    const nextQuestionObj = result.nextQuestion || {
      question: "Can you elaborate on your solution's system design trade-offs?",
      day: sessionDoc.currentDay + 1,
    };

    const nextDay = nextQuestionObj.day || sessionDoc.currentDay;
    sessionDoc.currentDay = nextDay;

    sessionDoc.history.push({
      role: "assistant",
      content: nextQuestionObj.question,
      day: nextDay,
      timestamp: new Date(),
    });

    await sessionDoc.save();

    return res.status(200).json({
      sessionId: sessionDoc.sessionId,
      status: sessionDoc.status,
      isComplete: false,
      turn: sessionDoc.turnCount,
      role: "assistant",
      day: sessionDoc.currentDay,
      content: nextQuestionObj.question,
      evaluation: result.evaluation,
    });
  } catch (error) {
    next(error);
  }
};