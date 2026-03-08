import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const goals = [
    {
        icon: '🛡️',
        name: 'Emergency Fund',
        target: 300000,
        current: 81000,
        color: '#2563EB',
        glow: 'rgba(37,99,235,0.3)',
        label: '₹3,00,000 target',
        monthlyReq: '₹24,000/mo',
    },
    {
        icon: '🏠',
        name: 'House Downpayment',
        target: 1000000,
        current: 180000,
        color: '#7C3AED',
        glow: 'rgba(124,58,237,0.3)',
        label: '₹10,00,000 target',
        monthlyReq: '₹68,000/mo',
    },
    {
        icon: '✈️',
        name: 'Travel Fund',
        target: 150000,
        current: 72000,
        color: '#0891B2',
        glow: 'rgba(8,145,178,0.3)',
        label: '₹1,50,000 target',
        monthlyReq: '₹13,000/mo',
    },
];

export const GoalTrackingSection: React.FC = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-28 px-6 relative"
            style={{ background: 'linear-gradient(to bottom, #03040E, #060812, #03040E)' }}>
            {/* Background blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute left-[-10%] top-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
                <div className="absolute right-[-5%] bottom-1/4 w-72 h-72 rounded-full opacity-8 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #0891B2, transparent)' }} />
            </div>

            <div className="max-w-6xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-3">Goal Tracking</p>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Set goals.{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #34D399, #0891B2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Track progress.
                        </span>{' '}
                        Win.
                    </h2>
                    <p className="text-slate-400 text-lg max-w-lg mx-auto">
                        Define your financial milestones and let AI tell you exactly how much to save each month.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {goals.map((goal, i) => {
                        const pct = Math.min((goal.current / goal.target) * 100, 100);
                        const remaining = goal.target - goal.current;
                        return (
                            <motion.div
                                key={goal.name}
                                initial={{ opacity: 0, y: 40 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.65, delay: i * 0.12 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="relative rounded-2xl p-6 overflow-hidden group cursor-default"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    backdropFilter: 'blur(24px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.border = `1px solid ${goal.color}40`;
                                    e.currentTarget.style.boxShadow = `0 0 50px ${goal.glow}`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                                    e.currentTarget.style.boxShadow = '';
                                }}
                            >
                                {/* Top gradient line */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: `linear-gradient(90deg, transparent, ${goal.color}, transparent)` }} />

                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{goal.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-white text-base">{goal.name}</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">{goal.label}</p>
                                        </div>
                                    </div>
                                    <span
                                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                                        style={{ background: `${goal.color}20`, color: goal.color }}
                                    >
                                        {pct.toFixed(0)}%
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                                        <span>₹{(goal.current / 1000).toFixed(0)}K saved</span>
                                        <span>₹{(goal.target / 100000).toFixed(0)}L goal</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={inView ? { width: `${pct}%` } : {}}
                                            transition={{ duration: 1.2, delay: i * 0.12 + 0.4, ease: 'easeOut' }}
                                            className="h-full rounded-full relative"
                                            style={{
                                                background: `linear-gradient(90deg, ${goal.color}, ${goal.color}90)`,
                                                boxShadow: `0 0 12px ${goal.color}60`,
                                            }}
                                        >
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white/30"
                                                style={{ backgroundColor: goal.color }} />
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <p className="text-[10px] text-slate-500 mb-0.5">Remaining</p>
                                        <p className="text-sm font-bold text-white">₹{(remaining / 1000).toFixed(0)}K</p>
                                    </div>
                                    <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <p className="text-[10px] text-slate-500 mb-0.5">Monthly</p>
                                        <p className="text-sm font-bold" style={{ color: goal.color }}>{goal.monthlyReq}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
