import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, TrendingUp } from 'lucide-react';
import { AIAdvice } from '../types';

interface AIInsightCardProps {
    advice: AIAdvice[];
    onDetailedAnalysis: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ advice, onDetailedAnalysis }) => {
    // Generate insights from advice if available, otherwise fallback to empty state
    const insights = advice.slice(0, 3).map((a) => ({
        text: a.description,
        metric: a.priority === 'high' ? 'High' : a.priority === 'medium' ? 'Med' : 'Low',
        label: a.title,
        color: a.priority === 'high' ? '#EF4444' : a.priority === 'medium' ? '#F59E0B' : '#10B981',
    }));

    if (insights.length === 0) {
        insights.push({
            text: 'Run the analysis to get personalized AI insights and optimization strategies.',
            metric: '...',
            label: 'waiting for data',
            color: '#94A3B8',
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="ai-glow-card p-5 relative overflow-hidden"
        >
            {/* Background gradient mesh */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-2xl opacity-60"
                    style={{ background: 'linear-gradient(to top, rgba(88,28,235,0.25), transparent)' }} />
                <div className="absolute -bottom-12 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
            </div>

            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                            <Sparkles size={12} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-white">AI Insights</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                        Gemini AI
                    </div>
                </div>

                {/* Insights list */}
                <div className="space-y-3">
                    {insights.map((ins, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex flex-col items-center justify-center"
                                style={{ background: `${ins.color}15`, border: `1px solid ${ins.color}25` }}>
                                <span className="text-[10px] font-black" style={{ color: ins.color }}>{ins.metric}</span>
                                <span className="text-[8px] text-slate-500">{ins.label}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{ins.text}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onDetailedAnalysis}
                    className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2"
                    style={{
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(37,99,235,0.4))',
                        border: '1px solid rgba(124,58,237,0.3)',
                    }}
                >
                    <TrendingUp size={13} /> Get Detailed Analysis
                    <ArrowUpRight size={13} />
                </motion.button>
            </div>
        </motion.div>
    );
};
