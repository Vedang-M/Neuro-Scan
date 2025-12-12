import { Router } from 'express';
import { getVitals, updateVitals } from '../controllers/vitalsController';
import { verifyAuth } from '../middleware/auth';

const router = Router();

router.use(verifyAuth);

router.get('/:patientId', getVitals);
router.post('/:patientId/update', updateVitals);

export default router;