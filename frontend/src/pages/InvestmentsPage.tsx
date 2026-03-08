import { RiskProfileSelector, RiskProfile } from '../components/RiskProfileSelector';
import { PortfolioAllocation, AllocationSlice } from '../components/PortfolioAllocation';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { PortfolioData } from '../api';

interface InvestmentsPageProps {
    portfolio: PortfolioData;
    riskProfile: RiskProfile;
    onRiskChange: (profile: RiskProfile) => void;
    isLoading?: boolean;
}

const RISK_RETURN: Record<RiskProfile, { min: number; max: number }> = {
    conservative: { min: 8, max: 10 },
    moderate: { min: 10, max: 13 },
    aggressive: { min: 13, max: 17 },
};

export const InvestmentsPage: React.FC<InvestmentsPageProps> = ({
    portfolio, riskProfile, onRiskChange, isLoading,
}) => {
    const range = RISK_RETURN[riskProfile];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="section-title flex items-center gap-2">
                        AI Portfolio Advisor
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Gemini AI
                        </span>
                    </h2>
                    <p className="section-subtitle">Personalized asset allocation based on your risk tolerance</p>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <RefreshCw size={13} className="animate-spin" />
                        Generating...
                    </div>
                )}
            </div>

            {/* Risk selector */}
            <div className="glass-card p-5">
                <RiskProfileSelector value={riskProfile} onChange={onRiskChange} />
            </div>

            {/* Portfolio allocation */}
            <div className="glass-card p-5">
                <PortfolioAllocation
                    allocations={portfolio.allocations as AllocationSlice[]}
                    riskProfile={riskProfile}
                    expectedReturn={portfolio.expected_annual_return}
                    expectedValue={portfolio.expected_10yr_value}
                    monthlyInvestable={portfolio.monthly_investable}
                    rebalanceNote={portfolio.rebalance_note}
                    isLoading={isLoading}
                />
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Expected CAGR', value: `${range.min}–${range.max}%`, color: '#2563EB' },
                    { label: '10-Year Target', value: `₹${(portfolio.expected_10yr_value / 100000).toFixed(1)}L`, color: '#10B981' },
                    { label: 'Monthly SIP', value: `₹${portfolio.monthly_investable.toLocaleString('en-IN')}`, color: '#7C3AED' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-4 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">{s.label}</p>
                        <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-600 text-center">
                ⚠️ AI-generated recommendations are for educational purposes only. Consult a SEBI-registered advisor before investing.
            </p>
        </div>
    );
};
