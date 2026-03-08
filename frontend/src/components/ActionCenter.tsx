import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';

export interface ActionItem {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    icon: string;
}

interface ActionCenterProps {
    actions: ActionItem[];
    isLoading?: boolean;
}

const PRIORITY_CONFIG = {
    high: { label: 'High', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', dot: '#EF4444' },
    medium: { label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', dot: '#F59E0B' },
    low: { label: 'Low', color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', dot: '#10B981' },
};

export const ActionCenter: React.FC<ActionCenterProps> = ({ actions, isLoading }) => {
    const sorted = [...actions].sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        const aPrio = a.priority.toLowerCase() as 'high' | 'medium' | 'low';
        const bPrio = b.priority.toLowerCase() as 'high' | 'medium' | 'low';
        return order[aPrio] - order[bPrio];
    });

    return (
        <div className="glass-card p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #EF4444, #F59E0B)' }}>
                    <Zap size={14} className="text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">Recommended Actions</h3>
                    <p className="text-[10px] text-slate-500">Prioritized for your financial profile</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                    <span className="text-[10px] text-slate-500">{actions.filter(a => a.priority === 'high').length} urgent</span>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    ))}
                </div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-2">
                        {sorted.map((action, i) => {
                            const priorityKey = action.priority.toLowerCase() as 'high' | 'medium' | 'low';
                            const cfg = PRIORITY_CONFIG[priorityKey];
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-start gap-3 p-3 rounded-xl cursor-default group hover:scale-[1.01] transition-transform"
                                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                                >
                                    {/* Emoji icon */}
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                                        style={{ background: 'rgba(0,0,0,0.2)' }}>
                                        {action.icon}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                                                style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-[10px] text-slate-500 truncate">{action.impact}</span>
                                        </div>
                                        <p className="text-xs font-semibold text-white truncate">{action.title}</p>
                                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{action.description}</p>
                                    </div>
                                    <ChevronRight size={13} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-1" />
                                </motion.div>
                            );
                        })}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
};
