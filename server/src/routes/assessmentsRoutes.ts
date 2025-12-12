import { Router } from 'express';
import multer from 'multer';
import { 
  analyzeSpeech, 
  analyzeDrawing, 
  generateRecallSet, 
  evaluateRecall 
} from '../controllers/assessmentsController';
import { verifyAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(verifyAuth);

// Speech Analysis
router.post('/speech/analyze', upload.single('audio'), analyzeSpeech);

// Drawing Assessment
router.post('/drawing/analyze', upload.single('image'), analyzeDrawing);

// Memory Recall
router.get('/recall/generate', generateRecallSet);
router.post('/recall/evaluate', evaluateRecall);

export default router;
