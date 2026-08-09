import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CandidateSelection from '../pages/CandidateSelection';
import Interview from '../pages/Interview';
import Feedback from '../pages/Feedback';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/select" replace />} />
      <Route path="/select" element={<CandidateSelection />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="*" element={<Navigate to="/select" replace />} />
    </Routes>
  );
}