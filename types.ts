export interface SensorReadings {
  acetone: number; // ppm
  ammonia: number; // ppm
  sulfur: number; // ppm
  ethanol: number; // ppm
  temperature: number; // Celsius
  humidity: number; // %
  timestamp: number;
}

export interface DiseaseLikelihood {
  name: string;
  probability: number; // 0-100%
}

export interface AnalysisReport {
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  summary: string;
  diseases: DiseaseLikelihood[];
  explanation: string;
  recommendation: string;
}

export interface SymptomState {
  thirst: boolean;
  fatigue: boolean;
  frequentUrination: boolean;
  nausea: boolean;
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
};

export const DEFAULT_THRESHOLDS: AppThresholds = {
  acetone: { warning: 1.8, critical: 5.0 }, // Diabetes
  ammonia: { warning: 0.8, critical: 2.0 }, // Kidney/Liver
  sulfur: { warning: 0.5, critical: 1.0 }, // Infection
  ethanol: { warning: 50, critical: 200 }, // Intoxication
};