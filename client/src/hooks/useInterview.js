import { useState, useEffect } from 'react';
import { submitAnswer } from '../services/interviewApi';

export const useInterview = (sessionId) => {
  const [candidate, setCandidate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeInterview = (candidateData) => {
    setCandidate(candidateData);
    
    // Add the first question from the API response
    // The first question is already in the response from startInterview
    // We'll simulate it here for demo purposes
    const firstQuestion = {
      sender: 'ai',
      text: "Welcome to your technical interview! Let's start with the first question.\n\nExplain how embeddings are used in a RAG system. What role do they play in retrieval?",
      timestamp: Date.now()
    };
    
    setMessages([firstQuestion]);
    setCurrentQuestion(1);
    setIsInitialized(true);
  };

  const sendAnswer = async (answer) => {
    if (!answer || isLoading || isCompleted) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'candidate', text: answer, timestamp: Date.now() }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await submitAnswer(sessionId, answer);
      
      if (response.completed) {
        setIsCompleted(true);
        if (response.feedback) {
          setFeedback(response.feedback);
        }
      } else if (response.question) {
        // Add AI question to messages
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: response.question.text, 
          timestamp: Date.now() 
        }]);
        setCurrentQuestion(response.question.number);
      }
      
      if (response.totalQuestions) {
        setTotalQuestions(response.totalQuestions);
      }
    } catch (err) {
      setError('Failed to send answer. Please try again.');
      console.error('Error submitting answer:', err);
      // Remove the user message if it failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    candidate,
    messages,
    currentQuestion,
    totalQuestions,
    isLoading,
    isCompleted,
    feedback,
    error,
    initializeInterview,
    sendAnswer,
  };
};