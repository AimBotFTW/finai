import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Bot, BarChart3, Target, LineChart } from 'lucide-react';

const features = [
    {
        icon: Bot,
        title: 'AI Financial Advisor',
        description: 'Get intelligent financial recommendations personalized to your income, debt, and goals — powered by Gemini AI.',
        color: '#7C3AED',
        glow: 'rgba(124,58,237,0.3)',
    },
    {
        icon: BarChart3,
        title: 'Wealth Tracking',
        description: 'Track savings, investments, mutual funds, and assets in one unified dashboard with real-time insights.',
        color: '#2563EB',
        glow: 'rgba(37,99,235,0.3)',
    },
    {
        icon: Target,
        title: 'Goal Planning',
        description: 'Set ambitious financial goals — emergency fund, house, retirement — and get a precise monthly saving plan.',
        color: '#10B981',
        glow: 'rgba(16,185,129,0.3)',
    },
    {
        icon: LineChart,
        title: 'Interactive Analytics',
        description: 'Visual dashboards with Recharts — income vs expense pies, savings projection lines, and radar health scores.',
        color: '#EC4899',
        glow: 'rgba(236,72,153,0.3)',
    },
];

export const FeaturesSection: React.FC = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="features" ref={ref} className="py-28 px-6 relative" style={{ background: 'linear-gradient(to bottom, #03040E, #060814 60%, #03040E)' }}>
            {/* Section glow */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <div className="w-96 h-96 rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
            </div>

            <div className="max-w-6xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">Why FinAI?</p>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Everything you need to{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #A78BFA, #EC4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            grow wealth
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        One platform. Every financial tool you need, beautifully designed.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((feat, i) => {
                        const Icon = feat.icon;
                        return (
                            <motion.div
                                key={feat.title}
                                initial={{ opacity: 0, y: 40 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="relative rounded-2xl p-6 cursor-default group overflow-hidden"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.border = `1px solid ${feat.color}40`;
                                    e.currentTarget.style.boxShadow = `0 0 40px ${feat.glow}, inset 0 0 30px ${feat.glow}`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                                    e.currentTarget.style.boxShadow = '';
                                }}
                            >
                                {/* Top shine */}
                                <div className="absolute top-0 left-0 right-0 h-px opacity-40 group-hover:opacity-80 transition-opacity"
                                    style={{ background: `linear-gradient(90deg, transparent, ${feat.color}, transparent)` }} />

                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                                    style={{ background: `${feat.color}18`, border: `1px solid ${feat.color}30` }}
                                >
                                    <Icon size={22} style={{ color: feat.color }} />
                                </div>

                                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>

                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                                        style={{ background: feat.color }}>
                                        →
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
