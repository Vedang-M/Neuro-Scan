import { GoogleGenAI, Type } from "@google/genai";

// Initialize the client. The API_KEY is injected by the environment.
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateMemoryNarrative = async (
  descriptions: string[],
  tone: 'Calming' | 'Engaging'
): Promise<string> => {
  if (!ai) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `On a beautiful spring day, the family gathered together. The joy in everyone's faces reflected the love that filled the room. The sunlight danced through the leaves, casting gentle shadows on the grass. It was a moment of pure connection, where time seemed to stand still, and laughter echoed through the air, creating memories that would be cherished forever.`
        );
      }, 1500);
    });
  }

  try {
    const prompt = `
      Create a short, ${tone.toLowerCase()} narrative story based on these memory descriptions: 
      ${descriptions.join(', ')}.
      
      The story should be therapeutic for a dementia patient. 
      Keep it under 100 words. 
      Focus on sensory details and positive emotions.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate story.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The gentle breeze rustled through the trees, bringing back the sweet scent of blooming flowers from that wonderful afternoon.";
  }
};

export const generateAnalysisSummary = async (
  themes: string[],
  emotions: { name: string; value: number }[]
): Promise<string> => {
  if (!ai) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          "This collection captures heartwarming moments of family connection, likely set during a sunny summer gathering. The dominant emotions are joy and nostalgia, suggesting these are cherished memories of celebration and togetherness."
        );
      }, 1000);
    });
  }

  try {
    const emotionSummary = emotions.map(e => `${e.name} (${e.value}%)`).join(', ');
    const prompt = `
      Analyze these photo classification results for a dementia memory app:
      Themes: ${themes.join(', ')}
      Emotions: ${emotionSummary}

      Write a gentle, 2-sentence summary suitable for a patient or caregiver dashboard. 
      Highlight the mood and context. Start with "This collection captures..." or similar.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis summary unavailable.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "This collection appears to focus on family gatherings. The emotional tone is predominantly joyful and nostalgic.";
  }
};

export const analyzeImageContent = async (base64Image: string): Promise<{ tags: string[], emotion: string }> => {
  if (!ai) {
    // Fallback mock
    return {
      tags: ['Family', 'Outdoors', 'Smile'],
      emotion: 'Happy'
    };
  }

  try {
    const prompt = `Analyze this image for a dementia memory therapy app. 
    Return a JSON object with:
    1. "tags": array of 3 strings identifying the scene (e.g. "Wedding", "Park").
    2. "emotion": dominant emotion (Happy, Neutral, Sad, Nostalgic).
    `;
    
    // Parse data URL if present
    const match = base64Image.match(/^data:(.+);base64,(.+)$/);
    const mimeType = match ? match[1] : 'image/jpeg';
    const data = match ? match[2] : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { inlineData: { mimeType, data } },
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    throw new Error("No text returned");

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { tags: ['Detected'], emotion: 'Neutral' };
  }
};

export const analyzeMemoryCollection = async (base64Images: string[]): Promise<any> => {
  if (!ai) {
    return {
       emotions: [
           { name: 'Joy', value: 45 },
           { name: 'Nostalgia', value: 30 },
           { name: 'Peace', value: 15 },
           { name: 'Neutral', value: 10 }
       ],
       themes: ['Family Gathering', 'Summer', 'Garden'],
       faceCount: 12,
       location: 'Home Exterior'
    };
  }

  try {
    const prompt = `Analyze this collection of photos for a dementia memory therapy app.
    Return a JSON object with:
    1. "emotions": array of objects {name: string, value: number} summing to 100.
    2. "themes": array of 3-5 strings identifying common themes.
    3. "faceCount": estimated total number of faces.
    4. "location": dominant setting (e.g. "Park", "Living Room").
    `;

    const imageParts = base64Images.map(img => {
        const match = img.match(/^data:(.+);base64,(.+)$/);
        return {
            inlineData: {
                mimeType: match ? match[1] : 'image/jpeg',
                data: match ? match[2] : img
            }
        };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            ...imageParts,
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    throw new Error("No text returned");

  } catch (error) {
    console.error("Gemini Collection Analysis Error:", error);
    return null;
  }
};

export const analyzeClockDrawing = async (base64Image: string): Promise<any> => {
  if (!ai) {
    // Mock fallback for offline dev or no API key
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                score: 7,
                findings: ["Contour is wavy but closed", "Numbers 1-12 present but crowding on right", "Hour hand correct, minute hand missing"],
                feedback: "Good recall of numbers. Some spatial planning difficulty observed."
            });
        }, 2000);
    });
  }

  try {
    const match = base64Image.match(/^data:(.+);base64,(.+)$/);
    const mimeType = match ? match[1] : 'image/png';
    const data = match ? match[2] : base64Image;

    const prompt = `
    Analyze this image of a Clock Drawing Test (CDT). The patient was asked to draw a clock face reading 11:10.
    
    Evaluate the drawing based on standard clinical criteria:
    1. Contour (circle integrity).
    2. Numbers (presence of 1-12, correct sequence, spatial layout).
    3. Hands (presence of two hands, correct pointing to 11 and 2).
    
    Return a JSON object with:
    1. "score": integer from 0 to 10 (10 being perfect).
    2. "findings": array of short strings describing specific deficits or strengths (max 3).
    3. "feedback": A single supportive sentence summarizing the clinical observation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
           { inlineData: { mimeType, data } },
           { text: prompt }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    throw new Error("No text returned");
  } catch (error) {
    console.error("Gemini Clock Analysis Error:", error);
    return null;
  }
};

export const evaluateMemoryRecall = async (targetItems: string[], selectedItems: string[]): Promise<any> => {
  if (!ai) {
    // Simple deterministic logic for fallback
    const correct = selectedItems.filter(i => targetItems.includes(i));
    const missed = targetItems.filter(i => !selectedItems.includes(i));
    const intrusions = selectedItems.filter(i => !targetItems.includes(i));
    const accuracy = Math.round((correct.length / targetItems.length) * 100);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                accuracy,
                correctItems: correct,
                missedItems: missed,
                intrusions: intrusions,
                analysis: `Patient identified ${correct.length}/${targetItems.length} items correctly.`
            });
        }, 1500);
    });
  }

  try {
     const prompt = `
      Evaluate a memory recall test (visual recognition).
      Target Items (What was shown): ${targetItems.join(', ')}.
      Selected Items (What patient chose): ${selectedItems.join(', ')}.

      Provide valid JSON output with:
      - accuracy: Percentage 0-100 (number).
      - correctItems: Array of strings (items correctly recalled).
      - missedItems: Array of strings (items missed).
      - intrusions: Array of strings (items selected that were not targets).
      - analysis: A clinical observation sentence. E.g., "Good recognition memory but impulsive selection of distractors."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    throw new Error("No text returned");
  } catch (error) {
    console.error("Recall Eval Error", error);
    return null;
  }
};

export const analyzeSpeechPattern = async (base64Audio: string): Promise<any> => {
  if (!ai) {
     return new Promise((resolve) => {
         setTimeout(() => {
             resolve({
                 pace: 110,
                 clarity: 92,
                 fluencyScore: 88,
                 transcript: "Lions, tigers, bears, elephants, giraffes, zebras, monkeys, dogs, cats, rabbits.",
                 vocabularyRichness: 85
             });
         }, 2000);
     });
  }

  try {
    // Extract mime type and data from base64 string
    const match = base64Audio.match(/^data:(.+);base64,(.+)$/);
    const mimeType = match ? match[1] : 'audio/webm';
    const data = match ? match[2] : base64Audio;

    const prompt = `
      Analyze this audio recording of a cognitive assessment (verbal fluency test - "Name as many animals as you can").
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
          { inlineData: { mimeType, data } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    throw new Error("No text returned");
  } catch (error) {
    console.error("Speech Analysis Error:", error);
    return null;
  }
};

export const generateAdaptiveRoutine = async (assessmentScore: number, recentIssues: string[]): Promise<any> => {
  if (!ai) {
     return {
         focus: "Maintenance",
         schedule: [
             { time: "09:00", activity: "Morning Stretch", type: "Physical", duration: 15 },
             { time: "10:30", activity: "Puzzles", type: "Cognitive", duration: 20 },
             { time: "14:00", activity: "Garden Walk", type: "Calming", duration: 30 }
         ]
     };
  }

  try {
     const prompt = `
        Create a personalized daily routine for a dementia patient based on their recent assessment.
        
        Assessment Score: ${assessmentScore}/100
        Recent Issues: ${recentIssues.join(', ') || "None"}

        The routine should balance cognitive stimulation, physical activity, and rest.
        If score is low (<60), focus on simple, familiar tasks and more rest.
        If score is high (>80), include more challenging cognitive tasks.

        Return JSON:
        {
           "focus": "string (e.g. Cognitive Strengthening, Anxiety Reduction)",
           "schedule": [
              { "time": "HH:MM", "activity": "string", "type": "Cognitive"|"Physical"|"Calming"|"Social", "duration": number (mins) }
           ]
        }
     `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    return JSON.parse(response.text || '{}');
  } catch(error) {
      console.error("Routine Gen Error", error);
      return null;
  }
}