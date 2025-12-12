import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { generateClinicalInsights, compareAnalyticsPeriods } from '../services/geminiService';
import { generateMedicalPDF } from '../services/pdfService';
import { Parser } from 'json2csv';

// Helper to aggregate data
const getPatientData = async (patientId: string) => {
    const pRef = db.collection('patients').doc(patientId);
    
    // Parallel fetch
    const [vitals, assessments, logs] = await Promise.all([
        pRef.collection('vitals').orderBy('timestamp', 'desc').limit(50).get(),
        pRef.collection('assessments').orderBy('timestamp', 'desc').limit(20).get(),
        pRef.collection('agitationLogs').orderBy('timestamp', 'desc').limit(20).get()
    ]);

    return {
        vitals: vitals.docs.map(d => d.data()),
        assessments: assessments.docs.map(d => d.data()),
        agitationLogs: logs.docs.map(d => d.data()),
        medications: [{ name: 'Donepezil', adherence: '95%' }] // Mock for now
    };
};

// GET /clinician/report/:patientId
export const getClinicalReport = async (req: any, res: any) => {
    try {
        const { patientId } = req.params;
        const data = await getPatientData(patientId);
        
        // Generate insights
        const summary = await generateClinicalInsights(data, 'last 30 days');
        
        res.json({
            summary,
            stats: {
                totalAssessments: data.assessments.length,
                agitationCount: data.agitationLogs.length,
                lastVitals: data.vitals[0] || {}
            }
        });
    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

// GET /export/pdf/:patientId
export const exportPDF = async (req: any, res: any) => {
    try {
        const { patientId } = req.params;
        const data = await getPatientData(patientId);
        const summary = await generateClinicalInsights(data, 'last 30 days');
        
        const stats = {
            cognitiveScore: data.assessments[0]?.score || 78,
            agitationFreq: Math.round(data.agitationLogs.length / 4) + ' episodes',
            avgSleep: '6.8 hours',
            medAdherence: '98%'
        };

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=neuroscan_report_${patientId}.pdf`);
        
        generateMedicalPDF(res, `Patient #${patientId}`, summary, stats);
    } catch (error) {
        console.error('PDF Export Error:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Failed to export PDF' });
    }
};

// GET /export/csv/:patientId
export const exportCSV = async (req: any, res: any) => {
    try {
        const { patientId } = req.params;
        const data = await getPatientData(patientId);
        
        // Flatten data for CSV (focusing on vitals for this export example)
        const flatData = data.vitals.map(v => ({
            timestamp: v.timestamp,
            heartRate: v.hr || 0,
            hrv: v.hrv || 0,
            oxygen: v.spo2 || 0,
            sleepScore: v.sleepScore || 0
        }));

        const parser = new Parser();
        const csv = parser.parse(flatData);

        res.set('Content-Type', 'text/csv');
        res.set('Content-Disposition', `attachment; filename=vitals_${patientId}.csv`);
        res.status(200).send(csv);
    } catch (error) {
        console.error('CSV Export Error:', error);
        res.status(500).json({ error: 'Failed to export CSV' });
    }
};

// POST /analytics/compare
export const compareAnalytics = async (req: any, res: any) => {
    try {
        const { patientId, rangeA, rangeB } = req.body;
        // In a real implementation, we would query DB based on date ranges provided.
        // For prototype, we will split the fetched data arbitrarily or use mocks.
        
        const data = await getPatientData(patientId);
        
        // Mocking split for demo
        const periodA = { 
            avgScore: 75, 
            agitationEpisodes: 5, 
            avgHRV: 42 
        }; // "Previous Month"
        
        const periodB = { 
            avgScore: 78, 
            agitationEpisodes: 3, 
            avgHRV: 48 
        }; // "Current Month"

        const comparison = await compareAnalyticsPeriods(periodA, periodB);
        res.json(comparison);
    } catch (error) {
        console.error('Comparison Error:', error);
        res.status(500).json({ error: 'Failed to generate comparison' });
    }
};