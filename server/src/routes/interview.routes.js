import { Router } from 'express';
import { handleInitialTurn } from '../controllers/interview.controller.js';

const router = Router();

router.post('/', handleInitialTurn);
router.post('/chat', handleInitialTurn);

export default router;