import React, { createContext, useState } from 'react';

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const resetInterview = () => {
    setSessionId(null);
    setCandidate(null);
    setMessages([]);
    setCurrentQuestion(0);
    setTotalQuestions(8);
    setIsLoading(false);
    setIsCompleted(false);
    setFeedback(null);
    setError(null);
  };

  const value = {
    sessionId,
    setSessionId,
    candidate,
    setCandidate,
    messages,
    setMessages,
    currentQuestion,
    setCurrentQuestion,
    totalQuestions,
    setTotalQuestions,
    isLoading,
    setIsLoading,
    isCompleted,
    setIsCompleted,
    feedback,
    setFeedback,
    error,
    setError,
    resetInterview,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};