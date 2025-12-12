import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface PatientContext {
  moodTrend: string; // e.g., "Declining", "Stable"
  sleepScore: number; // 0-100
  activityLevel: string; // "Low", "Moderate", "High"
  hrv: number; // Heart Rate Variability
  recentInteractions: string[]; // e.g., ["Argument with family", "Refused meal"]
  medicationAdherence: boolean;
}

export const predictAgitationRisk = async (data: PatientContext) => {
    try {
        const prompt = `
            Act as a medical predictive analytics model for dementia care.
            Analyze the following patient data to predict agitation risk for the next 24 hours.

            Patient Data:
            - Mood Trend: ${data.moodTrend}
            - Sleep Quality Score: ${data.sleepScore}/100
            - Activity Level: ${data.activityLevel}
            - HRV (ms): ${data.hrv}
            - Recent Interactions: ${JSON.stringify(data.recentInteractions)}
            - Medication Adherence: ${data.medicationAdherence ? 'Yes' : 'No'}

            Output a JSON object with:
            1. "riskScore": integer 0-100.
            2. "riskLabel": "Low", "Moderate", or "High".
            3. "contributingFactors": Array of strings explaining why (e.g., "High HRV variability", "Poor sleep").
            4. "forecast": Array of objects representing 4-hour blocks for the next 24h. Format: [{"time": "12:00", "riskLevel": 40}, ...].
            5. "recommendedInterventions": Array of strings.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const text = response.text;
        if (!text) throw new Error("No prediction generated");
        return JSON.parse(text);
    } catch (error) {
        console.error("Prediction Error:", error);
        return { 
            riskScore: 0, 
            riskLabel: "Unknown", 
            error: "Failed to generate prediction" 
        };
    }
};

export const analyzeAgitationPatterns = async (historyLogs: any[]) => {
    try {
        // limit logs to prevent token overflow
        const recentLogs = historyLogs.slice(0, 50); 
        
        const prompt = `
            Analyze these historical patient logs to identify agitation patterns.
            Logs: ${JSON.stringify(recentLogs)}

            Output JSON:
            1. "heatmap": Array of objects for a week { day: "Mon", morning: number, afternoon: number, evening: number, night: number } where numbers are 0-100 intensity.
            2. "triggers": Array of strings (e.g., "Loud noises", "Sundowning", "Missed medication").
            3. "weeklyTrend": String description of the trend.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const text = response.text;
        if (!text) throw new Error("No pattern analysis generated");
        return JSON.parse(text);
    } catch (error) {
         console.error("Pattern Analysis Error:", error);
         return { heatmap: [], triggers: ["Insufficient data"] };
    }
};