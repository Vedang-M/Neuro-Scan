import { Router } from 'express';
import { verifyAuth, requireRole } from '../middleware/auth';
import { db } from '../config/firebase';

const router = Router();

router.use(verifyAuth);

// Get all patients (Clinician only)
router.get('/', requireRole('clinician'), async (req, res) => {
  try {
    const snapshot = await db.collection('patients').get();
    const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient metrics
router.get('/:id/metrics', async (req, res) => {
  try {
    // In real app, check if req.user can access this patient
    const doc = await db.collection('patients').doc(req.params.id).collection('metrics').orderBy('timestamp', 'desc').limit(1).get();
    if (doc.empty) return res.json({});
    res.json(doc.docs[0].data());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
