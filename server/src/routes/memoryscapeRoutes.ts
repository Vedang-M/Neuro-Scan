import { Router } from 'express';
import multer from 'multer';
import { uploadImages, analyzeMemory, generateSession } from '../controllers/memoryscapeController';
import { verifyAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(verifyAuth);

router.post('/upload', upload.array('images', 10), uploadImages);
router.post('/analyze', analyzeMemory);
router.post('/generate-session', generateSession);

export default router;
