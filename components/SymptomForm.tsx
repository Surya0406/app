import React from 'react';
import { SymptomState } from '../types';
import { Activity, Coffee, Droplets, AlertCircle } from 'lucide-react';

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
    { key: 'frequentUrination', label: 'Frequent Urination', icon: Activity },
    { key: 'nausea', label: 'Nausea / Vomiting', icon: AlertCircle },
  ] as const;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full transition-all duration-300 hover:shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Hybrid Diagnostics</h3>
      <p className="text-sm text-slate-500 mb-6">
        Select current symptoms to improve AI diagnostic accuracy.
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ease-spring ${
              symptoms[key] 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md scale-[1.02] ring-1 ring-indigo-500' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:shadow-sm hover:scale-[1.01] active:scale-95'
            }`}
          >
            <Icon size={20} className={`transition-colors duration-300 ${symptoms[key] ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span className="font-medium text-sm">{label}</span>
            {symptoms[key] && (
                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500 animate-scaleIn" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SymptomForm;