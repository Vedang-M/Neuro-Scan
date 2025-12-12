import { Request, Response } from 'express';
import { uploadFile, MulterFile } from '../services/storageService';
import { analyzeMemoryImages, generateSessionNarrative } from '../services/geminiService';
import fetch from 'node-fetch'; // Requires node-fetch@2 or similar for CommonJS compat if not using native fetch
import { Buffer } from 'buffer';

// POST /memoryscape/upload
export const uploadImages = async (req: any, res: any) => {
  try {
    const files = req.files as MulterFile[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Upload to Firebase Storage
    const uploadPromises = files.map(file => uploadFile(file));
    const urls = await Promise.all(uploadPromises);

    res.json({ success: true, urls });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// POST /memoryscape/analyze
export const analyzeMemory = async (req: any, res: any) => {
  try {
    const { imageUrls } = req.body;
    
    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ error: 'Invalid input: imageUrls must be an array' });
    }

    // Fetch images to buffers for Gemini
    const imageBuffers: Buffer[] = [];
    const mimeTypes: string[] = [];

    for (const url of imageUrls) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      imageBuffers.push(Buffer.from(arrayBuffer));
      mimeTypes.push(response.headers.get('content-type') || 'image/jpeg');
    }

    const analysis = await analyzeMemoryImages(imageBuffers, mimeTypes);
    
    res.json(analysis);
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

// POST /memoryscape/generate-session
export const generateSession = async (req: any, res: any) => {
  try {
    const { analysisResult, descriptions } = req.body;
    
    if (!analysisResult) {
      return res.status(400).json({ error: 'Missing analysis result' });
    }

    const narrative = await generateSessionNarrative(analysisResult, descriptions);
    
    res.json({ narrative });
  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ error: 'Session generation failed' });
  }
};