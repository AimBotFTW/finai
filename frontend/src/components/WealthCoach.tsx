import { motion } from 'framer-motion';
import { Bot, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FinancialMetrics } from '../types';
import { RiskProfile } from './RiskProfileSelector';

interface WealthCoachProps {
    data: FinancialMetrics;
    riskProfile: RiskProfile;
    finalNetWorth?: number;
}

function buildCoachMessage(data: FinancialMetrics, riskProfile: string, finalNetWorth: number): string[] {
    const savingsRate = Math.round((data.monthly_savings / data.monthly_income) * 100);
    const efMonths = data.emergency_fund_months ?? (data.emergency_fund / data.monthly_expenses);
    const dti = data.debt_to_income_ratio;
    const sip = Math.round(data.monthly_savings * 0.60 / 500) * 500;
    const tenyrL = (finalNetWorth / 100000).toFixed(1);

    const lines: string[] = [];

    // Savings praise or concern
    if (savingsRate >= 30) {
        lines.push(`You're saving **${savingsRate}%** of your income — that puts you in the top 10% of savers in India. Keep compounding. 🎯`);
    } else if (savingsRate >= 20) {
        lines.push(`You save **${savingsRate}%** of income — solid discipline. Increasing to 30% would add ₹${Math.round((data.monthly_income * 0.30 - data.monthly_savings) * 12 / 1000)}K to your annual wealth. 📈`);
    } else {
        lines.push(`Your savings rate is **${savingsRate}%**. Target 20–30% to build meaningful wealth. Cutting one major expense could make a big difference.`);
    }

    // Emergency fund
    if (efMonths < 3) {
        lines.push(`⚠️ Your emergency fund is **dangerously low** at ${efMonths.toFixed(1)} months. Park ₹${Math.round(Math.max(data.monthly_expenses * 6 - data.emergency_fund, 0) / 12 / 500) * 500}/month in a Liquid Fund first.`);
    } else if (efMonths < 6) {
        lines.push(`Your emergency fund covers **${efMonths.toFixed(1)} months** — top it up to 6 months (₹${Math.round(data.monthly_expenses * 6).toLocaleString('en-IN')}) before aggressively investing.`);
    }

    // Investment suggestion
    lines.push(`Increasing your SIP by **₹5,000/month** from the current ₹${sip.toLocaleString('en-IN')} to ₹${(sip + 5000).toLocaleString('en-IN')} would add approximately **₹${Math.round(5000 * 12 * 10 * 1.8 / 100000)}L** to your 10-year corpus.`);

    // Net worth projection
    lines.push(`At your **${riskProfile}** risk profile, your projected net worth in 10 years is **₹${tenyrL}L** — you're on track. Stay invested through market volatility.`);

    return lines;
}

const HIGHLIGHT_REGEX = /\*\*(.+?)\*\*/g;

function renderFormatted(text: string) {
    const parts = text.split(HIGHLIGHT_REGEX);
    return parts.map((part, i) =>
        i % 2 === 1
            ? <span key={i} className="font-bold text-white">{part}</span>
            : <span key={i}>{part}</span>
    );
}

export const WealthCoach: React.FC<WealthCoachProps> = ({ data, riskProfile, finalNetWorth = 5200000 }) => {
    const messages = buildCoachMessage(data, riskProfile, finalNetWorth);
    const savingsRate = Math.round((data.monthly_savings / data.monthly_income) * 100);
    const scoreColor = data.health_score >= 80 ? '#10B981' : data.health_score >= 60 ? '#22D3EE' : data.health_score >= 40 ? '#F59E0B' : '#EF4444';

    return (
        <div className="glass-card p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                    <Bot size={18} className="text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">AI Wealth Coach</h3>
                    <p className="text-[10px] text-slate-500">Personalized financial intelligence</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] text-slate-500">Live</span>
                </div>
            </div>

            {/* Summary stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                    { label: 'Health', value: `${data.health_score}/100`, color: scoreColor },
                    { label: 'Savings', value: `${savingsRate}%`, color: savingsRate >= 20 ? '#10B981' : '#F59E0B' },
                    { label: '10-Yr Goal', value: `₹${(finalNetWorth / 100000).toFixed(0)}L`, color: '#7C3AED' },
                ].map((s) => (
                    <div key={s.label} className="p-2 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] text-slate-500 mb-0.5">{s.label}</p>
                        <p className="text-sm font-black" style={{ color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Coach message lines */}
            <div className="space-y-2.5">
                {messages.map((msg, i) => {
                    const isWarning = msg.includes('⚠️');
                    const isPositive = msg.includes('🎯') || msg.includes('📈');
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl text-xs text-slate-300 leading-relaxed"
                            style={{
                                background: isWarning ? 'rgba(239,68,68,0.07)' : isPositive ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isWarning ? 'rgba(239,68,68,0.15)' : isPositive ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)'}`,
                            }}
                        >
                            <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                                style={{ background: isWarning ? 'rgba(239,68,68,0.2)' : 'rgba(37,99,235,0.2)' }}>
                                {isWarning
                                    ? <AlertCircle size={9} className="text-danger" />
                                    : <CheckCircle2 size={9} className="text-primary" />}
                            </div>
                            <span>{renderFormatted(msg)}</span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
