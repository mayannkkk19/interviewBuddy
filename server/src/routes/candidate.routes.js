import { Router } from 'express';
import { getAllCandidates, getCandidateById } from '../controllers/candidate.controller.js';

const router = Router();

router.get('/', getAllCandidates);
router.get('/:id', getCandidateById);

export default router;