import { SensorReadings } from '../types';

// Simulates reading from an Arduino/ESP32 via Serial/WebSocket
export const generateMockReading = (prev: SensorReadings | null): SensorReadings => {
  const now = Date.now();
  
  if (!prev) {
    return {
      acetone: 0.5,
      ammonia: 0.2,
      sulfur: 0.1,
      ethanol: 0,
      temperature: 36.5,
      humidity: 45,
      timestamp: now,
    };
  }

  // Helper to drift values naturally
  const drift = (val: number, min: number, max: number, volatility: number) => {
    const change = (Math.random() - 0.5) * volatility;
    let newValue = val + change;
    return Math.max(min, Math.min(max, newValue));
  };

  // Simulate environmental baseline drift (Calibration logic)
  // If humidity rises, gas sensors often read slightly higher due to moisture interference.
  // We simulate this raw data drift which the "AI" or "backend" would normally filter.
  const newHumidity = drift(prev.humidity, 30, 80, 2);
  const humidityFactor = newHumidity > 60 ? 1.05 : 1.0; 

  return {
    acetone: drift(prev.acetone, 0.2, 10.0, 0.1) * humidityFactor,
    ammonia: drift(prev.ammonia, 0.1, 5.0, 0.05),
    sulfur: drift(prev.sulfur, 0.05, 2.0, 0.02),
    ethanol: drift(prev.ethanol, 0, 300, 1.5),
    temperature: drift(prev.temperature, 36.0, 37.5, 0.1),
    humidity: newHumidity,
    timestamp: now,
  };
};