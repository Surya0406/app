import React, { useState } from 'react';
import { AppThresholds, DEFAULT_THRESHOLDS } from '../types';
import { Save, RotateCcw, X } from 'lucide-react';

interface ThresholdSettingsProps {
  currentThresholds: AppThresholds;
  onSave: (newThresholds: AppThresholds) => void;
  onClose: () => void;
}

const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({ currentThresholds, onSave, onClose }) => {
  const [localThresholds, setLocalThresholds] = useState<AppThresholds>(currentThresholds);

  const handleChange = (key: keyof AppThresholds, field: 'warning' | 'critical', value: string) => {
    const numValue = parseFloat(value);
    setLocalThresholds(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  const handleReset = () => {
    setLocalThresholds(DEFAULT_THRESHOLDS);
  };

  const handleSave = () => {
    onSave(localThresholds);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-6 mb-8 animate-slideDown ring-1 ring-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-lg font-bold text-slate-800">Sensor Threshold Configuration</h3>
            <p className="text-sm text-slate-500">Adjust the sensitivity for warning and critical alerts.</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:rotate-90 transition-transform duration-300">
            <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {(Object.keys(DEFAULT_THRESHOLDS) as Array<keyof AppThresholds>).map((key) => (
          <div key={key} className="bg-slate-50 p-4 rounded-lg border border-slate-200 transition-colors hover:bg-slate-100 hover:border-slate-300">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-700 capitalize">{key}</h4>
                <span className="text-xs font-mono text-slate-400">PPM</span>
            </div>
            
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-amber-600 mb-1">Warning Limit</label>
                    <input 
                        type="number" 
                        step="0.1"
                        value={localThresholds[key].warning}
                        onChange={(e) => handleChange(key, 'warning', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md 
                                   focus:ring-2 focus:ring-amber-200 focus:border-amber-400 
                                   focus:scale-105 focus:shadow-lg outline-none transition-all duration-300 ease-out"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-rose-600 mb-1">Critical Limit</label>
                    <input 
                        type="number" 
                        step="0.1"
                        value={localThresholds[key].critical}
                        onChange={(e) => handleChange(key, 'critical', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md
                                   focus:ring-2 focus:ring-rose-200 focus:border-rose-400 
                                   focus:scale-105 focus:shadow-lg outline-none transition-all duration-300 ease-out"
                    />
                </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all active:scale-95"
        >
            <RotateCcw size={16} />
            Reset Defaults
        </button>
        <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow-indigo-200 hover:shadow-lg transition-all active:scale-95 transform hover:-translate-y-0.5"
        >
            <Save size={16} />
            Save Configuration
        </button>
      </div>
    </div>
  );
};

export default ThresholdSettings;