import { SensorReadings, SymptomState, AnalysisReport, AppThresholds, DEFAULT_THRESHOLDS, DiseaseLikelihood, BiomarkerInsight } from '../types';

// This service implements a Rule-Based Expert System for medical diagnostics.
// It mimics the logic of a Python-based classifier (like Decision Trees) to provide detailed analysis.

export const analyzeBreathData = async (
  readings: SensorReadings,
  symptoms: SymptomState,
  thresholds: AppThresholds = DEFAULT_THRESHOLDS
): Promise<AnalysisReport> => {

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800));

  const diseases: DiseaseLikelihood[] = [];
  const insights: BiomarkerInsight[] = [];
  
  // --- HELPER: Analyze Single Biomarker ---
  const evaluateBiomarker = (
    name: string, 
    val: number, 
    cfg: { warning: number, critical: number },
    descriptions: { normal: string, elevated: string, critical: string }
  ): BiomarkerInsight => {
    let status: BiomarkerInsight['status'] = 'Normal';
    let interpretation = descriptions.normal;

    if (val > cfg.critical) {
        status = 'Critical';
        interpretation = descriptions.critical;
    } else if (val > cfg.warning) {
        status = 'Elevated';
        interpretation = descriptions.elevated;
    }

    return { name, value: val, unit: 'ppm', status, interpretation };
  };

  // --- 1. BIOMARKER BREAKDOWN ANALYSIS ---

  // Acetone
  const acetoneInsight = evaluateBiomarker(
      'Acetone', 
      readings.acetone, 
      thresholds.acetone, 
      {
          normal: "Levels indicate efficient lipid metabolism and insulin regulation.",
          elevated: "Elevated levels suggest metabolic shift towards lipolysis. Monitor for hyperglycemia.",
          critical: "CRITICAL: High volatility indicates potential Diabetic Ketoacidosis (DKA)."
      }
  );
  insights.push(acetoneInsight);

  // Ammonia
  const ammoniaInsight = evaluateBiomarker(
      'Ammonia', 
      readings.ammonia, 
      thresholds.ammonia, 
      {
          normal: "Within healthy range. Normal urea cycle function.",
          elevated: "Elevated. Potential indication of protein metabolism imbalance or early hepatic stress.",
          critical: "CRITICAL: Toxic levels detected. Strong correlation with severe liver or kidney dysfunction."
      }
  );
  insights.push(ammoniaInsight);

  // Sulfur
  const sulfurInsight = evaluateBiomarker(
      'Sulfur Compounds', 
      readings.sulfur, 
      thresholds.sulfur, 
      {
          normal: "No bacterial overgrowth detected.",
          elevated: "Presence of volatile sulfur compounds (VSCs). Suggests poor oral hygiene or throat infection.",
          critical: "High concentration of VSCs. Strong indicator of H. pylori infection or severe periodontal disease."
      }
  );
  insights.push(sulfurInsight);

  // Ethanol
  const ethanolInsight = evaluateBiomarker(
      'Ethanol', 
      readings.ethanol, 
      thresholds.ethanol, 
      {
          normal: "No significant alcohol metabolites detected.",
          elevated: "Trace alcohol metabolites detected. Possible fermentation syndrome or recent ingestion.",
          critical: "High toxicity. Indicates intoxication or severe Auto-Brewery Syndrome."
      }
  );
  insights.push(ethanolInsight);


  // --- 2. DISEASE PROBABILITY CALCULATION (Weighted Scoring) ---

  // Diabetes Risk
  let diabetesScore = 0;
  if (acetoneInsight.status === 'Critical') diabetesScore += 80;
  else if (acetoneInsight.status === 'Elevated') diabetesScore += 40;
  
  // Symptom correlation
  if (symptoms.thirst) diabetesScore += 15;
  if (symptoms.frequentUrination) diabetesScore += 15;
  if (symptoms.fatigue) diabetesScore += 5;
  
  if (diabetesScore > 25) {
      diseases.push({ 
          name: diabetesScore > 75 ? "Diabetes (Ketoacidosis)" : "Pre-Diabetes / Hyperglycemia", 
          probability: Math.min(99, diabetesScore) 
      });
  }

  // Kidney/Liver Risk
  let renalScore = 0;
  if (ammoniaInsight.status === 'Critical') renalScore += 85;
  else if (ammoniaInsight.status === 'Elevated') renalScore += 50;

  if (symptoms.nausea) renalScore += 20;
  if (symptoms.fatigue) renalScore += 10;

  if (renalScore > 25) {
      diseases.push({ 
          name: "Renal or Hepatic Insufficiency", 
          probability: Math.min(99, renalScore) 
      });
  }

  // Infection Risk
  let infectionScore = 0;
  if (sulfurInsight.status === 'Critical') infectionScore += 80;
  else if (sulfurInsight.status === 'Elevated') infectionScore += 45;
  
  if (infectionScore > 25) {
      diseases.push({ name: "Bacterial Infection (Oral/Gastric)", probability: Math.min(95, infectionScore) });
  }

  // Intoxication
  if (ethanolInsight.status !== 'Normal') {
      const p = ethanolInsight.status === 'Critical' ? 95 : 55;
      diseases.push({ name: "Alcohol Intoxication", probability: p });
  }

  // Default Healthy
  if (diseases.length === 0) {
      diseases.push({ name: "Metabolically Healthy", probability: 98 });
  }
  
  diseases.sort((a, b) => b.probability - a.probability);

  // --- 3. REPORT GENERATION ---

  const maxProb = diseases[0].probability;
  const primaryCondition = diseases[0].name;

  let riskLevel: AnalysisReport['riskLevel'] = 'Low';
  let summary = "Normal Health Profile";

  if (maxProb >= 80 && primaryCondition !== 'Metabolically Healthy') {
      riskLevel = 'Critical';
      summary = `Critical Risk: ${primaryCondition}`;
  } else if (maxProb >= 50 && primaryCondition !== 'Metabolically Healthy') {
      riskLevel = 'High';
      summary = `High Probability of ${primaryCondition}`;
  } else if (maxProb >= 25 && primaryCondition !== 'Metabolically Healthy') {
      riskLevel = 'Moderate';
      summary = "Abnormal Metabolic Signs Detected";
  }

  // --- DETAILED EXPLANATION GENERATION ---
  const explanationLines: string[] = [];

  // Section 1: Primary Diagnosis Reasoning
  explanationLines.push(`**Primary Diagnosis:** The AI model has identified a ${maxProb}% probability of ${primaryCondition}.`);
  explanationLines.push("");
  explanationLines.push("**Biomarker Correlation:**");
  
  insights.filter(i => i.status !== 'Normal').forEach(i => {
      explanationLines.push(`• **${i.name}:** Detected at ${i.value.toFixed(2)} ppm, which exceeds the ${i.status === 'Critical' ? 'critical safety limit' : 'warning threshold'} of ${i.status === 'Critical' ? thresholds[i.name.toLowerCase().split(' ')[0] as keyof AppThresholds].critical : thresholds[i.name.toLowerCase().split(' ')[0] as keyof AppThresholds].warning} ppm.`);
      explanationLines.push(`   _Medical Implication:_ ${i.interpretation}`);
  });

  if (insights.every(i => i.status === 'Normal')) {
      explanationLines.push("• All monitored volatile organic compounds (VOCs) are within standard physiological ranges.");
      explanationLines.push("• No immediate signs of metabolic distress or organ dysfunction were detected in the breath analysis.");
  }

  explanationLines.push("");

  // Section 2: Symptom Correlation
  const activeSymptoms = Object.entries(symptoms).filter(([_, v]) => v).map(([k]) => k);
  if (activeSymptoms.length > 0) {
      explanationLines.push("**Symptom Integration:**");
      explanationLines.push(`The patient reported: ${activeSymptoms.join(', ')}.`);
      
      if (primaryCondition.includes("Diabetes") && symptoms.thirst) {
          explanationLines.push("• The presence of excessive thirst (Polydipsia) strongly correlates with the elevated Acetone levels, reinforcing the likelihood of Hyperglycemia.");
      }
      if (primaryCondition.includes("Renal") && symptoms.fatigue) {
          explanationLines.push("• Chronic fatigue combined with elevated Ammonia is a classic clinical presentation of reduced toxin filtration by the liver or kidneys.");
      }
      if (primaryCondition.includes("Healthy")) {
          explanationLines.push("• While symptoms were reported, biomarker data does not currently support a metabolic cause. Consider external factors (stress, sleep, hydration).");
      }
  } else {
       explanationLines.push("**Symptom Integration:**");
       explanationLines.push("No subjective symptoms were reported, relying solely on objective biomarker quantification.");
  }


  // --- RECOMMENDATION GENERATION ---
  const recommendations: string[] = [];

  // Critical Action Items
  if (riskLevel === 'Critical') {
      recommendations.push("URGENT: Seek immediate medical evaluation at an emergency facility.");
  }

  // Specific Clinical Tests
  if (primaryCondition.includes("Diabetes")) {
      recommendations.push("Clinical Test: Measure fasting blood glucose and HbA1c immediately.");
      recommendations.push("Clinical Test: Check urine ketones.");
  } else if (primaryCondition.includes("Renal") || primaryCondition.includes("Hepatic")) {
      recommendations.push("Clinical Test: Perform a comprehensive Liver Function Test (LFT) and Kidney Function Test (KFT).");
      recommendations.push("Clinical Test: Measure blood urea nitrogen (BUN) levels.");
  } else if (primaryCondition.includes("Infection")) {
      recommendations.push("Clinical Test: Urea Breath Test for H. pylori.");
      recommendations.push("Consultation: Schedule a dental examination for periodontal assessment.");
  }

  // Lifestyle & Dietary
  if (acetoneInsight.status !== 'Normal') {
      recommendations.push("Lifestyle: Increase water intake immediately to assist in ketone flushing.");
      recommendations.push("Diet: Avoid high-carbohydrate meals until glucose levels are verified.");
  }
  if (ammoniaInsight.status !== 'Normal') {
      recommendations.push("Diet: Temporarily restrict high-protein foods (red meat) to reduce ammonia production.");
      recommendations.push("Lifestyle: Strictly avoid alcohol consumption.");
  }
  if (readings.humidity < 40) {
      recommendations.push("Environment: Low humidity detected; ensure adequate hydration to prevent mucosal drying.");
  }

  // General fallback
  if (recommendations.length === 0) {
      recommendations.push("Standard Protocol: Maintain a balanced diet and adequate hydration.");
      recommendations.push("Monitoring: Re-test with OdourSense AI in 7 days to establish a longitudinal baseline.");
  }

  return {
    riskLevel,
    summary,
    diseases,
    explanation: explanationLines.join("\n"),
    recommendation: recommendations.join("||"), // Use delimiter for easier parsing in UI
    biomarkerInsights: insights
  };
};