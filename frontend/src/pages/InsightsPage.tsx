import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { FinancialData } from '../types';
import { NetWorthForecast, ForecastDataPoint } from '../components/NetWorthForecast';
import { ForecastData } from '../api';
import { RiskProfile } from '../components/RiskProfileSelector';

interface InsightsPageProps {
    data: FinancialData;
    forecast: ForecastData;
    riskProfile: RiskProfile;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ data, forecast, riskProfile }) => {
    const metrics = data?.metrics;
    if (!metrics || metrics.monthly_income === 0) return (
        <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
            <TrendingUp size={32} className="text-slate-600" />
            <h3 className="text-base font-bold text-white">No Insights Yet</h3>
            <p className="text-sm text-slate-400 max-w-sm">Head to the Dashboard and analyze your finances to unlock personalized financial insights.</p>
        </div>
    );
    if (!metrics) return <div className="p-8 text-center text-slate-400">Loading insights...</div>;

    // Radar data driven by real scores
    const breakdown = data.health_breakdown ?? [];
    const radarData = [
        { metric: 'Savings Rate', value: breakdown.find(f => f.factor === 'Savings Rate')?.score ?? 72 },
        { metric: 'Debt Health', value: breakdown.find(f => f.factor === 'Debt Ratio')?.score ?? 60 },
        { metric: 'Emergency Fund', value: breakdown.find(f => f.factor === 'Emergency Fund')?.score ?? 30 },
        { metric: 'Investment', value: Math.min(metrics.monthly_savings / metrics.monthly_income * 200, 100) },
        { metric: 'Credit Score', value: 80 },
        { metric: 'Insurance', value: 55 },
    ];

    const insights = [
        {
            label: 'Savings Milestone',
            detail: `You save ₹${metrics.monthly_savings.toLocaleString('en-IN')}/month — ${metrics.savings_ratio?.toFixed(1) ?? Math.round(metrics.monthly_savings / metrics.monthly_income * 100)}% savings rate!`,
            icon: ArrowUpRight,
            color: '#10B981',
            bg: 'bg-success/10 border-success/20',
        },
        {
            label: 'Emergency Fund Alert',
            detail: `Only ${(metrics.emergency_fund_months ?? (metrics.emergency_fund / metrics.monthly_expenses)).toFixed(1)} months covered. Target: 6 months (₹${metrics.emergency_fund_requirement?.toLocaleString('en-IN') ?? (metrics.monthly_expenses * 6).toLocaleString('en-IN')}).`,
            icon: ArrowDownRight,
            color: '#EF4444',
            bg: 'bg-danger/10 border-danger/20',
        },
        {
            label: 'Debt Ratio',
            detail: `Debt-to-income: ${metrics.debt_to_income_ratio.toFixed(1)}%. ${metrics.debt_to_income_ratio < 28 ? 'Manageable — keep paying EMIs consistently.' : 'High — consider accelerating repayment.'}`,
            icon: metrics.debt_to_income_ratio < 28 ? ArrowUpRight : ArrowDownRight,
            color: metrics.debt_to_income_ratio < 28 ? '#10B981' : '#F59E0B',
            bg: metrics.debt_to_income_ratio < 28 ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20',
        },
        {
            label: 'Monthly Surplus',
            detail: `₹${metrics.monthly_savings.toLocaleString('en-IN')} surplus available for investing. Allocate 60% to SIPs.`,
            icon: ArrowUpRight,
            color: '#2563EB',
            bg: 'bg-blue-500/10 border-blue-500/20',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="section-title">Financial Insights</h2>
                <p className="section-subtitle">Deep analysis of your financial health</p>
            </div>

            {/* Key insights row */}
            <div className="grid grid-cols-2 gap-3">
                {insights.map((ins, i) => {
                    const Icon = ins.icon;
                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`glass-card p-4 border ${ins.bg}`}>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ins.color}20` }}>
                                    <Icon size={16} style={{ color: ins.color }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{ins.label}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{ins.detail}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Net Worth Forecast — AI driven */}
            <NetWorthForecast
                data={forecast.forecast as ForecastDataPoint[]}
                finalNetWorth={forecast.final_net_worth}
                cagr={forecast.cagr}
                riskProfile={riskProfile}
            />

            {/* Radar chart */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5">
                <h3 className="text-sm font-bold text-white mb-1">Financial Fitness Radar</h3>
                <p className="text-xs text-slate-400 mb-4">Holistic view across 6 dimensions</p>
                <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748B', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} strokeWidth={2} dot={{ fill: '#2563EB', r: 3 }} />
                    </RadarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
};
