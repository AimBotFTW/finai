import { FinancialData } from '../types';
import { RiskProfile } from '../components/RiskProfileSelector';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { FinancialRoadmap } from '../components/FinancialRoadmap';
import { motion } from 'framer-motion';
import { Sliders } from 'lucide-react';

interface SimulatorPageProps {
    data: FinancialData;
    riskProfile: RiskProfile;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({ data, riskProfile }) => {
    const metrics = data?.metrics;
    if (!metrics || metrics.monthly_income === 0) return (
        <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
            <Sliders size={32} className="text-slate-600" />
            <h3 className="text-base font-bold text-white">No Data to Simulate</h3>
            <p className="text-sm text-slate-400 max-w-sm">Analyze your finances on the Dashboard first. The simulator will pre-fill your income and savings numbers automatically.</p>
        </div>
    );
    if (!metrics) return <div className="p-8 text-center text-slate-400">Loading simulator...</div>;

    const estimatedInvestments = Math.round(metrics.monthly_savings * 0.6 * 24); // rough 2yr corpus

    return (
        <div className="space-y-6">
            <div>
                <h2 className="section-title flex items-center gap-2">
                    <Sliders size={18} className="text-primary" />
                    What-If Simulator
                </h2>
                <p className="section-subtitle">Model financial scenarios: change SIP, income growth, or expenses and see the outcome</p>
            </div>

            {/* What-If Simulator */}
            <WhatIfSimulator
                defaultIncome={metrics.monthly_income}
                defaultSavings={metrics.monthly_savings}
                defaultInvestments={estimatedInvestments}
            />

            {/* Financial Roadmap */}
            <div>
                <h2 className="section-title flex items-center gap-2">🗺️ Financial Roadmap</h2>
                <p className="section-subtitle mb-3">Life-stage milestones based on your current position</p>
                <FinancialRoadmap
                    currentAge={30}
                    riskProfile={riskProfile}
                    monthlySavings={metrics.monthly_savings}
                />
            </div>

        </div>
    );
};
