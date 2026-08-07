import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import CandidateSelection from '../pages/CandidateSelection';
import Interview from '../pages/Interview';
import Feedback from '../pages/Feedback';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/candidates" element={<CandidateSelection />} />
      <Route path="/interview/:sessionId" element={<Interview />} />
      <Route path="/feedback/:sessionId" element={<Feedback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;