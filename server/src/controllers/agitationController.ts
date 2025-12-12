import { Request, Response } from 'express';
import { predictAgitationRisk, analyzeAgitationPatterns, PatientContext } from '../services/predictionService';
import { db } from '../config/firebase';

// POST /agitation/predict
export const getPrediction = async (req: any, res: any) => {
  try {
    const data: PatientContext = req.body;
    
    // Validate required fields
    if (data.sleepScore === undefined || !data.moodTrend) {
         return res.status(400).json({ error: 'Missing required patient data fields' });
    }

    const prediction = await predictAgitationRisk(data);
    res.json(prediction);
  } catch (error) {
    console.error('Prediction Controller Error:', error);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
};

// GET /agitation/patterns/:patientId
export const getPatterns = async (req: any, res: any) => {
  try {
    const { patientId } = req.params;

    // Fetch historical data from Firestore
    const logsSnapshot = await db.collection('patients')
        .doc(patientId)
        .collection('agitationLogs')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

    let logs = logsSnapshot.docs.map(doc => doc.data());

    if (logs.length === 0) {
        logs = [
            { timestamp: '2023-10-23T14:00:00', type: 'Agitation', severity: 'High', context: 'Afternoon, missed nap' },
            { timestamp: '2023-10-22T15:30:00', type: 'Agitation', severity: 'Moderate', context: 'Loud noise' },
            { timestamp: '2023-10-21T14:15:00', type: 'Agitation', severity: 'High', context: 'Sundowning suspect' },
            { timestamp: '2023-10-20T19:00:00', type: 'Calm', severity: 'None', context: 'Post-dinner' },
            { timestamp: '2023-10-19T14:45:00', type: 'Agitation', severity: 'Moderate', context: 'Afternoon' },
        ];
    }

    const patterns = await analyzeAgitationPatterns(logs);
    res.json(patterns);
  } catch (error) {
    console.error('Pattern Controller Error:', error);
    res.status(500).json({ error: 'Failed to analyze patterns' });
  }
};