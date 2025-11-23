import { AnalysisReport } from '../types';

const DB_KEY = 'odoursense_patient_history';

export const saveReportToHistory = (report: AnalysisReport) => {
    const history = getPatientHistory();
    history.push(report);
    localStorage.setItem(DB_KEY, JSON.stringify(history));
};

export const getPatientHistory = (): AnalysisReport[] => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
};

export const getAverageReadings = (): Record<string, number> | null => {
    const history = getPatientHistory();
    if (history.length === 0) return null;

    // Calculate averages of the input values stored in biomarkerInsights
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    history.forEach(report => {
        report.biomarkerInsights.forEach(insight => {
            if (!sums[insight.name]) {
                sums[insight.name] = 0;
                counts[insight.name] = 0;
            }
            sums[insight.name] += insight.value;
            counts[insight.name]++;
        });
    });

    const averages: Record<string, number> = {};
    Object.keys(sums).forEach(key => {
        averages[key] = sums[key] / counts[key];
    });

    return averages;
};
