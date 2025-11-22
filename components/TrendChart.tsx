import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SensorReadings } from '../types';

interface TrendChartProps {
  history: SensorReadings[];
}

const TrendChart: React.FC<TrendChartProps> = ({ history }) => {
  // Keep chart performant by only showing last 30 points
  const data = history.slice(-30).map(h => ({
    ...h,
    timeStr: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[400px]">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Real-Time Biomarker Trends</h3>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="timeStr" 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              stroke="#cbd5e1"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              stroke="#cbd5e1"
              label={{ value: 'PPM', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            
            <Line type="monotone" dataKey="acetone" name="Acetone (Diabetes)" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ammonia" name="Ammonia (Kidney)" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="sulfur" name="Sulfur (Infection)" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ethanol" name="Ethanol" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;