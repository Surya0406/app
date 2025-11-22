import { GoogleGenAI, Type } from "@google/genai";
import { SensorReadings, SymptomState, AnalysisReport, AppThresholds, DEFAULT_THRESHOLDS } from '../types';

const MODEL_NAME = "gemini-2.5-flash";

export const analyzeBreathData = async (
  readings: SensorReadings,
  symptoms: SymptomState,
  thresholds: AppThresholds = DEFAULT_THRESHOLDS
): Promise<AnalysisReport> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    const symptomList = Object.entries(symptoms)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(", ");

    const prompt = `
      You are OdourSense AI, a specialized medical diagnostic assistant.
      
      Analyze the following RUN-TIME SENSOR INPUTS (biomarkers) and user-reported Symptoms to determine the probability of specific diseases.
      
      INPUT DATA SNAPSHOT:
      - Acetone: ${readings.acetone.toFixed(2)} ppm (User defined critical threshold: > ${thresholds.acetone.critical})
      - Ammonia: ${readings.ammonia.toFixed(2)} ppm (User defined critical threshold: > ${thresholds.ammonia.critical})
      - Sulfur Compounds: ${readings.sulfur.toFixed(2)} ppm (User defined critical threshold: > ${thresholds.sulfur.critical})
      - Ethanol: ${readings.ethanol.toFixed(2)} ppm (User defined critical threshold: > ${thresholds.ethanol.critical})
      - Environmental: ${readings.temperature.toFixed(1)}°C, ${readings.humidity.toFixed(1)}% Humidity

      REPORTED SYMPTOMS: ${symptomList || "None reported"}

      TASK:
      1. Provide a differential diagnosis based on the inputs.
      2. For each possible disease, estimate a PROBABILITY PERCENTAGE (0-100%) based on the strength of the biomarker correlation.
         - Example: Acetone 4.0ppm + Thirst = Diabetes (95%)
         - Example: Low markers = Healthy (98%)
      3. Determine the overall urgency/risk level.
      4. EXPLAINABLE AI REQUIREMENT: In the 'explanation' field, you MUST explicitly cite the specific sensor values and compare them to their thresholds to justify the diagnosis.
         - Format example: "Acetone levels (X.XX ppm) significantly exceeded the critical threshold of ${thresholds.acetone.critical} ppm, which is the primary indicator for..."
         - Be specific about WHY the risk is High/Low.
      
      REFERENCE THRESHOLDS (CONFIGURED BY USER):
      - Acetone: Warning ${thresholds.acetone.warning}, Critical ${thresholds.acetone.critical}
      - Ammonia: Warning ${thresholds.ammonia.warning}, Critical ${thresholds.ammonia.critical}
      - Sulfur: Warning ${thresholds.sulfur.warning}, Critical ${thresholds.sulfur.critical}
      
      Return a JSON response.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ["Low", "Moderate", "High", "Critical"] },
            summary: { type: Type.STRING, description: "Short headline of the finding, e.g., 'Possible Early-Stage Diabetes'" },
            diseases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  probability: { type: Type.NUMBER, description: "Probability in percentage (0-100)" }
                }
              }
            },
            explanation: { 
                type: Type.STRING, 
                description: "Detailed medical reasoning. CRITICAL: You must explicitly state which values crossed which thresholds." 
            },
            recommendation: { type: Type.STRING }
          },
          required: ["riskLevel", "summary", "diseases", "explanation", "recommendation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisReport;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      riskLevel: "Low",
      summary: "Analysis Failed",
      diseases: [],
      explanation: "The AI service is currently unavailable or the API key is missing. Please check your connection.",
      recommendation: "Retry analysis."
    };
  }
};