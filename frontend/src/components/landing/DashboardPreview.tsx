import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

const savingsData = [
    { month: 'Sep', savings: 18000 },
    { month: 'Oct', savings: 21000 },
    { month: 'Nov', savings: 19500 },
    { month: 'Dec', savings: 23000 },
    { month: 'Jan', savings: 25500 },
    { month: 'Feb', savings: 27000 },
];

const pieData = [
    { name: 'Savings', value: 27000, color: '#7C3AED' },
    { name: 'Expenses', value: 48000, color: '#2563EB' },
];

interface DashboardPreviewProps {
    onEnterDashboard: () => void;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ onEnterDashboard }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24 px-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #03040E, #070A18, #03040E)' }}>
            {/* Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, #2563EB, transparent)' }} />

            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-14"
                >
                    <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-3">Dashboard Preview</p>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Your Entire Financial Life<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #60A5FA, #A78BFA)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            in One Dashboard
                        </span>
                    </h2>
                </motion.div>

                {/* Mock dashboard UI */}
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.96 }}
                    animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.9, delay: 0.2 }}
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                        background: 'rgba(8,12,36,0.9)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                >
                    {/* Mock header bar */}
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                        <div className="w-3 h-3 rounded-full bg-red-500/60" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                        <div className="w-3 h-3 rounded-full bg-green-500/60" />
                        <div className="flex-1 mx-4 h-5 rounded bg-white/5 flex items-center px-2">
                            <span className="text-[10px] text-slate-600">finai.app/dashboard</span>
                        </div>
                    </div>

                    {/* Dashboard content */}
                    <div className="p-5 grid grid-cols-12 gap-4">
                        {/* Left sidebar sim */}
                        <div className="col-span-2 hidden lg:flex flex-col gap-3">
                            {['Dashboard', 'Insights', 'Invest', 'Goals', 'AI Advisor'].map((label, i) => (
                                <div key={label} className={`h-8 rounded-xl flex items-center px-3 text-[11px] font-medium ${i === 0 ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30' : 'text-slate-500'}`}>
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Main content */}
                        <div className="col-span-12 lg:col-span-10 space-y-4">
                            {/* Metric cards row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'Monthly Income', value: '₹75,000', color: '#10B981', sub: '+8.2%' },
                                    { label: 'Monthly Savings', value: '₹27,000', color: '#7C3AED', sub: '+12.5%' },
                                    { label: 'Debt Ratio', value: '26.7%', color: '#EF4444', sub: '-4.1%' },
                                    { label: 'Health Score', value: '72/100', color: '#2563EB', sub: 'Good' },
                                ].map((card) => (
                                    <div key={card.label} className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <p className="text-[10px] text-slate-500 mb-1">{card.label}</p>
                                        <p className="text-base font-bold" style={{ color: card.color }}>{card.value}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{card.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Charts row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <p className="text-xs text-slate-400 mb-3 font-medium">Savings Trend</p>
                                    <ResponsiveContainer width="100%" height={100}>
                                        <AreaChart data={savingsData}>
                                            <defs>
                                                <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="savings" stroke="#7C3AED" fill="url(#sGrad)" strokeWidth={2} dot={false} />
                                            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <p className="text-xs text-slate-400 mb-3 font-medium">Income vs Expenses</p>
                                    <div className="flex items-center gap-4">
                                        <ResponsiveContainer width="50%" height={100}>
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0}>
                                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="space-y-2">
                                            {pieData.map((d) => (
                                                <div key={d.name} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                                    <div>
                                                        <p className="text-[10px] text-slate-400">{d.name}</p>
                                                        <p className="text-xs font-bold text-white">₹{(d.value / 1000).toFixed(0)}K</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gradient fade bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                        style={{ background: 'linear-gradient(to bottom, transparent, #03040E)' }} />
                </motion.div>

                {/* CTA under preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-10"
                >
                    <motion.button
                        whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onEnterDashboard}
                        className="px-8 py-3.5 rounded-full text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
                    >
                        Try the Dashboard →
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};
