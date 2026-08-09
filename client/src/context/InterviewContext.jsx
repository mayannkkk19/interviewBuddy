import React, { createContext, useContext, useState } from 'react';
import { startInterview, sendAnswer } from '../services/interviewApi';

const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [candidateId, setCandidateId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [turn, setTurn] = useState(0);
  const [currentDay, setCurrentDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const initSession = async (selectedCandidateId) => {
    setLoading(true);
    setCandidateId(selectedCandidateId);
    try {
      const data = await startInterview(selectedCandidateId);
      setSessionId(data.sessionId);
      setTurn(data.turn || 1);
      setCurrentDay(data.day || null);
      setMessages([{ role: 'assistant', content: data.content, day: data.day }]);
      setIsCompleted(false);
      setFeedback(null);
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (userMessage) => {
    if (!sessionId || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const data = await sendAnswer(sessionId, userMessage);
      
      setTurn(data.turn || turn + 1);
      if (data.day) setCurrentDay(data.day);

      setMessages((prev) => [...prev, { role: 'assistant', content: data.content, day: data.day }]);

      if (data.isComplete || data.status === 'completed') {
        setIsCompleted(true);
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error("Failed to send answer:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setSessionId(null);
    setCandidateId(null);
    setMessages([]);
    setTurn(0);
    setCurrentDay(null);
    setIsCompleted(false);
    setFeedback(null);
  };

  return (
    <InterviewContext.Provider
      value={{
        sessionId,
        candidateId,
        messages,
        turn,
        currentDay,
        loading,
        isCompleted,
        feedback,
        initSession,
        submitAnswer,
        resetSession,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterviewContext = () => useContext(InterviewContext);