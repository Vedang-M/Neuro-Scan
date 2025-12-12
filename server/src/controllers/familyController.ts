import { Request, Response } from 'express';
import { db } from '../config/firebase';

// GET /family/:patientId
export const getFamilyMembers = async (req: any, res: any) => {
    try {
        const { patientId } = req.params;
        const snapshot = await db.collection('patients').doc(patientId).collection('family').get();
        const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch family members' });
    }
};

// POST /family/invite
export const inviteMember = async (req: any, res: any) => {
    try {
        const { patientId, email, name, role } = req.body;
        
        // In a real app, this would trigger an email invitation via SendGrid/etc.
        
        await db.collection('patients').doc(patientId).collection('family').add({
            name,
            email,
            role: role || 'Member',
            status: 'Pending',
            invitedAt: new Date().toISOString()
        });

        // Log activity
        await db.collection('patients').doc(patientId).collection('activity').add({
            user: 'System',
            action: `invited ${name} (${role})`,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true, message: 'Invitation sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to invite member' });
    }
};

// GET /family/activity/:patientId
export const getActivityFeed = async (req: any, res: any) => {
    try {
        const { patientId } = req.params;
        const snapshot = await db.collection('patients').doc(patientId)
            .collection('activity')
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();
            
        const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity feed' });
    }
};