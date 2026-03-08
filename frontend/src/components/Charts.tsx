import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    AreaChart, Area,
} from 'recharts';
import { FinancialData } from '../types';

interface ChartsProps {
    data: FinancialData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-2xl p-3 text-xs" style={{ background: 'rgba(8,13,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
            {label && <p className="text-slate-400 mb-2 font-medium">{label}</p>}
            {payload.map((entry: any, i: number) => (
                <p key={i} className="font-semibold" style={{ color: entry.color || entry.stroke || entry.fill }}>
                    {entry.name}: <span className="text-white">₹{Number(entry.value).toLocaleString('en-IN')}</span>
                </p>
            ))}
        </div>
    );
};

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.07) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export const Charts: React.FC<ChartsProps> = ({ data }) => {
    const metrics = data?.metrics;
    const charts = data?.charts;

    if (!metrics || metrics.monthly_income === 0 || !charts) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-5 flex items-center justify-center"
                        style={{ minHeight: '250px' }}
                    >
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50"
                                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                                <span className="text-white text-lg">📊</span>
                            </div>
                            <p className="text-sm text-slate-400">No data available</p>
                            <p className="text-xs text-slate-600 mt-1">Analyze your finances to see charts</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    const summary = charts.summary;
    const budget = charts.budget || [];
    const forecast = charts.forecast || [];
    const goals = charts.goals || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* 1. Income vs Savings Split (Donut from charts.summary) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-5"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-white mb-0.5">Income Distribution</h3>
                        <p className="text-xs text-slate-500">Savings vs Expenses</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Monthly Income</p>
                        <p className="text-sm font-bold text-white">₹{summary?.total?.toLocaleString('en-IN') || 0}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={190}>
                        {summary?.segments?.length ? (
                            <PieChart>
                                <Pie
                                    data={summary.segments}
                                    cx="50%" cy="50%"
                                    innerRadius={52} outerRadius={82}
                                    dataKey="value"
                                    nameKey="name"
                                    labelLine={false}
                                    strokeWidth={2}
                                    stroke="rgba(8,13,26,0.8)"
                                    label={renderLabel}
                                >
                                    {summary.segments.map((s: any, i: number) => <Cell key={i} fill={s.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            </PieChart>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-xs">No summary data</div>
                        )}
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                        {summary?.segments?.map((s: any) => (
                            <div key={s.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-[11px] text-slate-400">{s.name}</span>
                                </div>
                                <span className="text-[11px] font-semibold text-white">₹{(s.value / 1000).toFixed(1)}K</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* 2. Expense Breakdown Donut (charts.budget) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-5"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-white mb-0.5">Expense Breakdown</h3>
                        <p className="text-xs text-slate-500">Monthly allocation</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Total Expenses</p>
                        <p className="text-sm font-bold text-white">₹{metrics.monthly_expenses.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={190}>
                        {budget.length > 0 ? (
                            <PieChart>
                                <Pie
                                    data={budget}
                                    cx="50%" cy="50%"
                                    innerRadius={52} outerRadius={82}
                                    dataKey="amount"
                                    nameKey="category"
                                    labelLine={false}
                                    strokeWidth={2}
                                    stroke="rgba(8,13,26,0.8)"
                                    label={renderLabel}
                                >
                                    {budget.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const d = payload[0].payload;
                                    return (
                                        <div className="rounded-xl p-2.5 text-xs shadow-2xl" style={{ background: 'rgba(8,13,26,0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                                            <p className="font-bold text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{d.category}</p>
                                            <p className="text-slate-400 font-medium">₹{Number(d.amount).toLocaleString('en-IN')}</p>
                                        </div>
                                    );
                                }} />
                            </PieChart>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-xs">No expense data</div>
                        )}
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                        {budget.length > 0 ? budget.slice(0, 6).map((item: any) => (
                            <div key={item.category} className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[11px] text-slate-400">{item.category}</span>
                                </div>
                                <span className="text-[11px] font-semibold text-white">₹{(item.amount / 1000).toFixed(1)}K</span>
                            </div>
                        )) : null}
                    </div>
                </div>
            </motion.div>

            {/* 3. Savings vs Target Bar (charts.forecast) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-5"
            >
                <h3 className="text-sm font-bold text-white mb-0.5">Savings Projection</h3>
                <p className="text-xs text-slate-500 mb-4">Savings growth trajectory over 6 months</p>
                <ResponsiveContainer width="100%" height={185}>
                    {forecast.length > 0 ? (
                        <BarChart data={forecast} barCategoryGap="35%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="savings" name="Savings" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="target" name="Target" fill="rgba(255,255,255,0.06)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">No forecast data</div>
                    )}
                </ResponsiveContainer>
            </motion.div>

            {/* 4. Goal Milestones / Emergency Area Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-5"
            >
                <h3 className="text-sm font-bold text-white mb-0.5">Milestone Projection</h3>
                <p className="text-xs text-slate-500 mb-4">Tracking toward financial goals</p>
                <ResponsiveContainer width="100%" height={185}>
                    {goals.length > 0 ? (
                        <AreaChart data={goals}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="period" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="accumulated"
                                name="Goal Corpus"
                                stroke="#10B981"
                                strokeWidth={2.5}
                                fill="rgba(16, 185, 129, 0.2)"
                                dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: '#10B981', strokeWidth: 0 }}
                            />
                        </AreaChart>
                    ) : forecast.length > 0 ? (
                        <AreaChart data={forecast}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="emergency"
                                name="Emergency Fund"
                                stroke="#10B981"
                                strokeWidth={2.5}
                                fill="rgba(16, 185, 129, 0.2)"
                                dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: '#10B981', strokeWidth: 0 }}
                            />
                        </AreaChart>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">No milestone data</div>
                    )}
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
};
