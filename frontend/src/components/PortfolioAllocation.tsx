import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, RefreshCw } from 'lucide-react';
import { RiskProfile } from './RiskProfileSelector';

export interface AllocationSlice {
    asset_class: string;
    percentage: number;
    color: string;
    monthly_amount: number;
    rationale: string;
    examples: string[];
}

interface PortfolioAllocationProps {
    allocations: AllocationSlice[];
    riskProfile: RiskProfile;
    expectedReturn: number;
    expectedValue: number;
    monthlyInvestable: number;
    rebalanceNote: string;
    isLoading?: boolean;
}

const RISK_LABELS = { conservative: 'Conservative', moderate: 'Moderate', aggressive: 'Aggressive' };
const RISK_COLORS = { conservative: '#10B981', moderate: '#2563EB', aggressive: '#7C3AED' };

export const PortfolioAllocation: React.FC<PortfolioAllocationProps> = ({
    allocations, riskProfile, expectedReturn, expectedValue, monthlyInvestable, rebalanceNote, isLoading,
}) => {
    const riskColor = RISK_COLORS[riskProfile];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles size={14} style={{ color: riskColor }} />
                        AI-Recommended Portfolio
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                        Based on your <span style={{ color: riskColor }} className="font-semibold">{RISK_LABELS[riskProfile]}</span> profile · ₹{monthlyInvestable.toLocaleString('en-IN')}/month
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500">Expected 10-yr value</p>
                    <p className="text-lg font-black" style={{ color: riskColor }}>₹{(expectedValue / 100000).toFixed(1)}L</p>
                    <p className="text-[10px] text-slate-500">{expectedReturn}% CAGR</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-40 gap-3">
                    <RefreshCw size={18} className="animate-spin text-slate-500" />
                    <span className="text-sm text-slate-500">Generating portfolio...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Donut chart */}
                    <div className="flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={allocations}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="percentage"
                                    startAngle={90}
                                    endAngle={450}
                                    animationBegin={0}
                                    animationDuration={900}
                                >
                                    {allocations.map((slice, i) => (
                                        <Cell key={i} fill={slice.color} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(val: number, name: string, props: any) => [`${val}%`, props.payload.asset_class]}
                                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Centre label */}
                        <p className="text-[10px] text-slate-500 -mt-2 text-center">Asset allocation</p>
                    </div>

                    {/* Allocation list */}
                    <div className="space-y-2">
                        {allocations.map((slice, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className="group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                                        <span className="text-[11px] font-semibold text-slate-300">{slice.asset_class}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-right">
                                        <span className="text-[10px] text-slate-500">₹{slice.monthly_amount.toLocaleString('en-IN')}</span>
                                        <span className="text-[11px] font-black" style={{ color: slice.color }}>{slice.percentage}%</span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: slice.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${slice.percentage}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.08 }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-600">{slice.rationale}</p>
                                {/* Fund examples on hover */}
                                {slice.examples?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {slice.examples.map((ex, j) => (
                                            <span key={j} className="text-[9px] px-1.5 py-0.5 rounded-full"
                                                style={{ background: `${slice.color}15`, color: slice.color }}>
                                                {ex}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rebalancing note */}
            <div className="px-3 py-2 rounded-xl text-[10px] text-slate-400"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="font-semibold text-slate-300">Rebalancing: </span>{rebalanceNote}
            </div>
        </div>
    );
};
