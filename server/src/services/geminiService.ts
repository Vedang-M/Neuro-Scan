import { GoogleGenAI, Type } from "@google/genai";
import { Buffer } from 'buffer';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface AnalysisResult {
  faceCount: number;
  emotions: { name: string; value: number }[];
  scene: string;
  themes: string[];
  estimatedDate?: string;
}

export const analyzeMemoryImages = async (imageBuffers: Buffer[], mimeTypes: string[]): Promise<AnalysisResult> => {
  try {
    const imagesParts = imageBuffers.map((buffer, index) => ({
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: mimeTypes[index] || 'image/jpeg',
      },
    }));

    const prompt = `
      Analyze these images for a dementia memory therapy application.
      Provide a JSON summary with the following fields:
      - faceCount: Total number of distinct faces detected across images.
      - emotions: Array of objects {name: string, value: number} representing percentage (0-100) of detected emotions (e.g., Happy, Calm, Nostalgic).
      - scene: A generic classification of the setting (e.g., "Outdoor Park", "Family Living Room").
      - themes: Array of strings representing themes (e.g., "Wedding", "Birthday", "Nature").
      - estimatedDate: A rough guess of the decade or year based on fashion/quality (e.g., "1980s").
      
      Return ONLY valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [...imagesParts, { text: prompt }],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return fallback data in case of error
    return {
      faceCount: 0,
      emotions: [{ name: 'Neutral', value: 100 }],
      scene: 'Unknown',
      themes: ['Unclassified'],
    };
  }
};

export const generateSessionNarrative = async (
  analysis: AnalysisResult,
  descriptions: string[] = []
): Promise<string> => {
  try {
    const prompt = `
      Create a therapeutic narrative for a dementia patient based on these memory details:
      Themes: ${analysis.themes.join(', ')}
      Scene: ${analysis.scene}
      Emotions: ${analysis.emotions.map(e => `${e.name} (${e.value}%)`).join(', ')}
      Additional Context: ${descriptions.join('. ')}

      The story should be:
      1. Calming and engaging.
      2. Under 150 words.
      3. Focus on sensory details (light, sound, feeling).
      4. Use a warm, reminiscent tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate narrative.";
  } catch (error) {
    console.error("Gemini Narrative Error:", error);
    return "A wonderful moment frozen in time, filled with warmth and connection.";
  }
};

// --- Assessment Tools ---

export const analyzeSpeechPattern = async (audioBuffer: Buffer, mimeType: string) => {
  try {
    const prompt = `
      Analyze this audio recording of a cognitive assessment (verbal fluency test).
      Extract the following metrics in JSON format:
      - pace: estimated words per minute (number).
      - clarity: score 0-100 based on articulation.
      - repetitionCount: number of repeated words or phrases.
      - vocabularyRichness: score 0-100 based on unique word usage.
      - fluencyScore: overall score 0-100 indicating cognitive fluency.
      - transcript: A brief transcription of the content.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: audioBuffer.toString('base64'), mimeType } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Speech Analysis Error:", error);
    return { error: "Failed to analyze speech" };
  }
};

export const analyzeClockDrawing = async (imageBuffer: Buffer, mimeType: string) => {
  try {
    const prompt = `
      Analyze this image of a Clock Drawing Test (CDT) for cognitive assessment.
      Provide a JSON output with:
      - shapeRecognition: "Intact" or "Distorted".
      - spatialAccuracy: Score 0-10 (correct placement of numbers).
      - handPlacement: Score 0-10 (correct time setting).
      - symmetryScore: Score 0-10.
      - totalScore: Aggregate score 0-30.
      - observations: Array of specific issues detected (e.g., "Missing number 12", "Hands not connected").
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: imageBuffer.toString('base64'), mimeType } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Drawing Analysis Error:", error);
    return { error: "Failed to analyze drawing" };
  }
};

export const evaluateMemoryRecall = async (targetItems: string[], userResponse: string) => {
  try {
    const prompt = `
      Evaluate a memory recall test.
      Target Items: ${targetItems.join(', ')}.
      User Response: "${userResponse}".

      Provide JSON output:
      - accuracy: Percentage 0-100.
      - correctItems: Array of items correctly recalled.
      - missedItems: Array of items missed.
      - intrusions: Array of items mentioned that were not in the target list.
      - analysis: Brief text describing the recall performance.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Recall Evaluation Error:", error);
    return { accuracy: 0, analysis: "Error evaluating response" };
  }
};

// --- Narrative & Session Tools ---

export const generateRichNarrative = async (
  imageDescriptions: string[], 
  context: string, 
  tone: 'Calming' | 'Engaging'
): Promise<string> => {
  try {
    const prompt = `
      Write a rich, therapeutic narrative story for a dementia memory session.
      
      Inputs:
      - Visual Contexts: ${imageDescriptions.join('; ')}
      - User Descriptions: ${context}
      - Tone: ${tone}

      Requirements:
      - Structure the story into clear paragraphs.
      - Use evocative sensory language (sights, sounds, smells).
      - The story should flow naturally between the scenes described.
      - Length: Approximately 300 words.
      - Output plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for simpler narrative tasks to reduce latency
      }
    });

    return response.text || "Story generation failed.";
  } catch (error) {
    console.error("Rich Narrative Error:", error);
    return "Once upon a time, there was a beautiful memory...";
  }
};

export const segmentSessionTimeline = async (
  narrative: string, 
  imageCount: number, 
  totalDurationSeconds: number
) => {
  try {
    const prompt = `
      Create a timeline for a memory video session.
      
      Narrative: "${narrative}"
      Number of Images Available: ${imageCount}
      Total Duration: ${totalDurationSeconds} seconds.

      Task:
      1. Break the narrative into exactly ${imageCount} logical text chunks.
      2. Assign each chunk to an image index (0 to ${imageCount - 1}).
      3. Calculate the duration for each segment based on text length, summing up to approx ${totalDurationSeconds}.
      4. Suggest a Ken Burns effect for each image (e.g., "zoom-in", "pan-left", "zoom-out").

      Output JSON format:
      {
        "timeline": [
          {
            "imageIndex": number,
            "textChunk": "string",
            "duration": number, // in seconds
            "effect": "string"
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  imageIndex: { type: Type.NUMBER },
                  textChunk: { type: Type.STRING },
                  duration: { type: Type.NUMBER },
                  effect: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{"timeline": []}');
  } catch (error) {
    console.error("Timeline Segmentation Error:", error);
    return { timeline: [] };
  }
};

// --- Clinical & Analytics Tools ---

export const generateClinicalInsights = async (
    patientData: any,
    timeRange: string
) => {
    try {
        const prompt = `
            Act as a senior neurologist specializing in geriatric care.
            Analyze the following patient data collected over the ${timeRange}.

            Data:
            - Assessment Scores: ${JSON.stringify(patientData.assessments)}
            - Agitation Episodes: ${JSON.stringify(patientData.agitationLogs)}
            - Vital Trends: ${JSON.stringify(patientData.vitals)}
            - Medication Adherence: ${JSON.stringify(patientData.medications)}

            Provide a clinical summary (max 300 words) addressing:
            1. Cognitive progression vs baseline.
            2. Correlations between physiological signs (vitals) and behavioral episodes (agitation).
            3. Effectiveness of current interventions.
            4. Recommended adjustments to care plan.

            Format as a professional medical report section (plain text).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Using Pro for complex medical reasoning
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Clinical Insights Error:", error);
        return "Unable to generate clinical insights at this time due to insufficient data or service interruption.";
    }
};

export const compareAnalyticsPeriods = async (periodA: any, periodB: any) => {
    try {
        const prompt = `
            Compare these two datasets for a dementia patient.
            
            Period A (Previous): ${JSON.stringify(periodA)}
            Period B (Current): ${JSON.stringify(periodB)}

            Output a JSON object with:
            1. "trends": Array of objects { "metric": string, "direction": "Improvement"|"Decline"|"Stable", "significance": "High"|"Low", "details": string }.
            2. "summary": A brief paragraph summarizing the trajectory.
            3. "statisticalNote": Mention if changes are likely significant or within variance.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Using Pro for statistical interpretation
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Analytics Comparison Error:", error);
        return { trends: [], summary: "Comparison failed." };
    }
};