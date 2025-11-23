
import { SensorReadings, SymptomState, AnalysisReport, AppThresholds, DEFAULT_THRESHOLDS, DiseaseLikelihood, BiomarkerInsight } from '../types';
import { getAverageReadings } from './dbService';

export const analyzeBreathData = async (
  readings: SensorReadings,
  symptoms: SymptomState,
  thresholds: AppThresholds = DEFAULT_THRESHOLDS
): Promise<AnalysisReport> => {

  // Simulate AI Processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  const diseases: DiseaseLikelihood[] = [];
  const insights: BiomarkerInsight[] = [];
  
  // Get historical baseline for trend analysis
  const historicalAverages = getAverageReadings();

  // --- HELPER: Analyze Single Biomarker ---
  const evaluateBiomarker = (
    name: string, 
    val: number, 
    cfg: { warning: number, critical: number },
    descriptions: { normal: string, elevated: string, critical: string },
    unit: string = 'ppm'
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

    // Historical Context Logic
    if (historicalAverages && historicalAverages[name]) {
        const avg = historicalAverages[name];
        // Calculate % difference
        const diff = val - avg;
        const pctChange = avg > 0 ? (diff / avg) * 100 : 0;
        
        if (pctChange > 25 && status === 'Normal') {
            interpretation += ` NOTE: Value is ${pctChange.toFixed(0)}% higher than your personal baseline.`;
        } else if (pctChange > 50) {
            interpretation += ` TREND ALERT: Significant spike (+${pctChange.toFixed(0)}%) compared to history.`;
        }
    }

    return { name, value: val, unit, status, interpretation };
  };

  // --- 1. BIOMARKER BREAKDOWN ANALYSIS ---

  const acetone = evaluateBiomarker('Acetone', readings.acetone, thresholds.acetone, {
      normal: "Healthy lipid metabolism.",
      elevated: "Lipolysis detected. Potential fasting or pre-diabetes.",
      critical: "High volatility. Risk of Ketoacidosis (DKA)."
  }, 'ppm');
  
  const ammonia = evaluateBiomarker('Ammonia', readings.ammonia, thresholds.ammonia, {
      normal: "Normal urea cycle.",
      elevated: "Protein metabolism imbalance / early hepatic stress.",
      critical: "Toxic levels. Severe liver/kidney dysfunction risk."
  }, 'ppm');

  const sulfur = evaluateBiomarker('Sulfur', readings.sulfur, thresholds.sulfur, {
      normal: "No bacterial overgrowth.",
      elevated: "VSCs present. Suggests oral/throat infection.",
      critical: "High VSCs. Indicator of H. pylori or periodontal disease."
  }, 'ppm');

  const ethanol = evaluateBiomarker('Ethanol', readings.ethanol, thresholds.ethanol, {
      normal: "No alcohol metabolites.",
      elevated: "Trace metabolites (Fermentation/Ingestion).",
      critical: "High toxicity. Intoxication or Auto-Brewery Syndrome."
  }, 'ppm');

  const ether = evaluateBiomarker('Ether', readings.ether, thresholds.ether, {
      normal: "No chemical traces detected.",
      elevated: "Trace exposure. Check environment for solvents.",
      critical: "Dangerous exposure levels. Respiratory risk."
  }, 'ppm');

  const hydrogen = evaluateBiomarker('Hydrogen', readings.hydrogen, thresholds.hydrogen, {
      normal: "Normal gut fermentation.",
      elevated: "Rapid carbohydrate fermentation in small intestine.",
      critical: "Strong indicator of SIBO (Hydrogen-dominant)."
  }, 'ppm');

  const methane = evaluateBiomarker('Methane', readings.methane, thresholds.methane, {
      normal: "Normal archaea activity.",
      elevated: "Slowed transit time indicated.",
      critical: "Strong indicator of SIBO (Methane-dominant) / IMO."
  }, 'ppm');

  // NEW GASES
  const isoprene = evaluateBiomarker('Isoprene', readings.isoprene, thresholds.isoprene, {
      normal: "Normal cholesterol synthesis.",
      elevated: "Elevated metabolic stress or cholesterol synthesis.",
      critical: "High oxidative stress. Potential severe sleep apnea indicator."
  }, 'ppb');

  const carbonMonoxide = evaluateBiomarker('Carbon Monoxide', readings.carbonMonoxide, thresholds.carbonMonoxide, {
      normal: "Normal environmental levels.",
      elevated: "Exposure detected (Passive smoke / City pollution).",
      critical: "Toxic exposure. Potential localized combustion leak."
  }, 'ppm');

  const nitricOxide = evaluateBiomarker('Nitric Oxide', readings.nitricOxide, thresholds.nitricOxide, {
      normal: "Healthy airway inflammation levels.",
      elevated: "Mild airway inflammation detected.",
      critical: "Severe airway inflammation. strong asthma/allergy indicator."
  }, 'ppb');

  insights.push(acetone, ammonia, sulfur, ethanol, ether, hydrogen, methane, isoprene, carbonMonoxide, nitricOxide);


  // --- 2. DISEASE PROBABILITY CALCULATION (Weighted Scoring) ---

  // Diabetes (Acetone)
  let diabetesScore = 0;
  if (acetone.status === 'Critical') diabetesScore += 80;
  else if (acetone.status === 'Elevated') diabetesScore += 40;
  if (symptoms.thirst) diabetesScore += 15;
  if (symptoms.frequentUrination) diabetesScore += 15;
  if (symptoms.confusion) diabetesScore += 10;
  if (symptoms.unexplainedWeightLoss) diabetesScore += 20;
  if (diabetesScore > 25) {
      diseases.push({ 
          name: diabetesScore > 75 ? "Diabetic Ketoacidosis (DKA)" : "Hyperglycemia / Pre-Diabetes", 
          probability: Math.min(99, diabetesScore) 
      });
  }

  // Kidney/Liver (Ammonia)
  let renalScore = 0;
  if (ammonia.status === 'Critical') renalScore += 85;
  else if (ammonia.status === 'Elevated') renalScore += 50;
  if (symptoms.confusion) renalScore += 20;
  if (symptoms.nausea) renalScore += 15;
  if (symptoms.fatigue) renalScore += 10;
  if (renalScore > 25) {
      diseases.push({ name: "Hepatic or Renal Insufficiency", probability: Math.min(99, renalScore) });
  }

  // SIBO (Hydrogen/Methane)
  let siboScore = 0;
  if (hydrogen.status === 'Critical' || methane.status === 'Critical') siboScore += 80;
  else if (hydrogen.status === 'Elevated' || methane.status === 'Elevated') siboScore += 40;
  if (symptoms.abdominalPain) siboScore += 20;
  if (symptoms.nausea) siboScore += 10;
  if (siboScore > 25) {
      diseases.push({ 
          name: methane.status === 'Critical' ? "Intestinal Methanogen Overgrowth (IMO)" : "Small Intestinal Bacterial Overgrowth (SIBO)", 
          probability: Math.min(95, siboScore) 
      });
  }

  // Asthma / Airway (Nitric Oxide)
  let asthmaScore = 0;
  if (nitricOxide.status === 'Critical') asthmaScore += 85;
  else if (nitricOxide.status === 'Elevated') asthmaScore += 50;
  if (symptoms.shortnessOfBreath) asthmaScore += 20;
  if (symptoms.dryCough) asthmaScore += 20;
  if (symptoms.chestPain) asthmaScore += 10;
  if (asthmaScore > 25) {
      diseases.push({ name: "Eosinophilic Airway Inflammation / Asthma", probability: Math.min(98, asthmaScore) });
  }

  // Cardiovascular / Stress (Isoprene)
  let cardioScore = 0;
  if (isoprene.status === 'Critical') cardioScore += 60;
  else if (isoprene.status === 'Elevated') cardioScore += 30;
  if (symptoms.chestPain) cardioScore += 30;
  if (symptoms.shortnessOfBreath) cardioScore += 10;
  if (symptoms.nightSweats) cardioScore += 20;
  if (cardioScore > 35) {
       diseases.push({ name: "Metabolic Stress / Cardiovascular Risk", probability: Math.min(85, cardioScore) });
  }

  // Chemical Exposure / Poisoning
  let chemScore = 0;
  if (ether.status !== 'Normal' || carbonMonoxide.status !== 'Normal') chemScore += 60;
  if (carbonMonoxide.status === 'Critical') chemScore += 30;
  if (symptoms.dizziness) chemScore += 20;
  if (symptoms.confusion) chemScore += 20;
  if (chemScore > 30) {
      diseases.push({ name: "Environmental Toxicity / CO Exposure", probability: Math.min(99, chemScore) });
  }

  // Infection (Sulfur)
  let infectionScore = 0;
  if (sulfur.status === 'Critical') infectionScore += 80;
  else if (sulfur.status === 'Elevated') infectionScore += 45;
  if (symptoms.nightSweats) infectionScore += 20;
  if (infectionScore > 25) {
      diseases.push({ name: "H. Pylori / Gastric Infection", probability: Math.min(95, infectionScore) });
  }

  // Default
  if (diseases.length === 0) {
      diseases.push({ name: "Metabolically Healthy", probability: 98 });
  }
  
  diseases.sort((a, b) => b.probability - a.probability);

  // --- 3. REPORT GENERATION ---

  const maxProb = diseases[0].probability;
  const primaryCondition = diseases[0].name;

  let riskLevel: AnalysisReport['riskLevel'] = 'Low';
  let summary = "Normal Health Profile";

  if (maxProb >= 80 && !primaryCondition.includes('Healthy')) {
      riskLevel = 'Critical';
      summary = `Critical Warning: ${primaryCondition}`;
  } else if (maxProb >= 50 && !primaryCondition.includes('Healthy')) {
      riskLevel = 'High';
      summary = `High Likelihood of ${primaryCondition}`;
  } else if (maxProb >= 25 && !primaryCondition.includes('Healthy')) {
      riskLevel = 'Moderate';
      summary = "Metabolic Irregularities Detected";
  }

  // --- EXPLANATION ---
  const explanationLines: string[] = [];
  explanationLines.push(`**Diagnosis based on current inputs and patient history:**`);
  explanationLines.push(`Highest probability condition: **${primaryCondition} (${maxProb}%)**.`);
  
  const abnormal = insights.filter(i => i.status !== 'Normal');
  if (abnormal.length > 0) {
      explanationLines.push("\n**Biomarker Drivers:**");
      abnormal.forEach(i => {
          explanationLines.push(`- **${i.name}** is ${i.status} (${i.value.toFixed(1)} ${i.unit}). ${i.interpretation}`);
      });
  }

  const activeSymptoms = Object.entries(symptoms).filter(([_, v]) => v).map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase());
  if (activeSymptoms.length > 0) {
      explanationLines.push(`\n**Clinical Correlation:** Symptoms (${activeSymptoms.join(', ')}) align with the biomarker profile.`);
  }

  // --- RECOMMENDATIONS ---
  const recommendations: string[] = [];

  if (riskLevel === 'Critical') recommendations.push("URGENT: Proceed to emergency care immediately.");
  
  if (primaryCondition.includes("SIBO") || primaryCondition.includes("IMO")) {
      recommendations.push("Gastroenterology: Schedule a Hydrogen/Methane Breath Test (HMBT).");
      recommendations.push("Diet: Consider Low-FODMAP diet intervention.");
  }
  if (primaryCondition.includes("Diabetes")) {
      recommendations.push("Endocrinology: Immediate blood glucose check required.");
      recommendations.push("Hydration: Increase water intake to flush ketones.");
  }
  if (primaryCondition.includes("Toxicity") || primaryCondition.includes("CO Exposure")) {
      recommendations.push("Safety: Evacuate current environment immediately.");
      recommendations.push("Emergency: Check for gas leaks or combustion sources.");
  }
  if (primaryCondition.includes("Asthma") || primaryCondition.includes("Airway")) {
      recommendations.push("Pulmonology: FeNO test recommended.");
      recommendations.push("Monitor: Track peak flow variability.");
  }
  if (primaryCondition.includes("Cardiovascular")) {
      recommendations.push("Cardiology: Schedule a lipid profile and stress test.");
      recommendations.push("Lifestyle: Review sleep apnea potential.");
  }
  if (primaryCondition.includes("Hepatic")) {
      recommendations.push("Lab: Liver Function Panel (ALT/AST).");
  }

  if (recommendations.length === 0) recommendations.push("Maintain current healthy lifestyle protocols.");

  return {
    id: Date.now().toString(),
    timestamp: Date.now(),
    riskLevel,
    summary,
    diseases,
    explanation: explanationLines.join("\n"),
    recommendation: recommendations.join("||"),
    biomarkerInsights: insights
  };
};
