import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SensorCard from './components/SensorCard';
import TrendChart from './components/TrendChart';
import SymptomForm from './components/SymptomForm';
import AnalysisPanel from './components/AnalysisPanel';
import ThresholdSettings from './components/ThresholdSettings';
import { generateMockReading } from './services/sensorSimulation';
import { analyzeBreathData } from './services/geminiService';
import { SensorReadings, SymptomState, AnalysisReport, AppThresholds, DEFAULT_THRESHOLDS } from './types';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'monitor' | 'diagnosis'>('monitor');

  // --- APP SETTINGS ---
  const [thresholds, setThresholds] = useState<AppThresholds>(DEFAULT_THRESHOLDS);
  const [showSettings, setShowSettings] = useState(false);

  // Load thresholds from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('odoursense_thresholds');
    if (saved) {
        try {
            setThresholds(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to parse thresholds", e);
        }
    }
  }, []);

  // Save thresholds handler
  const handleSaveThresholds = (newThresholds: AppThresholds) => {
    setThresholds(newThresholds);
    localStorage.setItem('odoursense_thresholds', JSON.stringify(newThresholds));
  };

  // --- MODULE 1: LIVE MONITORING STATE ---
  const [liveReadings, setLiveReadings] = useState<SensorReadings | null>(null);
  const [history, setHistory] = useState<SensorReadings[]>([]);
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);

  // --- MODULE 2: DIAGNOSIS INPUT STATE ---
  const [manualReadings, setManualReadings] = useState<SensorReadings>({
    acetone: 0.5,
    ammonia: 0.2,
    sulfur: 0.1,
    ethanol: 0.0,
    temperature: 36.5,
    humidity: 45,
    timestamp: Date.now()
  });
  const [symptoms, setSymptoms] = useState<SymptomState>({
    thirst: false,
    fatigue: false,
    frequentUrination: false,
    nausea: false,
  });
  const [aiReport, setAiReport] = useState<AnalysisReport | null>(null);
  const [analyzedReadingsSnapshot, setAnalyzedReadingsSnapshot] = useState<SensorReadings | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- LIVE SIMULATION EFFECT ---
  useEffect(() => {
    // Initialize if needed
    if (!liveReadings) {
        const initial = generateMockReading(null);
        setLiveReadings(initial);
        setHistory([initial]);
    }

    const interval = setInterval(() => {
      if (!isSimulationPaused) {
        setLiveReadings((prev) => {
            const newData = generateMockReading(prev);
            setHistory((h) => [...h, newData].slice(-50)); // Keep last 50 points
            return newData;
        });
      }
    }, 2000); 

    return () => clearInterval(interval);
  }, [isSimulationPaused]);

  // --- HANDLERS ---

  const handleManualInputChange = (key: keyof SensorReadings, value: number) => {
    setManualReadings(prev => ({ ...prev, [key]: value }));
  };

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setAiReport(null);
    setAnalyzedReadingsSnapshot(manualReadings); // Lock in the values used for this report
    
    const report = await analyzeBreathData(manualReadings, symptoms, thresholds);
    setAiReport(report);
    setIsAnalyzing(false);
  }, [manualReadings, symptoms, thresholds]);

  const resetManualForm = () => {
    setManualReadings({
        acetone: 0.5,
        ammonia: 0.2,
        sulfur: 0.1,
        ethanol: 0.0,
        temperature: 36.5,
        humidity: 45,
        timestamp: Date.now()
    });
    setSymptoms({
        thirst: false,
        fatigue: false,
        frequentUrination: false,
        nausea: false,
    });
    setAiReport(null);
    setAnalyzedReadingsSnapshot(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- VIEW 1: LIVE MONITORING --- */}
        {currentView === 'monitor' && (
            <div className="animate-fadeIn space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Live Telemetry</h2>
                        <p className="text-slate-500">Real-time sensor data acquisition from hardware nodes.</p>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="hidden sm:flex gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm mr-2">
                            <div className="px-3 border-r border-slate-100">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Temp</p>
                                <p className="font-mono text-sm font-bold text-slate-700">{liveReadings?.temperature.toFixed(1)}°C</p>
                            </div>
                            <div className="px-3">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Humidity</p>
                                <p className="font-mono text-sm font-bold text-slate-700">{liveReadings?.humidity.toFixed(1)}%</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${
                                showSettings
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Settings size={18} />
                            <span className="hidden sm:inline">Config</span>
                        </button>

                        <button 
                            onClick={() => setIsSimulationPaused(!isSimulationPaused)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${
                                !isSimulationPaused
                                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                                    : 'bg-amber-100 border-amber-200 text-amber-800'
                            }`}
                        >
                            {isSimulationPaused ? <Play size={18} /> : <Pause size={18} />}
                            {isSimulationPaused ? 'Resume' : 'Pause'}
                        </button>
                    </div>
                </div>

                {showSettings && (
                    <ThresholdSettings 
                        currentThresholds={thresholds} 
                        onSave={handleSaveThresholds} 
                        onClose={() => setShowSettings(false)} 
                    />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart */}
                    <div className="lg:col-span-2">
                        <TrendChart history={history} />
                    </div>

                    {/* Live Readout Cards (Read-only) */}
                    <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <SensorCard 
                            title="Acetone"
                            value={liveReadings?.acetone || 0}
                            unit="ppm"
                            type="acetone"
                            description="Diabetes Marker"
                            customThresholds={thresholds.acetone}
                        />
                         <SensorCard 
                            title="Ammonia"
                            value={liveReadings?.ammonia || 0}
                            unit="ppm"
                            type="ammonia"
                            description="Renal Function"
                            customThresholds={thresholds.ammonia}
                        />
                         <SensorCard 
                            title="Sulfur"
                            value={liveReadings?.sulfur || 0}
                            unit="ppm"
                            type="sulfur"
                            description="Infection Marker"
                            customThresholds={thresholds.sulfur}
                        />
                        <SensorCard 
                            title="Ethanol"
                            value={liveReadings?.ethanol || 0}
                            unit="ppm"
                            type="ethanol"
                            description="Intoxication/Metabolic"
                            customThresholds={thresholds.ethanol}
                        />
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW 2: AI DIAGNOSIS --- */}
        {currentView === 'diagnosis' && (
            <div className="animate-fadeIn space-y-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-indigo-900">Medical Diagnosis Module</h2>
                        <p className="text-slate-500">Enter specific sensor data points to generate an AI clinical report.</p>
                    </div>
                    <button 
                        onClick={resetManualForm}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-indigo-600 font-medium bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        <RotateCcw size={16} />
                        Reset Form
                    </button>
                </div>

                {/* Input Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SensorCard 
                        title="Acetone Level"
                        value={manualReadings.acetone}
                        unit="ppm"
                        type="acetone"
                        description="Input value for analysis"
                        isEditable={true}
                        onChange={(v) => handleManualInputChange('acetone', v)}
                        maxRange={10.0}
                        customThresholds={thresholds.acetone}
                    />
                    <SensorCard 
                        title="Ammonia Level"
                        value={manualReadings.ammonia}
                        unit="ppm"
                        type="ammonia"
                        description="Input value for analysis"
                        isEditable={true}
                        onChange={(v) => handleManualInputChange('ammonia', v)}
                        maxRange={5.0}
                        customThresholds={thresholds.ammonia}
                    />
                    <SensorCard 
                        title="Sulfur Level"
                        value={manualReadings.sulfur}
                        unit="ppm"
                        type="sulfur"
                        description="Input value for analysis"
                        isEditable={true}
                        onChange={(v) => handleManualInputChange('sulfur', v)}
                        maxRange={2.0}
                        customThresholds={thresholds.sulfur}
                    />
                    <SensorCard 
                        title="Ethanol Level"
                        value={manualReadings.ethanol}
                        unit="ppm"
                        type="ethanol"
                        description="Input value for analysis"
                        isEditable={true}
                        onChange={(v) => handleManualInputChange('ethanol', v)}
                        maxRange={200}
                        customThresholds={thresholds.ethanol}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Symptom Context */}
                    <div className="lg:col-span-1">
                        <SymptomForm symptoms={symptoms} setSymptoms={setSymptoms} />
                    </div>

                    {/* AI Analysis Result */}
                    <div className="lg:col-span-2">
                        <AnalysisPanel 
                            report={aiReport} 
                            analyzedReadings={analyzedReadingsSnapshot}
                            isLoading={isAnalyzing} 
                            onAnalyze={handleAnalyze} 
                        />
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;