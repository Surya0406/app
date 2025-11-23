
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
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
      .join(", ");

    const prompt = `
      You are OdourSense AI, a specialized medical diagnostic assistant.
      
      Analyze the following RUN-TIME SENSOR INPUTS (biomarkers) and user-reported Symptoms to determine the probability of specific diseases.
      
      INPUT DATA SNAPSHOT:
      - Acetone: ${readings.acetone.toFixed(2)} ppm (Threshold: > ${thresholds.acetone.critical})
      - Ammonia: ${readings.ammonia.toFixed(2)} ppm (Threshold: > ${thresholds.ammonia.critical})
      - Sulfur Compounds: ${readings.sulfur.toFixed(2)} ppm (Threshold: > ${thresholds.sulfur.critical})
      - Ethanol: ${readings.ethanol.toFixed(2)} ppm (Threshold: > ${thresholds.ethanol.critical})
      - Ether: ${readings.ether.toFixed(2)} ppm (Threshold: > ${thresholds.ether.critical})
      - Hydrogen: ${readings.hydrogen.toFixed(2)} ppm (Threshold: > ${thresholds.hydrogen.critical})
      - Methane: ${readings.methane.toFixed(2)} ppm (Threshold: > ${thresholds.methane.critical})
      - Isoprene: ${readings.isoprene.toFixed(2)} ppb (Threshold: > ${thresholds.isoprene.critical})
      - Nitric Oxide: ${readings.nitricOxide.toFixed(2)} ppb (Threshold: > ${thresholds.nitricOxide.critical})
      - Carbon Monoxide: ${readings.carbonMonoxide.toFixed(2)} ppm (Threshold: > ${thresholds.carbonMonoxide.critical})
      - Environmental: ${readings.temperature.toFixed(1)}°C, ${readings.humidity.toFixed(1)}% Humidity

      REPORTED SYMPTOMS: ${symptomList || "None reported"}

      TASK:
      1. Provide a differential diagnosis based on the inputs.
      2. For each possible disease, estimate a PROBABILITY PERCENTAGE (0-100%) based on the strength of the biomarker correlation.
      3. Determine the overall urgency/risk level.
      4. EXPLAINABLE AI REQUIREMENT: In the 'explanation' field, you MUST explicitly cite the specific sensor values and compare them to their thresholds.
      5. Provide structured insights for each biomarker.
      
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
            recommendation: { type: Type.STRING },
            biomarkerInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['Normal', 'Elevated', 'Critical'] },
                  interpretation: { type: Type.STRING }
                },
                required: ["name", "value", "unit", "status", "interpretation"]
              }
            }
          },
          required: ["riskLevel", "summary", "diseases", "explanation", "recommendation", "biomarkerInsights"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const analysis = JSON.parse(text);

    return {
      ...analysis,
      id: Date.now().toString(),
      timestamp: Date.now()
    } as AnalysisReport;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      riskLevel: "Low",
      summary: "Analysis Failed",
      diseases: [],
      explanation: "The AI service is currently unavailable or the API key is missing. Please check your connection.",
      recommendation: "Retry analysis.",
      biomarkerInsights: []
    };
  }
};
