import { Router } from 'express';
import { getCurriculum } from '../controllers/curriculum.controller.js';

const router = Router();

router.get('/', getCurriculum);

export default router;