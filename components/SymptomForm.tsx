
import React from 'react';
import { SymptomState } from '../types';
import { Activity, Coffee, Droplets, AlertCircle, Brain, Wind, Zap, AlertTriangle, HeartPulse, Moon, Scale, Thermometer } from 'lucide-react';

interface SymptomFormProps {
  symptoms: SymptomState;
  setSymptoms: React.Dispatch<React.SetStateAction<SymptomState>>;
}

const SymptomForm: React.FC<SymptomFormProps> = ({ symptoms, setSymptoms }) => {
  const toggle = (key: keyof SymptomState) => {
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    { key: 'thirst', label: 'Excessive Thirst', icon: Droplets },
    { key: 'fatigue', label: 'Chronic Fatigue', icon: Coffee },
    { key: 'frequentUrination', label: 'Freq. Urination', icon: Activity },
    { key: 'nausea', label: 'Nausea', icon: AlertCircle },
    { key: 'dizziness', label: 'Dizziness', icon: Zap },
    { key: 'confusion', label: 'Mental Confusion', icon: Brain },
    { key: 'abdominalPain', label: 'Abdominal Pain', icon: AlertTriangle },
    { key: 'shortnessOfBreath', label: 'Breathlessness', icon: Wind },
    // New Symptoms
    { key: 'chestPain', label: 'Chest Pain', icon: HeartPulse },
    { key: 'nightSweats', label: 'Night Sweats', icon: Moon },
    { key: 'unexplainedWeightLoss', label: 'Rapid Weight Loss', icon: Scale },
    { key: 'dryCough', label: 'Dry Cough', icon: Thermometer },
  ] as const;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full transition-all duration-300 hover:shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Clinical Symptoms</h3>
      <p className="text-sm text-slate-500 mb-6">
        Select all active symptoms to cross-reference with breath data.
      </p>
      
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => toggle(key as keyof SymptomState)}
            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-300 ease-spring ${
              symptoms[key as keyof SymptomState] 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md scale-[1.02] ring-1 ring-indigo-500' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:shadow-sm hover:scale-[1.01] active:scale-95'
            }`}
          >
            <Icon size={18} className={`flex-shrink-0 transition-colors duration-300 ${symptoms[key as keyof SymptomState] ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span className="font-medium text-xs sm:text-sm leading-tight">{label}</span>
            {symptoms[key as keyof SymptomState] && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-scaleIn flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SymptomForm;
