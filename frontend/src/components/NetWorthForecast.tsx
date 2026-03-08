import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { RiskProfile } from './RiskProfileSelector';

export interface ForecastDataPoint {
    year: number;
    label: string;
    savings: float;
    investments: float;
    net_worth: float;
}

// TypeScript float alias
type float = number;

interface NetWorthForecastProps {
    data: ForecastDataPoint[];
    finalNetWorth: number;
    cagr: number;
    riskProfile: RiskProfile;
    isLoading?: boolean;
}

const RISK_COLORS: Record<RiskProfile, string> = {
    conservative: '#10B981',
    moderate: '#2563EB',
    aggressive: '#7C3AED',
};

export const NetWorthForecast: React.FC<NetWorthForecastProps> = ({
    data, finalNetWorth, cagr, riskProfile, isLoading,
}) => {
    const color = RISK_COLORS[riskProfile];

    const formatLakh = (v: number) => {
        if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
        return `₹${(v / 100000).toFixed(1)}L`;
    };

    return (
        <div className="glass-card p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                            <TrendingUp size={13} style={{ color }} />
                        </div>
                        <h3 className="text-sm font-bold text-white">10-Year Net Worth Forecast</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 ml-8">
                        Savings + compounding investments at {cagr}% CAGR
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500">Projected by Year 10</p>
                    <motion.p
                        className="text-2xl font-black"
                        style={{ color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {formatLakh(finalNetWorth)}
                    </motion.p>
                </div>
            </div>

            {/* Area Chart */}
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis
                        tick={{ fill: '#64748B', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatLakh}
                        width={52}
                    />
                    <Tooltip
                        formatter={(v: number, name: string) => [formatLakh(v), name === 'net_worth' ? 'Net Worth' : name === 'investments' ? 'Investments' : 'Savings']}
                        contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="savings" name="savings" stroke="#10B981" strokeWidth={1.5} fill="url(#savingsGrad)" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="investments" name="investments" stroke={color} strokeWidth={2} fill="url(#investGrad)" />
                </AreaChart>
            </ResponsiveContainer>

            {/* Assumption pills */}
            <div className="flex flex-wrap gap-2 mt-3">
                {[
                    { label: 'Income growth', value: '8%/yr' },
                    { label: 'CAGR', value: `${cagr}%` },
                    { label: '60% savings invested', value: '' },
                ].map((pill) => (
                    <span key={pill.label} className="text-[9px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                        {pill.label}{pill.value ? ` · ${pill.value}` : ''}
                    </span>
                ))}
            </div>
        </div>
    );
};
