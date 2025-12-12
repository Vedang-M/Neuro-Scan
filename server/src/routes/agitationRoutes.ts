import { Router } from 'express';
import { getPrediction, getPatterns } from '../controllers/agitationController';
import { verifyAuth } from '../middleware/auth';

const router = Router();

router.use(verifyAuth);

router.post('/predict', getPrediction);
router.get('/patterns/:patientId', getPatterns);

export default router;