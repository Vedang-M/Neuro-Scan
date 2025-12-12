import { Request, Response } from 'express';
import { db } from '../config/firebase';

// GET /vitals/:patientId
export const getVitals = async (req: any, res: any) => {
  try {
    const { patientId } = req.params;
    
    // Get latest vitals
    const doc = await db.collection('patients')
        .doc(patientId)
        .collection('vitals')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

    if (doc.empty) {
        // Return default structure if no data
        return res.json({
            hrv: 45,
            sleepScore: 70,
            activityScore: 500,
            medicationAdherence: 100,
            timestamp: new Date().toISOString()
        });
    }

    res.json(doc.docs[0].data());
  } catch (error) {
    console.error('Get Vitals Error:', error);
    res.status(500).json({ error: 'Failed to fetch vitals' });
  }
};

// POST /vitals/:patientId/update
export const updateVitals = async (req: any, res: any) => {
  try {
    const { patientId } = req.params;
    const { hrv, sleepScore, activityScore, medicationAdherence } = req.body;

    const newVitalEntry = {
        hrv,
        sleepScore,
        activityScore,
        medicationAdherence,
        timestamp: new Date().toISOString()
    };

    // Store in Firestore
    await db.collection('patients')
        .doc(patientId)
        .collection('vitals')
        .add(newVitalEntry);
        
    // Also update aggregate patient document for quick access
    await db.collection('patients').doc(patientId).set({
        currentVitals: newVitalEntry,
        lastUpdated: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true, data: newVitalEntry });
  } catch (error) {
    console.error('Update Vitals Error:', error);
    res.status(500).json({ error: 'Failed to update vitals' });
  }
};