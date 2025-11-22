import React from 'react';
import { DEFAULT_THRESHOLDS, ThresholdConfig } from '../types';
import { AlertTriangle, CheckCircle, Sliders } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  type: keyof typeof DEFAULT_THRESHOLDS;
  description: string;
  isEditable?: boolean;
  onChange?: (val: number) => void;
  maxRange?: number;
  customThresholds?: ThresholdConfig;
}

const SensorCard: React.FC<SensorCardProps> = ({ 
  title, 
  value, 
  unit, 
  type, 
  description,
  isEditable = false,
  onChange,
  maxRange = 10,
  customThresholds
}) => {
  // Use custom thresholds if provided (Live Monitor), otherwise fall back to default (or handle via parent in future)
  const thresholds = customThresholds || DEFAULT_THRESHOLDS[type];
  
  let status: 'normal' | 'warning' | 'critical' = 'normal';
  
  if (value > thresholds.critical) status = 'critical';
  else if (value > thresholds.warning) status = 'warning';

  // Calculate percentage relative to 1.5x the critical value for visual scaling
  const percentage = Math.min((value / (thresholds.critical * 1.5)) * 100, 100);
  
  const colorMap = {
    normal: 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-50',
    warning: 'text-amber-600 bg-amber-50 border-amber-100 ring-amber-50',
    critical: 'text-rose-600 bg-rose-50 border-rose-100 ring-rose-50',
  };

  const barColorMap = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
  };

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm transition-all duration-300 ease-out hover:shadow-md ${
        isEditable 
            ? 'border-indigo-300 ring-4 ring-indigo-50/50 shadow-md scale-[1.01]' 
            : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider flex items-center gap-2 transition-colors duration-300">
            {title}
            {isEditable && <Sliders size={14} className="text-indigo-400 animate-pulse" />}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
        <div className={`p-2 rounded-lg border transition-all duration-500 ${colorMap[status]}`}>
           {status === 'normal' ? <CheckCircle size={20} className="transition-transform duration-500" /> : <AlertTriangle size={20} className="animate-bounce" />}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-end gap-2">
            {isEditable ? (
                <input 
                    type="number" 
                    step="0.01"
                    value={value.toFixed(2)}
                    onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
                    className="text-3xl font-bold text-indigo-700 bg-indigo-50/50 rounded-lg px-2 w-32 border border-indigo-200 
                               focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 
                               focus:scale-110 focus:bg-white focus:shadow-lg focus:z-10
                               transition-all duration-300 ease-spring origin-left"
                />
            ) : (
                <span className={`text-3xl font-bold transition-colors duration-300 ${status === 'critical' ? 'text-rose-600' : 'text-slate-800'}`}>
                    {value.toFixed(2)}
                </span>
            )}
            <span className="text-sm text-slate-500 font-medium mb-1.5">{unit}</span>
        </div>
      </div>

      {isEditable ? (
        <div className="mb-2 h-8 flex items-center">
            <input 
                type="range" 
                min="0" 
                max={maxRange} 
                step="0.1" 
                value={value}
                onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer 
                           accent-indigo-600 hover:accent-indigo-500 active:accent-indigo-700
                           transition-all duration-200 hover:h-3 active:scale-[1.02]"
            />
        </div>
      ) : (
        <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
            <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColorMap[status]}`} 
            style={{ width: `${percentage}%` }}
            />
        </div>
      )}
      
      <div className="flex justify-between text-xs text-slate-400">
        <span>0</span>
        <span className={`transition-all duration-300 ${value > thresholds.warning ? 'font-bold text-amber-600 scale-110' : ''}`}>
            Limit: {thresholds.warning}
        </span>
      </div>
    </div>
  );
};

export default SensorCard;