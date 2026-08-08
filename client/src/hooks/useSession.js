import { useState, useEffect } from 'react';

export const useSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Check if session exists in localStorage
    const storedSession = localStorage.getItem('interviewSession');
    if (storedSession) {
      try {
        const { id, timestamp } = JSON.parse(storedSession);
        // Check if session is still valid (e.g., less than 24 hours old)
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        if (isValid) {
          setSessionId(id);
          setIsValid(true);
        } else {
          localStorage.removeItem('interviewSession');
          setIsValid(false);
        }
      } catch (e) {
        localStorage.removeItem('interviewSession');
        setIsValid(false);
      }
    }
  }, []);

  const createSession = (id) => {
    const session = {
      id,
      timestamp: Date.now(),
    };
    localStorage.setItem('interviewSession', JSON.stringify(session));
    setSessionId(id);
    setIsValid(true);
  };

  const clearSession = () => {
    localStorage.removeItem('interviewSession');
    setSessionId(null);
    setIsValid(false);
  };

  return {
    sessionId,
    isValid,
    createSession,
    clearSession,
  };
};