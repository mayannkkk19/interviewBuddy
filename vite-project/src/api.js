// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const fetchCandidates = async () => {
  const res = await API.get("/candidates");
  return res.data;
};

export const startInterview = async (candidateId) => {
  const res = await API.post("/interview/start", { candidateId });
  return res.data;
};

export const sendAnswer = async (sessionId, message) => {
  const res = await API.post("/interview/answer", { sessionId, message });
  return res.data;
};