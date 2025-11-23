
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
      ether: 0,
      hydrogen: 5,
      methane: 2,
      isoprene: 50, // ppb
      carbonMonoxide: 0.5, // ppm
      nitricOxide: 15, // ppb
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
  const newHumidity = drift(prev.humidity, 30, 80, 2);
  const humidityFactor = newHumidity > 60 ? 1.05 : 1.0; 

  return {
    acetone: drift(prev.acetone, 0.2, 10.0, 0.1) * humidityFactor,
    ammonia: drift(prev.ammonia, 0.1, 5.0, 0.05),
    sulfur: drift(prev.sulfur, 0.05, 2.0, 0.02),
    ethanol: drift(prev.ethanol, 0, 300, 1.5),
    // New Gases
    ether: drift(prev.ether, 0, 100, 0.5),
    hydrogen: drift(prev.hydrogen, 2, 80, 1.0), // ppm, fluctuates with digestion
    methane: drift(prev.methane, 0, 40, 0.5),
    
    isoprene: drift(prev.isoprene, 20, 600, 5), // ppb
    carbonMonoxide: drift(prev.carbonMonoxide, 0, 15, 0.2), // ppm
    nitricOxide: drift(prev.nitricOxide, 5, 100, 2), // ppb
    
    temperature: drift(prev.temperature, 36.0, 37.5, 0.1),
    humidity: newHumidity,
    timestamp: now,
  };
};
