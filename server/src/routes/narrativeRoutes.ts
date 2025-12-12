import { Router } from 'express';
import { generateNarrative, configureSession, getSessionPlayback } from '../controllers/narrativeController';
import { verifyAuth } from '../middleware/auth';

const router = Router();

router.use(verifyAuth);

router.post('/narratives/generate', generateNarrative);
router.post('/sessions/config', configureSession);
router.get('/sessions/:id/play', getSessionPlayback);

export default router;
