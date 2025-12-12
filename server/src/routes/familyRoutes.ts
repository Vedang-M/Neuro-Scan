import { Router } from 'express';
import { getFamilyMembers, inviteMember, getActivityFeed } from '../controllers/familyController';
import { verifyAuth } from '../middleware/auth';

const router = Router();

router.use(verifyAuth);

router.get('/:patientId', getFamilyMembers);
router.post('/invite', inviteMember);
router.get('/activity/:patientId', getActivityFeed);

export default router;