import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, Circle } from 'lucide-react';

interface Milestone {
    age: number;
    title: string;
    description: string;
    status: 'done' | 'current' | 'upcoming';
    icon: string;
    color: string;
}

interface FinancialRoadmapProps {
    currentAge: number;
    riskProfile: 'conservative' | 'moderate' | 'aggressive';
    monthlySavings: number;
}

function buildMilestones(age: number, riskProfile: string, monthlySavings: number): Milestone[] {
    const base: Omit<Milestone, 'status'>[] = [
        { age: 22, icon: '🛡️', color: '#10B981', title: 'Emergency Fund', description: '6 months of expenses in liquid fund. Your financial safety net.' },
        { age: 25, icon: '📈', color: '#2563EB', title: 'Start Equity SIP', description: `Begin ₹${Math.round(monthlySavings * 0.50 / 500) * 500}/month in Nifty 50 Index Fund.` },
        { age: 28, icon: '🏦', color: '#7C3AED', title: 'Maximize 80C + NPS', description: 'Invest ₹1.5L in ELSS + ₹50K NPS for tax-free wealth compounding.' },
        { age: 30, icon: '🏡', color: '#F59E0B', title: 'House Down Payment', description: '₹20–30L corpus via SIP. At 30% savings rate, achievable in 5 years.' },
        { age: 35, icon: '📊', color: '#0891B2', title: 'Portfolio Diversify', description: 'Add Int\'l ETFs, REITs, Gold. Reduce single-country risk.' },
        { age: 40, icon: '🎓', color: '#8B5CF6', title: 'Education Planning', description: 'Start ₹10K/month SIP for child\'s higher education corpus of ₹50L.' },
        { age: 45, icon: '💼', color: '#EC4899', title: 'Retirement Gear-Up', description: 'Shift 40% to debt funds. Target 25x annual expenses as retirement corpus.' },
        { age: 55, icon: '🌴', color: '#10B981', title: 'Pre-Retirement', description: 'Buy annuity. Consolidate assets. Ensure ₹2Cr+ corpus.' },
        { age: 60, icon: '🎉', color: '#F59E0B', title: 'Retirement', description: 'Live off 4% withdrawal rate. Corpus sustains for 30+ years.' },
    ];

    return base.map((m) => ({
        ...m,
        status: m.age < age ? 'done' : m.age <= age + 3 ? 'current' : 'upcoming',
    }));
}

export const FinancialRoadmap: React.FC<FinancialRoadmapProps> = ({ currentAge, riskProfile, monthlySavings }) => {
    const milestones = buildMilestones(currentAge, riskProfile, monthlySavings);
    const nearestIndex = milestones.findIndex((m) => m.status === 'current') || 0;

    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                    <MapPin size={14} className="text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">Financial Life Roadmap</h3>
                    <p className="text-[10px] text-slate-500">Age-based financial milestones · Currently {currentAge}</p>
                </div>
            </div>

            {/* Horizontal scroll timeline */}
            <div className="overflow-x-auto pb-2 -mx-1 px-1">
                <div className="flex items-start gap-0 min-w-max relative">
                    {/* Connector line */}
                    <div className="absolute top-[22px] left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                    {milestones.map((m, i) => {
                        const isDone = m.status === 'done';
                        const isCurrent = m.status === 'current';
                        return (
                            <motion.div
                                key={m.age}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="flex flex-col items-center gap-2 px-3 group"
                                style={{ minWidth: 110 }}
                            >
                                {/* Dot */}
                                <div className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center text-lg transition-transform group-hover:scale-110"
                                    style={{
                                        background: isDone ? `${m.color}25` : isCurrent ? `${m.color}35` : 'rgba(255,255,255,0.04)',
                                        border: `2px solid ${isCurrent ? m.color : isDone ? m.color + '60' : 'rgba(255,255,255,0.08)'}`,
                                        boxShadow: isCurrent ? `0 0 18px ${m.color}40` : 'none',
                                    }}>
                                    <span className={isDone ? 'opacity-50' : ''}>{m.icon}</span>
                                    {isCurrent && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full"
                                            style={{ border: `2px solid ${m.color}` }}
                                            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}
                                </div>

                                {/* Age badge */}
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                                    style={{
                                        background: isCurrent ? `${m.color}20` : 'transparent',
                                        color: isCurrent ? m.color : isDone ? '#475569' : '#64748B',
                                        border: `1px solid ${isCurrent ? m.color + '40' : 'transparent'}`,
                                    }}>
                                    Age {m.age}
                                </span>

                                {/* Title & desc */}
                                <div className="text-center">
                                    <p className="text-[11px] font-bold leading-tight"
                                        style={{ color: isDone ? '#475569' : isCurrent ? 'white' : '#94A3B8' }}>
                                        {m.title}
                                    </p>
                                    <p className="text-[9px] text-slate-600 leading-tight mt-0.5 max-w-[100px]">{m.description}</p>
                                </div>

                                {/* Done checkmark */}
                                {isDone && <CheckCircle2 size={12} style={{ color: m.color }} className="opacity-60" />}
                                {isCurrent && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${m.color}20`, color: m.color }}>
                                        Now
                                    </span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Current milestone detail */}
            {milestones[nearestIndex] && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 p-3 rounded-xl text-xs"
                    style={{ background: `${milestones[nearestIndex].color}10`, border: `1px solid ${milestones[nearestIndex].color}25` }}
                >
                    <span className="font-semibold" style={{ color: milestones[nearestIndex].color }}>📍 Focus now: </span>
                    <span className="text-slate-300">{milestones[nearestIndex].description}</span>
                </motion.div>
            )}
        </div>
    );
};
