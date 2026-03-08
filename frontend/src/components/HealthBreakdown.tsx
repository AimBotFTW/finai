import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface HealthFactor {
    factor: string;
    score: number;
    label: string;
    color: string;
    detail: string;
    weight: number;
}

interface HealthBreakdownProps {
    factors: HealthFactor[];
    overallScore: number;
    healthLabel: string;
}

const labelIcon = (label: string) => {
    if (label === 'Excellent' || label === 'Good') return TrendingUp;
    if (label === 'Average') return Minus;
    return TrendingDown;
};

export const HealthBreakdown: React.FC<HealthBreakdownProps> = ({ factors, overallScore, healthLabel }) => {
    const scoreColor = overallScore >= 80 ? '#10B981' : overallScore >= 60 ? '#22D3EE' : overallScore >= 40 ? '#F59E0B' : '#EF4444';

    return (
        <div className="glass-card p-5 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white">Financial Health Score</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Based on income, savings &amp; debt</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black" style={{ color: scoreColor }}>{overallScore}</div>
                    <div className="text-[10px] font-semibold" style={{ color: scoreColor }}>{healthLabel}</div>
                </div>
            </div>

            {/* Score bar */}
            <div className="relative h-2 bg-white/5 rounded-full mb-5 overflow-hidden">
                <div className="absolute inset-0 flex">
                    <div className="h-full w-[40%]" style={{ background: 'linear-gradient(90deg, #EF4444, #F59E0B)' }} />
                    <div className="h-full w-[20%]" style={{ background: 'linear-gradient(90deg, #F59E0B, #22D3EE)' }} />
                    <div className="h-full w-[20%]" style={{ background: 'linear-gradient(90deg, #22D3EE, #10B981)' }} />
                    <div className="h-full w-[20%]" style={{ background: '#10B981' }} />
                </div>
                <motion.div
                    className="absolute top-0 w-3 h-3 rounded-full border-2 border-white -translate-y-[2px]"
                    style={{ backgroundColor: scoreColor }}
                    initial={{ left: '0%' }}
                    animate={{ left: `${overallScore}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
            </div>

            {/* Factor breakdown */}
            <div className="space-y-3">
                {factors.map((f, i) => {
                    const Icon = labelIcon(f.label);
                    return (
                        <motion.div
                            key={f.factor}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${f.color}20` }}>
                                        <Icon size={11} style={{ color: f.color }} />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-300">{f.factor}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${f.color}18`, color: f.color }}>
                                        {f.label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">{f.score}/100</span>
                                </div>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: f.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${f.score}%` }}
                                    transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-600 mt-1">{f.detail}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Scale labels */}
            <div className="flex justify-between text-[9px] text-slate-600 mt-4">
                <span>Poor</span><span>Average</span><span>Good</span><span>Excellent</span>
            </div>
        </div>
    );
};
