import { Request, Response } from 'express';
import { generateRichNarrative, segmentSessionTimeline } from '../services/geminiService';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

// POST /narratives/generate
export const generateNarrative = async (req: any, res: any) => {
  try {
    const { images, descriptions, tone } = req.body;
    
    // Fallback if no descriptions provided, just use generic placeholders to trigger generation
    const contextList = descriptions && descriptions.length > 0 ? descriptions : ["A family gathering", "Smiling faces"];
    const toneVal = tone || "Calming";

    const story = await generateRichNarrative(
      [`${images?.length || 0} photos provided`], 
      contextList.join('. '), 
      toneVal
    );
    
    res.json({ story });
  } catch (error) {
    console.error('Narrative Gen Error:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
};

// POST /sessions/config
export const configureSession = async (req: any, res: any) => {
  try {
    const { 
      sessionId, // Optional, if updating
      narrative, 
      images, 
      config 
    } = req.body;

    const { duration, music, textSize, speed } = config || {};

    const id = sessionId || uuidv4();
    
    const sessionData = {
      narrative,
      images, // Array of URLs
      config: {
        duration: duration || 120, // Default 2 mins
        music: music || 'Nostalgic',
        textSize: textSize || 'Medium',
        speed: speed || 1.0
      },
      updatedAt: new Date().toISOString()
    };

    await db.collection('sessions').doc(id).set(sessionData, { merge: true });

    res.json({ success: true, sessionId: id, ...sessionData });
  } catch (error) {
    console.error('Session Config Error:', error);
    res.status(500).json({ error: 'Failed to configure session' });
  }
};

// GET /sessions/:id/play
export const getSessionPlayback = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('sessions').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = doc.data();
    if (!session) return res.status(404).json({ error: 'No data' });

    // Check if timeline exists, if not, generate it
    if (!session.timeline) {
      const timelineData = await segmentSessionTimeline(
        session.narrative, 
        session.images?.length || 0, 
        session.config?.duration || 120
      );
      
      // Save timeline to cache future plays
      await db.collection('sessions').doc(id).update({ timeline: timelineData.timeline });
      session.timeline = timelineData.timeline;
    }

    res.json({
      sessionId: id,
      config: session.config,
      audioTrackUrl: `/assets/music/${session.config.music?.toLowerCase()}.mp3`, // Mock path
      timeline: session.timeline,
      images: session.images
    });
  } catch (error) {
    console.error('Playback Error:', error);
    res.status(500).json({ error: 'Failed to retrieve playback data' });
  }
};