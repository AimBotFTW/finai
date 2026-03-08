import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ArrowDown } from 'lucide-react';

export interface BudgetCategory {
    category: string;
    amount: number;
    color: string;
    percentage: number;
    recommended_pct: number;
    status: 'optimal' | 'over' | 'under';
    suggestion: string;
}

interface BudgetOptimizerProps {
    categories: BudgetCategory[];
    monthlyExpenses: number;
}

const STATUS_CONFIG = {
    over: { icon: AlertTriangle, label: 'Over budget', color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
    optimal: { icon: CheckCircle2, label: 'Optimal', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
    under: { icon: ArrowDown, label: 'Under', color: '#22D3EE', bg: 'rgba(34,211,238,0.08)' },
};

export const BudgetOptimizer: React.FC<BudgetOptimizerProps> = ({ categories, monthlyExpenses }) => {
    const overSpend = categories.filter(c => c.status === 'over');
    const potentialSavings = overSpend.reduce((sum, c) => {
        return sum + Math.round(monthlyExpenses * (c.percentage - c.recommended_pct) / 100);
    }, 0);

    return (
        <div className="glass-card p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white">AI Budget Optimizer</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Spending vs Indian household benchmarks</p>
                </div>
                {potentialSavings > 0 && (
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500">Potential saving</p>
                        <p className="text-base font-black text-success">+₹{potentialSavings.toLocaleString('en-IN')}/mo</p>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {categories.map((cat, i) => {
                    const cfg = STATUS_CONFIG[cat.status];
                    const Icon = cfg.icon;
                    const barMax = Math.max(cat.percentage, cat.recommended_pct) + 5;

                    return (
                        <motion.div
                            key={cat.category}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="p-3 rounded-xl"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                    <span className="text-xs font-semibold text-slate-300">{cat.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon size={11} style={{ color: cfg.color }} />
                                    <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        ₹{cat.amount.toLocaleString('en-IN')} ({cat.percentage}%)
                                    </span>
                                </div>
                            </div>

                            {/* Dual bar: actual vs recommended */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-slate-600 w-14">Actual</span>
                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(cat.percentage / barMax) * 100}%` }}
                                            transition={{ duration: 0.7, delay: i * 0.06 }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-slate-500 w-6 text-right">{cat.percentage}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-slate-600 w-14">Target</span>
                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full opacity-40"
                                            style={{ backgroundColor: cat.color, width: `${(cat.recommended_pct / barMax) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-slate-500 w-6 text-right">{cat.recommended_pct}%</span>
                                </div>
                            </div>

                            {cat.status === 'over' && (
                                <p className="text-[10px] text-slate-400 mt-1.5">{cat.suggestion}</p>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
