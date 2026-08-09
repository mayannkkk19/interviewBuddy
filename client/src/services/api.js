import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchCandidates = async () => {
  const { data } = await API.get('/candidates');
  return data;
};

export const startInterview = async (candidateId) => {
  const { data } = await API.post('/interview/start', { candidateId });
  return data;
};

export const sendAnswer = async (sessionId, message, engineState) => {
  const { data } = await API.post('/interview/answer', { sessionId, message, engineState });
  return data;
};