
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SensorCard from './components/SensorCard';
import TrendChart from './components/TrendChart';
import SymptomForm from './components/SymptomForm';
import AnalysisPanel from './components/AnalysisPanel';
import ThresholdSettings from './components/ThresholdSettings';
import AuthPage from './components/AuthPage';
import { generateMockReading } from './services/sensorSimulation';
import { analyzeBreathData } from './services/analysisService';
import { getCurrentUser, logoutUser } from './services/authService';
import { saveReportToHistory } from './services/dbService';
import { SensorReadings, SymptomState, AnalysisReport, AppThresholds, DEFAULT_THRESHOLDS, UserProfile } from './types';
import { Play, Pause, Settings, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Check for existing session
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
    setLoadingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    setUser(getCurrentUser());
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  // --- APP STATE ---
  const [currentView, setCurrentView] = useState<'monitor' | 'diagnosis'>('monitor');
  const [thresholds, setThresholds] = useState<AppThresholds>(DEFAULT_THRESHOLDS);
  const [showSettings, setShowSettings] = useState(false);

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

  const handleSaveThresholds = (newThresholds: AppThresholds) => {
    setThresholds(newThresholds);
    localStorage.setItem('odoursense_thresholds', JSON.stringify(newThresholds));
  };

  // --- LIVE MONITORING STATE ---
  const [liveReadings, setLiveReadings] = useState<SensorReadings | null>(null);
  const [history, setHistory] = useState<SensorReadings[]>([]);
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);

  // --- DIAGNOSIS INPUT STATE ---
  const [manualReadings, setManualReadings] = useState<SensorReadings>({
    acetone: 0.5,
    ammonia: 0.2,
    sulfur: 0.1,
    ethanol: 0.0,
    ether: 0.0,
    hydrogen: 5.0,
    methane: 2.0,
    isoprene: 50,
    carbonMonoxide: 0.5,
    nitricOxide: 15,
    temperature: 36.5,
    humidity: 45,
    timestamp: Date.now()
  });
  
  const [symptoms, setSymptoms] = useState<SymptomState>({
    thirst: false,
    fatigue: false,
    frequentUrination: false,
    nausea: false,
    dizziness: false,
    confusion: false,
    abdominalPain: false,
    shortnessOfBreath: false,
    chestPain: false,
    nightSweats: false,
    unexplainedWeightLoss: false,
    dryCough: false,
  });
  
  const [aiReport, setAiReport] = useState<AnalysisReport | null>(null);
  const [analyzedReadingsSnapshot, setAnalyzedReadingsSnapshot] = useState<SensorReadings | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- LIVE SIMULATION LOOP ---
  useEffect(() => {
    if (!user) return; // Don't run sim if not logged in

    if (!liveReadings) {
        const initial = generateMockReading(null);
        setLiveReadings(initial);
        setHistory([initial]);
    }

    const interval = setInterval(() => {
      if (!isSimulationPaused) {
        setLiveReadings((prev) => {
            const newData = generateMockReading(prev);
            setHistory((h) => [...h, newData].slice(-50));
            return newData;
        });
      }
    }, 2000); 

    return () => clearInterval(interval);
  }, [isSimulationPaused, user]);

  // --- HANDLERS ---
  const handleManualInputChange = (key: keyof SensorReadings, value: number) => {
    setManualReadings(prev => ({ ...prev, [key]: value }));
  };

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setAiReport(null);
    setAnalyzedReadingsSnapshot(manualReadings);
    
    // Run analysis (includes DB history lookup internally)
    const report = await analyzeBreathData(manualReadings, symptoms, thresholds);
    
    // Save to simulated DB
    saveReportToHistory(report);
    
    setAiReport(report);
    setIsAnalyzing(false);
  }, [manualReadings, symptoms, thresholds]);

  const resetManualForm = () => {
    setManualReadings({
        acetone: 0.5,
        ammonia: 0.2,
        sulfur: 0.1,
        ethanol: 0.0,
        ether: 0.0,
        hydrogen: 5.0,
        methane: 2.0,
        isoprene: 50,
        carbonMonoxide: 0.5,
        nitricOxide: 15,
        temperature: 36.5,
        humidity: 45,
        timestamp: Date.now()
    });
    setSymptoms({
        thirst: false,
        fatigue: false,
        frequentUrination: false,
        nausea: false,
        dizziness: false,
        confusion: false,
        abdominalPain: false,
        shortnessOfBreath: false,
        chestPain: false,
        nightSweats: false,
        unexplainedWeightLoss: false,
        dryCough: false,
    });
    setAiReport(null);
    setAnalyzedReadingsSnapshot(null);
  };

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  if (!user) {
      return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header currentView={currentView} onViewChange={setCurrentView} user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- VIEW 1: LIVE MONITORING --- */}
        {currentView === 'monitor' && (
            <div className="animate-fadeIn space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Live Telemetry</h2>
                        <p className="text-slate-500">Real-time multispectral gas array data.</p>
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

                    {/* Live Readout Cards Grid */}
                    <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[400px] pr-1">
                        <SensorCard title="Acetone" value={liveReadings?.acetone || 0} unit="ppm" type="acetone" description="Ketones" customThresholds={thresholds.acetone} />
                        <SensorCard title="Ammonia" value={liveReadings?.ammonia || 0} unit="ppm" type="ammonia" description="Renal" customThresholds={thresholds.ammonia} />
                        <SensorCard title="Hydrogen" value={liveReadings?.hydrogen || 0} unit="ppm" type="hydrogen" description="Gut/SIBO" customThresholds={thresholds.hydrogen} />
                        <SensorCard title="Methane" value={liveReadings?.methane || 0} unit="ppm" type="methane" description="Gut/IMO" customThresholds={thresholds.methane} />
                        <SensorCard title="Nitric Oxide" value={liveReadings?.nitricOxide || 0} unit="ppb" type="nitricOxide" description="Asthma" customThresholds={thresholds.nitricOxide} maxRange={100} />
                        <SensorCard title="Isoprene" value={liveReadings?.isoprene || 0} unit="ppb" type="isoprene" description="Stress" customThresholds={thresholds.isoprene} maxRange={600} />
                        <SensorCard title="Ether" value={liveReadings?.ether || 0} unit="ppm" type="ether" description="Chemical" customThresholds={thresholds.ether} />
                        <SensorCard title="CO" value={liveReadings?.carbonMonoxide || 0} unit="ppm" type="carbonMonoxide" description="Pollution" customThresholds={thresholds.carbonMonoxide} maxRange={20} />
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW 2: AI DIAGNOSIS --- */}
        {currentView === 'diagnosis' && (
            <div className="animate-fadeIn space-y-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-indigo-900">Clinical Diagnosis Module</h2>
                        <p className="text-slate-500">Manual input or snapshot analysis with historical correlation.</p>
                    </div>
                    <button 
                        onClick={resetManualForm}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-indigo-600 font-medium bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        <RotateCcw size={16} />
                        Reset Form
                    </button>
                </div>

                {/* Extended Input Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <SensorCard title="Acetone" value={manualReadings.acetone} unit="ppm" type="acetone" description="Diabetes" isEditable={true} onChange={(v) => handleManualInputChange('acetone', v)} maxRange={10.0} customThresholds={thresholds.acetone} />
                    <SensorCard title="Ammonia" value={manualReadings.ammonia} unit="ppm" type="ammonia" description="Kidney" isEditable={true} onChange={(v) => handleManualInputChange('ammonia', v)} maxRange={5.0} customThresholds={thresholds.ammonia} />
                    <SensorCard title="Hydrogen" value={manualReadings.hydrogen} unit="ppm" type="hydrogen" description="SIBO" isEditable={true} onChange={(v) => handleManualInputChange('hydrogen', v)} maxRange={100} customThresholds={thresholds.hydrogen} />
                    <SensorCard title="Methane" value={manualReadings.methane} unit="ppm" type="methane" description="IMO" isEditable={true} onChange={(v) => handleManualInputChange('methane', v)} maxRange={50} customThresholds={thresholds.methane} />
                    <SensorCard title="Nitric Oxide" value={manualReadings.nitricOxide} unit="ppb" type="nitricOxide" description="Asthma" isEditable={true} onChange={(v) => handleManualInputChange('nitricOxide', v)} maxRange={100} customThresholds={thresholds.nitricOxide} />
                    <SensorCard title="Isoprene" value={manualReadings.isoprene} unit="ppb" type="isoprene" description="Stress" isEditable={true} onChange={(v) => handleManualInputChange('isoprene', v)} maxRange={600} customThresholds={thresholds.isoprene} />
                    <SensorCard title="Ether" value={manualReadings.ether} unit="ppm" type="ether" description="Solvent" isEditable={true} onChange={(v) => handleManualInputChange('ether', v)} maxRange={100} customThresholds={thresholds.ether} />
                    <SensorCard title="CO" value={manualReadings.carbonMonoxide} unit="ppm" type="carbonMonoxide" description="Smoker" isEditable={true} onChange={(v) => handleManualInputChange('carbonMonoxide', v)} maxRange={20} customThresholds={thresholds.carbonMonoxide} />
                    <SensorCard title="Ethanol" value={manualReadings.ethanol} unit="ppm" type="ethanol" description="Alcohol" isEditable={true} onChange={(v) => handleManualInputChange('ethanol', v)} maxRange={200} customThresholds={thresholds.ethanol} />
                    <SensorCard title="Sulfur" value={manualReadings.sulfur} unit="ppm" type="sulfur" description="Bacteria" isEditable={true} onChange={(v) => handleManualInputChange('sulfur', v)} maxRange={2.0} customThresholds={thresholds.sulfur} />
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
