const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/interview';

export const startInterview = async (candidateId = "cand_default") => {
  const response = await fetch(`${BASE_URL}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId }),
  });
  if (!response.ok) throw new Error('Failed to start interview');
  return await response.json();
};

export const sendAnswer = async (sessionId, message) => {
  const response = await fetch(`${BASE_URL}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  });
  if (!response.ok) throw new Error('Failed to submit answer');
  return await response.json();
};