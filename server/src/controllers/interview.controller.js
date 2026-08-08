import {
  startInterview,
  processAnswer,
} from "../services/interview/interviewEngine.service.js";
import { Candidate } from "../models/Candidate.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { compileSessionFeedback } from "../services/interview/reportGenerator.js";
import crypto from "crypto";

export const handleInitialTurn = async (req, res, next) => {
  try {
    const { candidateId, candidateProfile } = req.body;
    const targetCandidateId = candidateId || "cand_12345";

    let profile = candidateProfile;

    if (!profile) {
      let candidate = await Candidate.findOne({
        candidateId: targetCandidateId,
      });

      if (!candidate) {
        candidate = await Candidate.create({
          id: targetCandidateId,
          candidateId: targetCandidateId,
          name: "Mayank",
          member: {
            id: targetCandidateId,
            name: "Mayank",
            jobRole: "Software Engineer",
          },
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
    const sessionId =
      req.body.sessionId || `sess_${crypto.randomBytes(8).toString("hex")}`;

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
            timestamp: new Date(),
          },
        ],
      },
      { upsert: true, new: true }
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
      return res
        .status(400)
        .json({ error: "sessionId and message are required" });
    }

    const sessionDoc = await InterviewSession.findOne({ sessionId });

    if (!sessionDoc) {
      return res.status(404).json({ error: `Session ${sessionId} not found` });
    }

    if (sessionDoc.status === "completed") {
      return res
        .status(400)
        .json({ error: "Session is already marked as completed." });
    }

    // 1. Reconstruct full conversation history
    const conversationHistory = sessionDoc.history.map((h) => ({
      role: h.role === "user" ? "candidate" : "interviewer",
      content: h.content,
    }));

    // 2. Extract previously covered days across history
    const extractedDays = Array.from(
      new Set([
        sessionDoc.currentDay,
        ...sessionDoc.history
          .map((h) => Number(h.day))
          .filter((d) => Number.isInteger(d)),
      ])
    );

    // 3. Reconstruct complete state object for processAnswer
    const state = {
      candidateProfile: sessionDoc.candidate || {},
      conversationHistory,
      questionsAsked: sessionDoc.turnCount || 1,
      daysCovered: extractedDays,
      topicsCovered: [],
      evaluations: sessionDoc.history
        .filter((h) => h.evaluation && h.evaluation.score !== undefined)
        .map((h) => h.evaluation),
      currentQuestion: conversationHistory.slice(-1)[0]?.content || "",
      currentCurriculum: [],
      isComplete: false,
    };

    const result = await processAnswer(state, userAnswer.trim());

    // 4. Attach user response AND evaluation to user message entry
    sessionDoc.history.push({
      role: "user",
      content: userAnswer.trim(),
      day: sessionDoc.currentDay,
      timestamp: new Date(),
      evaluation: {
        score: result.evaluation?.score || 0,
        coveredObjectives: result.evaluation?.strengths || [],
        notes: result.evaluation?.weaknesses?.[0] || "",
      },
    });

    sessionDoc.turnCount = result.state.questionsAsked;

    // Handle completed session path
    if (result.isComplete) {
      sessionDoc.status = "completed";

      sessionDoc.history.push({
        role: "assistant",
        content: "Interview completed. Thank you!",
        timestamp: new Date(),
      });

      // Extract evaluations for aggregated feedback report
      const allEvaluations = sessionDoc.history
        .filter((h) => h.evaluation && typeof h.evaluation.score === "number")
        .map((h) => ({
          score: h.evaluation.score,
          strengths: h.evaluation.coveredObjectives || [],
          weaknesses: h.evaluation.notes ? [h.evaluation.notes] : [],
          missingConcepts: [],
        }));

      sessionDoc.feedback = compileSessionFeedback(allEvaluations);
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

    // Update current day from latest state progression
    const latestSelectedDay =
      result.state.daysCovered.slice(-1)[0] || sessionDoc.currentDay;
    sessionDoc.currentDay = latestSelectedDay;

    // Push next question into history
    sessionDoc.history.push({
      role: "assistant",
      content: result.question,
      day: latestSelectedDay,
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
      content: result.question,
      evaluation: result.evaluation,
    });
  } catch (error) {
    next(error);
  }
};