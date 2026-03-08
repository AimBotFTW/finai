import { motion } from 'framer-motion';
import { AIAdvice } from '../types';
import { LucideIcon, Zap, TrendingUp, Shield, FileText, DollarSign } from 'lucide-react';

interface AIAdvisorPanelProps {
    advice: AIAdvice[];
    isLoading: boolean;
}

const priorityConfig: Record<string, any> = {
    high: { color: '#EF4444', bg: 'bg-danger/10 border-danger/20', badge: 'bg-danger/20 text-danger' },
    medium: { color: '#F59E0B', bg: 'bg-warning/10 border-warning/20', badge: 'bg-warning/20 text-warning' },
    low: { color: '#2563EB', bg: 'bg-primary/10 border-primary/20', badge: 'bg-primary/20 text-primary' },
};

const categoryIcons: Record<string, LucideIcon> = {
    'SIP Investment': TrendingUp,
    'Debt Reduction': DollarSign,
    'Emergency Fund': Shield,
    'Tax Savings': FileText,
    'Side Income': Zap,
};

export const AIAdvisorPanel: React.FC<AIAdvisorPanelProps> = ({ advice, isLoading }) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="section-title">AI Recommendations</h2>
                    <p className="section-subtitle">Powered by Google Gemini AI</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-success font-medium">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    AI Active
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card p-4 animate-pulse">
                            <div className="h-3 bg-white/10 rounded w-1/3 mb-2" />
                            <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                            <div className="h-3 bg-white/10 rounded w-full" />
                            <div className="h-3 bg-white/10 rounded w-4/5 mt-1" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {advice.map((item, i) => {
                        const priorityKey = (item.priority || 'medium').toLowerCase() as keyof typeof priorityConfig;
                        const config = priorityConfig[priorityKey] || priorityConfig.medium;
                        const Icon = categoryIcons[item.category] || Zap;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`glass-card p-4 border ${config.bg} group hover:scale-[1.01] transition-transform cursor-default`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{ backgroundColor: `${config.color}20` }}
                                    >
                                        <Icon size={16} color={config.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config.badge}`}>
                                                {item.priority}
                                            </span>
                                            <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                                                {item.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                                    </div>
                                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
