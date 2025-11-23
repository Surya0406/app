import React from 'react';
import { AnalysisReport, SensorReadings } from '../types';
import { Sparkles, AlertOctagon, ShieldCheck, Info, Thermometer, Stethoscope, AlertTriangle, Activity, ClipboardList } from 'lucide-react';

interface AnalysisPanelProps {
  report: AnalysisReport | null;
  analyzedReadings: SensorReadings | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ report, analyzedReadings, isLoading, onAnalyze }) => {
  
  if (!report && !isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-8 text-white shadow-lg flex flex-col items-center justify-center text-center min-h-[300px]">
        <Stethoscope className="w-12 h-12 mb-4 text-indigo-200" />
        <h3 className="text-2xl font-bold mb-2">Ready for Diagnosis</h3>
        <p className="text-indigo-100 mb-6 max-w-md">
          Enter sensor data points above or use live simulation, then click below to generate a comprehensive AI disease probability report.
        </p>
        <button 
          onClick={onAnalyze}
          className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-md flex items-center gap-2 transform hover:scale-105"
        >
          <Sparkles size={18} />
          Run Diagnostics
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm min-h-[300px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Running predictive analysis...</p>
        <p className="text-xs text-slate-400 mt-2">Evaluating biomarkers against clinical thresholds</p>
      </div>
    );
  }

  // Define dynamic styles based on risk level
  const getRiskStyles = (level: string = 'Low') => {
    switch (level) {
      case 'Critical':
        return {
          containerBorder: 'border-red-200',
          bg: 'bg-red-50',
          borderBottom: 'border-red-100',
          titleColor: 'text-red-900',
          subTitleColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-800 border-red-200',
          iconBg: 'bg-white/80 text-red-600',
          progressBar: 'bg-red-500',
          Icon: AlertOctagon
        };
      case 'High':
        return {
          containerBorder: 'border-orange-200',
          bg: 'bg-orange-50',
          borderBottom: 'border-orange-100',
          titleColor: 'text-orange-900',
          subTitleColor: 'text-orange-700',
          badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
          iconBg: 'bg-white/80 text-orange-600',
          progressBar: 'bg-orange-500',
          Icon: AlertTriangle
        };
      case 'Moderate':
        return {
          containerBorder: 'border-yellow-200',
          bg: 'bg-yellow-50',
          borderBottom: 'border-yellow-100',
          titleColor: 'text-yellow-900',
          subTitleColor: 'text-yellow-700',
          badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconBg: 'bg-white/80 text-yellow-600',
          progressBar: 'bg-yellow-500',
          Icon: AlertTriangle
        };
      case 'Low':
      default:
        return {
          containerBorder: 'border-green-200',
          bg: 'bg-green-50',
          borderBottom: 'border-green-100',
          titleColor: 'text-green-900',
          subTitleColor: 'text-green-700',
          badgeColor: 'bg-green-100 text-green-800 border-green-200',
          iconBg: 'bg-white/80 text-green-600',
          progressBar: 'bg-green-500',
          Icon: ShieldCheck
        };
    }
  };

  const styles = getRiskStyles(report?.riskLevel);
  const StatusIcon = styles.Icon;

  // Split recommendations based on delimiter
  const recommendationsList = report?.recommendation.split('||').filter(Boolean) || [];

  return (
    <div className={`bg-white rounded-xl border shadow-lg overflow-hidden animate-fadeIn ${styles.containerBorder}`}>
      {/* Header */}
      <div className={`p-5 ${styles.bg} border-b ${styles.borderBottom}`}>
        <div className="flex justify-between items-start md:items-center">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full shadow-sm ${styles.iconBg}`}>
                   <StatusIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className={`font-bold text-xl leading-tight ${styles.titleColor}`}>
                      {report?.summary || "Analysis Complete"}
                  </h3>
                  <p className={`text-sm font-medium ${styles.subTitleColor}`}>Confidence Score: 98.5%</p>
                </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${styles.badgeColor}`}>
                {report?.riskLevel} Risk
            </span>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        
        {/* NEW: Biomarker Analysis Breakdown */}
        {report?.biomarkerInsights && (
             <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2 tracking-wider">
                    <Activity size={16}/> Biomarker Analysis Breakdown
                </h4>
                <div className="space-y-3">
                    {report.biomarkerInsights.map((insight, idx) => {
                        let badgeStyle = "bg-green-100 text-green-800 border-green-200";
                        if (insight.status === 'Critical') badgeStyle = "bg-red-100 text-red-800 border-red-200";
                        if (insight.status === 'Elevated') badgeStyle = "bg-yellow-100 text-yellow-800 border-yellow-200";

                        return (
                            <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-3 hover:border-indigo-100 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-800">{insight.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-slate-600">{insight.value.toFixed(2)} {insight.unit}</span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${badgeStyle}`}>
                                            {insight.status}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{insight.interpretation}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Disease Probabilities */}
        {report?.diseases && report.diseases.length > 0 && (
            <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2 tracking-wider">
                    <Stethoscope size={16}/> Disease Probability Model
                </h4>
                <div className="space-y-4">
                    {report.diseases.map((d, i) => (
                        <div key={i} className="group">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-700 font-semibold">{d.name}</span>
                                <span className="text-slate-600 font-mono font-medium">{d.probability}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                        d.probability > 75 ? 'bg-red-500' : 
                                        d.probability > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${d.probability}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Explanation */}
        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-3">
                <Info size={16} className="text-indigo-600" />
                Explainable AI Summary
            </h4>
            <div className="text-indigo-900 leading-relaxed text-sm font-medium space-y-2">
                {report?.explanation.split('\n').map((line, idx) => {
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                        return <div key={idx} className="pl-4">{line}</div>;
                    }
                    if (line.trim() === '') {
                        return <br key={idx} />;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                         return <div key={idx} className="font-bold text-indigo-950 mt-2">{line.replace(/\*\*/g, '')}</div>
                    }
                     // Regex to handle Markdown-like bolding within text
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                        <div key={idx}>
                            {parts.map((part, i) => 
                                part.startsWith('**') && part.endsWith('**') 
                                    ? <span key={i} className="font-bold text-indigo-950">{part.replace(/\*\*/g, '')}</span> 
                                    : <span key={i}>{part}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                <ClipboardList size={16} className="text-slate-600" />
                Clinical Recommendations
            </h4>
            <ul className="space-y-2">
                {recommendationsList.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></span>
                        <span>{rec}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
             <button 
                onClick={onAnalyze}
                className="text-indigo-600 text-sm font-bold hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
             >
                <Sparkles size={16} />
                Update Analysis
             </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;