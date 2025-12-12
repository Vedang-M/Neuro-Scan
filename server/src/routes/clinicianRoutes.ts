import { Router } from 'express';
import { getClinicalReport, exportPDF, exportCSV, compareAnalytics } from '../controllers/clinicianController';
import { verifyAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public route for PDF export to support direct downloads/window.open without complex auth headers in prototype
router.get('/export/pdf/:patientId', exportPDF);

// Protected routes
router.use(verifyAuth);

router.get('/report/:patientId', getClinicalReport);
router.get('/export/csv/:patientId', exportCSV);
router.post('/analytics/compare', compareAnalytics);

export default router;