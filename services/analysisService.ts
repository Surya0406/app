import { SensorReadings, SymptomState, AnalysisReport, AppThresholds, DEFAULT_THRESHOLDS, DiseaseLikelihood } from '../types';

// This service replaces the Gemini API with a local Expert System (Rule-based AI)
// It evaluates biomarkers against configured thresholds and correlates them with symptoms.

export const analyzeBreathData = async (
  readings: SensorReadings,
  symptoms: SymptomState,
  thresholds: AppThresholds = DEFAULT_THRESHOLDS
): Promise<AnalysisReport> => {

  // Simulate processing delay for realistic "AI Analysis" UX
  await new Promise(resolve => setTimeout(resolve, 1200));

  const diseases: DiseaseLikelihood[] = [];
  let explanations: string[] = [];
  let recommendations: string[] = [];

  // --- 1. DIABETES ANALYSIS (Acetone) ---
  let diabetesProb = 0;
  // Calculate how far above the warning threshold the reading is
  const acetoneRatio = readings.acetone / thresholds.acetone.warning;
  
  if (readings.acetone > thresholds.acetone.critical) {
    diabetesProb = 85;
    explanations.push(`Acetone levels (${readings.acetone.toFixed(2)} ppm) significantly exceed the critical threshold (${thresholds.acetone.critical} ppm).`);
    recommendations.push("Immediate blood glucose test required. Risk of Ketoacidosis.");
  } else if (readings.acetone > thresholds.acetone.warning) {
    // Linear interpolation of probability between warning and critical
    diabetesProb = 40 + Math.min(40, (readings.acetone - thresholds.acetone.warning) * 20);
    explanations.push(`Acetone levels (${readings.acetone.toFixed(2)} ppm) are elevated above the warning threshold (${thresholds.acetone.warning} ppm).`);
    recommendations.push("Monitor blood sugar levels and hydration.");
  } else {
    diabetesProb = 5;
  }

  // Symptom weighting for Diabetes
  if (symptoms.thirst) { 
      diabetesProb += 15; 
      if (readings.acetone > thresholds.acetone.warning) {
        explanations.push("Reported excessive thirst combined with elevated Acetone strongly correlates with Hyperglycemia.");
      }
  }
  if (symptoms.frequentUrination) { 
      diabetesProb += 15; 
      if (readings.acetone > thresholds.acetone.warning) {
        explanations.push("Frequent urination is a key symptom confirming metabolic stress.");
      }
  }
  if (symptoms.fatigue) { diabetesProb += 5; }

  diabetesProb = Math.min(diabetesProb, 99);
  if (diabetesProb > 20) diseases.push({ name: "Diabetes (Ketoacidosis Risk)", probability: Math.round(diabetesProb) });


  // --- 2. KIDNEY/LIVER ANALYSIS (Ammonia) ---
  let kidneyProb = 0;
  if (readings.ammonia > thresholds.ammonia.critical) {
    kidneyProb = 90;
    explanations.push(`Ammonia (${readings.ammonia.toFixed(2)} ppm) is critically high (> ${thresholds.ammonia.critical} ppm), suggesting potential liver or kidney dysfunction.`);
    recommendations.push("Consult a specialist immediately for liver/kidney function tests.");
  } else if (readings.ammonia > thresholds.ammonia.warning) {
    kidneyProb = 60;
    explanations.push(`Ammonia (${readings.ammonia.toFixed(2)} ppm) is above normal limits (> ${thresholds.ammonia.warning} ppm).`);
    recommendations.push("Avoid high-protein meals before re-testing.");
  }

  if (symptoms.nausea) { 
      kidneyProb += 15; 
      if (readings.ammonia > thresholds.ammonia.warning) explanations.push("Nausea typically accompanies elevated ammonia levels.");
  }
  if (symptoms.fatigue) { kidneyProb += 5; }
  
  kidneyProb = Math.min(kidneyProb, 99);
  if (kidneyProb > 20) diseases.push({ name: "Renal/Hepatic Dysfunction", probability: Math.round(kidneyProb) });


  // --- 3. INFECTION (Sulfur) ---
  let infectionProb = 0;
  if (readings.sulfur > thresholds.sulfur.critical) {
    infectionProb = 80;
    explanations.push(`High concentration of Sulfur compounds (${readings.sulfur.toFixed(2)} ppm) detected.`);
    recommendations.push("Check for oral infections, H. pylori, or gum disease.");
  } else if (readings.sulfur > thresholds.sulfur.warning) {
    infectionProb = 45;
    explanations.push(`Sulfur levels (${readings.sulfur.toFixed(2)} ppm) are slightly elevated.`);
  }
  if (infectionProb > 20) diseases.push({ name: "Oral/Respiratory Infection", probability: Math.round(infectionProb) });


  // --- 4. INTOXICATION (Ethanol) ---
  let alcoholProb = 0;
  if (readings.ethanol > thresholds.ethanol.critical) {
    alcoholProb = 95;
    explanations.push(`Ethanol (${readings.ethanol.toFixed(2)} ppm) indicates significant intoxication.`);
    recommendations.push("Do not operate heavy machinery.");
  } else if (readings.ethanol > thresholds.ethanol.warning) {
    alcoholProb = 60;
    explanations.push(`Ethanol traces detected (${readings.ethanol.toFixed(2)} ppm).`);
  }
  if (alcoholProb > 20) diseases.push({ name: "Alcohol Intoxication", probability: Math.round(alcoholProb) });


  // --- DETERMINE RISK LEVEL ---
  const maxProb = Math.max(...diseases.map(d => d.probability), 0);
  let riskLevel: AnalysisReport['riskLevel'] = 'Low';
  let summary = "Healthy Metabolic Profile";

  if (maxProb >= 80) {
    riskLevel = 'Critical';
    summary = "Critical Biomarker Anomaly Detected";
  } else if (maxProb >= 50) {
    riskLevel = 'High';
    summary = "High Risk of Metabolic Disorder";
  } else if (maxProb >= 25) {
    riskLevel = 'Moderate';
    summary = "Elevated Biomarker Levels";
  }

  // Default Case (Healthy)
  if (diseases.length === 0) {
    explanations.push("All biomarker levels are within normal configured thresholds.");
    explanations.push("No significant correlation with reported symptoms found.");
    recommendations.push("Continue maintaining a healthy lifestyle.");
    diseases.push({ name: "Healthy", probability: 98 });
  }

  return {
    riskLevel,
    summary,
    diseases: diseases.sort((a, b) => b.probability - a.probability),
    explanation: explanations.join("\n"),
    recommendation: recommendations.join(" ") || "No specific medical action required."
  };
};