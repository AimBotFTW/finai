import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Sparkles, ArrowRight, Shield, TrendingUp, Bot } from 'lucide-react';

interface CTASectionProps {
    onEnterDashboard: () => void;
}

const stats = [
    { value: '₹50Cr+', label: 'Assets Tracked' },
    { value: '10K+', label: 'Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: 'Gemini AI', label: 'Powered By' },
];

const trustPills = [
    { icon: Shield, text: 'Bank-grade Security' },
    { icon: TrendingUp, text: 'Real-time Insights' },
    { icon: Bot, text: 'Gemini AI' },
];

export const CTASection: React.FC<CTASectionProps> = ({ onEnterDashboard }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="py-28 px-6 relative overflow-hidden">
            {/* Background deep orb */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-[900px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(99,60,220,0.25) 0%, rgba(37,99,235,0.15) 40%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
            </div>

            <div className="max-w-5xl mx-auto relative">
                {/* Stats bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: i * 0.1 }}
                            className="text-center rounded-2xl py-5"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
                            <p className="text-xs text-slate-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main CTA block */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99,60,220,0.3) 0%, rgba(37,99,235,0.2) 50%, rgba(8,145,178,0.15) 100%)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(167,139,250,0.2)',
                        boxShadow: '0 0 80px rgba(99,60,220,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                >
                    {/* Animated shine */}
                    <div className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.8), transparent)' }} />

                    {/* Floating sparkles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{
                                left: `${10 + i * 16}%`,
                                top: `${15 + (i % 3) * 25}%`,
                                width: '3px',
                                height: '3px',
                                borderRadius: '50%',
                                background: i % 2 === 0 ? '#A78BFA' : '#60A5FA',
                            }}
                            animate={{
                                y: [-5, 5, -5],
                                opacity: [0.3, 1, 0.3],
                                scale: [0.8, 1.2, 0.8],
                            }}
                            transition={{
                                duration: 2 + i * 0.4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.3,
                            }}
                        />
                    ))}

                    <div className="flex items-center justify-center gap-2 mb-5">
                        <Sparkles size={16} className="text-violet-400" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                            Start for free today
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-5">
                        Start Managing Your<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #A78BFA 0%, #EC4899 50%, #60A5FA 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Wealth Smarter
                        </span>
                    </h2>

                    <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                        Join thousands of Indians taking control of their finances with AI-powered insights and beautiful dashboards.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(124,58,237,0.6)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onEnterDashboard}
                            className="flex items-center gap-3 px-9 py-4 rounded-full font-black text-white text-base"
                            style={{
                                background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
                                boxShadow: '0 0 25px rgba(124,58,237,0.4)',
                            }}
                        >
                            Launch Dashboard
                            <ArrowRight size={18} />
                        </motion.button>

                        <p className="text-sm text-slate-500">No credit card required · Free forever</p>
                    </div>

                    {/* Trust pills */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                        {trustPills.map((pill) => {
                            const Icon = pill.icon;
                            return (
                                <div key={pill.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-slate-300"
                                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Icon size={12} className="text-violet-400" />
                                    {pill.text}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
