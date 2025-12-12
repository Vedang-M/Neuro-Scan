import { Router } from 'express';
import { auth, db } from '../config/firebase';

const router = Router();

// Signup: Create user in Auth and Firestore
router.post('/signup', async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // Create user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ uid: userRecord.uid, message: 'User created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
