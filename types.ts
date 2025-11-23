
export interface SensorReadings {
  acetone: number; // ppm
  ammonia: number; // ppm
  sulfur: number; // ppm
  ethanol: number; // ppm
  ether: number; // ppm
  hydrogen: number; // ppm
  methane: number; // ppm
  isoprene: number; // ppb
  carbonMonoxide: number; // ppm
  nitricOxide: number; // ppb
  temperature: number; // Celsius
  humidity: number; // %
  timestamp: number;
}

export interface DiseaseLikelihood {
  name: string;
  probability: number; // 0-100%
}

export interface BiomarkerInsight {
  name: string;
  value: number;
  unit: string;
  status: 'Normal' | 'Elevated' | 'Critical';
  interpretation: string;
}

export interface AnalysisReport {
  id: string;
  timestamp: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  summary: string;
  diseases: DiseaseLikelihood[];
  explanation: string;
  recommendation: string;
  biomarkerInsights: BiomarkerInsight[];
}

export interface SymptomState {
  thirst: boolean;
  fatigue: boolean;
  frequentUrination: boolean;
  nausea: boolean;
  dizziness: boolean;
  confusion: boolean;
  abdominalPain: boolean;
  shortnessOfBreath: boolean;
  chestPain: boolean;
  nightSweats: boolean;
  unexplainedWeightLoss: boolean;
  dryCough: boolean;
}

export interface ThresholdConfig {
  warning: number;
  critical: number;
}

export type AppThresholds = {
  acetone: ThresholdConfig;
  ammonia: ThresholdConfig;
  sulfur: ThresholdConfig;
  ethanol: ThresholdConfig;
  ether: ThresholdConfig;
  hydrogen: ThresholdConfig;
  methane: ThresholdConfig;
  isoprene: ThresholdConfig;
  carbonMonoxide: ThresholdConfig;
  nitricOxide: ThresholdConfig;
};

export const DEFAULT_THRESHOLDS: AppThresholds = {
  acetone: { warning: 1.8, critical: 5.0 }, // Diabetes
  ammonia: { warning: 0.8, critical: 2.0 }, // Kidney/Liver
  sulfur: { warning: 0.5, critical: 1.0 }, // Infection
  ethanol: { warning: 50, critical: 200 }, // Intoxication
  ether: { warning: 10, critical: 50 }, // Chemical Exposure
  hydrogen: { warning: 20, critical: 50 }, // SIBO
  methane: { warning: 10, critical: 30 }, // SIBO (Constipation)
  isoprene: { warning: 200, critical: 500 }, // Stress/Cholesterol (ppb)
  carbonMonoxide: { warning: 5, critical: 9 }, // Smoker/Pollution (ppm)
  nitricOxide: { warning: 25, critical: 50 }, // Asthma/Inflammation (ppb)
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  age?: number;
  weight?: number;
}
