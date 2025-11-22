import React from 'react';
import { Wind, Activity, Stethoscope } from 'lucide-react';

interface HeaderProps {
  currentView: 'monitor' | 'diagnosis';
  onViewChange: (view: 'monitor' | 'diagnosis') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">OdourSense AI</h1>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:hidden">OdourSense</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
                onClick={() => onViewChange('monitor')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    currentView === 'monitor' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <Activity size={16} />
                Live Monitor
            </button>
            <button
                onClick={() => onViewChange('diagnosis')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    currentView === 'diagnosis' 
                        ? 'bg-white text-indigo-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <Stethoscope size={16} />
                AI Diagnosis
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;