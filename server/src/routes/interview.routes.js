import { Router } from 'express';
import { handleInitialTurn, handleAnswerTurn } from '../controllers/interview.controller.js'; // Adjust path if needed

const router = Router();

// POST http://localhost:5000/api/interview/start
router.post('/start', handleInitialTurn);

// POST http://localhost:5000/api/interview/answer
router.post('/answer', handleAnswerTurn);

export default router;