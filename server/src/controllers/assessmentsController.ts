import { Request, Response } from 'express';
import { MulterFile } from '../services/storageService';
import { analyzeSpeechPattern, analyzeClockDrawing, evaluateMemoryRecall } from '../services/geminiService';

// POST /assessments/speech/analyze
export const analyzeSpeech = async (req: any, res: any) => {
  try {
    const file = req.file as MulterFile;
    if (!file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const result = await analyzeSpeechPattern(file.buffer, file.mimetype);
    res.json(result);
  } catch (error) {
    console.error('Speech Controller Error:', error);
    res.status(500).json({ error: 'Speech analysis failed' });
  }
};

// POST /assessments/drawing/analyze
export const analyzeDrawing = async (req: any, res: any) => {
  try {
    const file = req.file as MulterFile;
    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const result = await analyzeClockDrawing(file.buffer, file.mimetype);
    res.json(result);
  } catch (error) {
    console.error('Drawing Controller Error:', error);
    res.status(500).json({ error: 'Drawing analysis failed' });
  }
};

// GET /assessments/recall/generate
export const generateRecallSet = async (req: any, res: any) => {
  // In a full implementation, Gemini could generate these dynamically to prevent learning effects.
  // For now, we return a randomized mock set.
  const itemSets = [
    ['Apple', 'Chair', 'Penny', 'Table', 'Garden'],
    ['Dog', 'Bicycle', 'Rose', 'Book', 'Window'],
    ['Cat', 'Pencil', 'Car', 'Tree', 'Watch']
  ];
  
  const selectedSet = itemSets[Math.floor(Math.random() * itemSets.length)];
  
  // Return the items.
  res.json({
    sessionId: Date.now().toString(),
    items: selectedSet,
    instructions: "Memorize these 5 items. You will be asked to recall them in 1 minute."
  });
};

// POST /assessments/recall/evaluate
export const evaluateRecall = async (req: any, res: any) => {
  try {
    const { targetItems, userResponse, responseTimeSeconds } = req.body;

    if (!targetItems || !userResponse) {
      return res.status(400).json({ error: 'Missing targetItems or userResponse' });
    }

    const analysis = await evaluateMemoryRecall(targetItems, userResponse);
    
    res.json({
      ...analysis,
      responseTimeSeconds,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recall Controller Error:', error);
    res.status(500).json({ error: 'Recall evaluation failed' });
  }
};