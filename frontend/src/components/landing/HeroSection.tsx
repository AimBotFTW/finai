import { motion, useAnimationFrame } from 'framer-motion';
import { useState, useRef } from 'react';
import { Eye, TrendingUp, ArrowUpRight, Wallet } from 'lucide-react';

interface HeroSectionProps {
    onEnterDashboard: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onEnterDashboard }) => {
    const [floatY, setFloatY] = useState(0);
    const t = useRef(0);

    useAnimationFrame((time) => {
        t.current = time;
        setFloatY(Math.sin(time / 1800) * 10);
    });

    return (
        <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* === Large orb glow — matches reference image === */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Bottom orb: deep purple-blue bowl */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: '900px',
                        height: '900px',
                        bottom: '-480px',
                        background: 'radial-gradient(ellipse at center, #5B21B6 0%, #1D4ED8 35%, #0EA5E9 55%, transparent 75%)',
                        filter: 'blur(80px)',
                        opacity: 0.55,
                    }}
                />
                {/* Top pink/violet glow */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: '600px',
                        height: '300px',
                        top: '18%',
                        background: 'radial-gradient(ellipse at center, #C026D3 0%, #7C3AED 50%, transparent 80%)',
                        filter: 'blur(70px)',
                        opacity: 0.35,
                    }}
                />
                {/* Centre bright spot */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: '280px',
                        height: '280px',
                        top: '32%',
                        background: 'radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />
            </div>

            {/* Star-field noise layer */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `radial-gradient(1px 1px at 20% 30%, #fff 0%, transparent 100%),
                            radial-gradient(1px 1px at 60% 15%, #fff 0%, transparent 100%),
                            radial-gradient(1px 1px at 80% 50%, #fff 0%, transparent 100%),
                            radial-gradient(1px 1px at 40% 80%, #fff 0%, transparent 100%),
                            radial-gradient(1px 1px at 10% 65%, #fff 0%, transparent 100%)`,
                    backgroundSize: '200% 200%',
                }}
            />

            {/* Hero Text */}
            <div className="relative z-10 text-center px-6 mb-10 mt-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-widest uppercase text-violet-300"
                        style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                        ✦ AI-Powered Finance Management
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-5">
                        Your Wealth,<br />
                        <span
                            className="inline-block"
                            style={{
                                background: 'linear-gradient(135deg, #A78BFA 0%, #EC4899 45%, #60A5FA 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            AI-Powered
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-10 font-medium">
                        Smart financial intelligence for the modern Indian investor.
                        Track, plan, and optimize your wealth with deterministic engines and generative AI.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onEnterDashboard}
                            className="flex items-center gap-3 px-7 py-3.5 rounded-full font-bold text-white text-sm"
                            style={{
                                background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
                                boxShadow: '0 0 20px rgba(124,58,237,0.4)',
                            }}
                        >
                            Get Started
                            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">→</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onEnterDashboard}
                            className="flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm text-white"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                            <Eye size={15} /> View Dashboard
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* ===== FOCAL CARD — floating balance card ===== */}
            <div className="relative z-10 w-full max-w-5xl px-6 flex items-end justify-center" style={{ minHeight: '280px' }}>

                {/* Left blur widget — expenses pie */}
                <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="hidden lg:block absolute left-4 bottom-6 w-44"
                    style={{ transform: `translateY(${-floatY * 0.4}px)` }}
                >
                    <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-[10px] text-slate-400 mb-2">Expenses Report</p>
                        <div className="flex items-center justify-center my-2">
                            <div className="relative w-16 h-16">
                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7C3AED" strokeWidth="3" strokeDasharray="67 33" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-[10px] font-bold text-white">67%</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-white text-center">₹50,000</p>
                        <p className="text-[10px] text-slate-500 text-center">of budget used</p>
                    </div>
                    <div className="mt-2 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-[10px] text-slate-400 mb-1">Saving Budget</p>
                        <p className="text-sm font-bold text-white">₹25,000</p>
                        <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: '71%' }} />
                        </div>
                    </div>
                </motion.div>

                {/* Centre — Main Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    style={{ translateY: floatY }}
                    className="relative z-20 w-72 md:w-80"
                >
                    <div
                        className="rounded-3xl p-6 overflow-hidden relative"
                        style={{
                            background: 'linear-gradient(145deg, rgba(99,60,220,0.85) 0%, rgba(37,99,235,0.75) 60%, rgba(8,145,178,0.7) 100%)',
                            backdropFilter: 'blur(30px)',
                            border: '1px solid rgba(167,139,250,0.3)',
                            boxShadow: '0 30px 80px rgba(99,60,220,0.45), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.2)',
                        }}
                    >
                        {/* Glass shine */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-3xl opacity-20"
                            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />

                        <div className="relative">
                            <p className="text-xs text-violet-200 mb-1 font-medium">Total Balance</p>
                            <div className="flex items-center gap-2 mb-5">
                                <h2 className="text-4xl font-black text-white tracking-tight">₹4,23,000</h2>
                                <Eye size={18} className="text-violet-300 mt-1" />
                            </div>

                            <div className="h-px bg-white/15 mb-5" />

                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Income', value: '₹75,000', icon: ArrowUpRight, color: '#34D399' },
                                    { label: 'Expenses', value: '₹50,000', icon: TrendingUp, color: '#F87171' },
                                    { label: 'Savings', value: '₹25,000', icon: Wallet, color: '#60A5FA' },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.label} className="text-center">
                                            <p className="text-[10px] text-violet-200 mb-1">{item.label}</p>
                                            <p className="text-sm font-bold text-white">{item.value}</p>
                                            <Icon size={11} className="mx-auto mt-1" style={{ color: item.color }} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right blur widget — transactions & goals */}
                <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="hidden lg:block absolute right-4 bottom-6 w-44 space-y-2"
                    style={{ transform: `translateY(${-floatY * 0.6}px)` }}
                >
                    <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] text-slate-400">Transactions</p>
                            <span className="text-[9px] bg-white/10 text-white px-1.5 py-0.5 rounded">Latest</span>
                        </div>
                        {[
                            { name: 'Grocery', amt: '-₹2,400', color: '#F87171' },
                            { name: 'Salary', amt: '+₹75,000', color: '#34D399' },
                            { name: 'Netflix', amt: '-₹649', color: '#F87171' },
                        ].map((tx) => (
                            <div key={tx.name} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                                <span className="text-[10px] text-slate-300">{tx.name}</span>
                                <span className="text-[10px] font-semibold" style={{ color: tx.color }}>{tx.amt}</span>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-[10px] text-slate-400 mb-2">Your Goals</p>
                        {[
                            { name: 'House Loan', pct: 42, color: '#7C3AED' },
                            { name: 'Emergency', pct: 27, color: '#2563EB' },
                        ].map((g) => (
                            <div key={g.name} className="mb-2 last:mb-0">
                                <div className="flex justify-between mb-1">
                                    <span className="text-[10px] text-slate-300">{g.name}</span>
                                    <span className="text-[10px] text-slate-400">{g.pct}%</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${g.pct}%`, backgroundColor: g.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1"
                >
                    <div className="w-1 h-2 bg-white/40 rounded-full" />
                </motion.div>
                <p className="text-[10px] text-slate-600 tracking-widest uppercase">Scroll</p>
            </motion.div>
        </section>
    );
};
