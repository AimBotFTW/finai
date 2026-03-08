import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sliders, Play, RefreshCw } from 'lucide-react';
import { runSimulation } from '../api';

interface SimParams {
    monthly_investment: number;
    income_growth_rate: number;
    expense_reduction: number;
    investment_return_rate: number;
    inflation_rate: number;
    years: number;
    current_savings: number;
    existing_investments: number;
}

interface SimPoint {
    year: number;
    label: string;
    corpus: number;
    savings: number;
    net_worth: number;
}

interface ScenarioData {
    conservative: SimPoint[];
    moderate: SimPoint[];
    aggressive: SimPoint[];
}

interface Props {
    defaultIncome: number;
    defaultSavings: number;
    defaultInvestments: number;
}

const formatL = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
    return `₹${(v / 100000).toFixed(1)}L`;
};

export const WhatIfSimulator: React.FC<Props> = ({ defaultIncome, defaultSavings, defaultInvestments }) => {
    const defaultSIP = Math.round(defaultSavings * 0.60 / 500) * 500;

    const [params, setParams] = useState<SimParams>({
        monthly_investment: defaultSIP,
        income_growth_rate: 8,
        expense_reduction: 0,
        investment_return_rate: 12,
        inflation_rate: 6,
        years: 10,
        current_savings: defaultSavings * 0.40 * 12,
        existing_investments: defaultInvestments,
    });
    const [result, setResult] = useState<SimPoint[] | null>(null);
    const [scenarios, setScenarios] = useState<ScenarioData | null>(null);
    const [mode, setMode] = useState<'custom' | 'compare'>('compare');
    const [loading, setLoading] = useState(false);

    const runSim = async () => {
        setLoading(true);
        try {
            if (mode === 'compare') {
                const res = await runSimulation({ ...params, compare: true, risk_profile: 'moderate' });
                setScenarios(res);
                setResult(null);
            } else {
                const res = await runSimulation({ ...params, compare: false });
                setResult(res.scenario);
                setScenarios(null);
            }
        } catch {
            // Fallback: compute locally with real-return adjustment
            const r = params.investment_return_rate / 100;
            const realR = Math.max((params.investment_return_rate - params.inflation_rate) / 100, 0.01);
            const local: SimPoint[] = Array.from({ length: params.years }, (_, i) => {
                const y = i + 1;
                const corpus = params.existing_investments * (1 + r) ** y + params.monthly_investment * 12 * (((1 + r) ** y - 1) / r);
                const realCorpus = params.existing_investments * (1 + realR) ** y + params.monthly_investment * 12 * (((1 + realR) ** y - 1) / realR);
                return { year: y, label: `Yr ${y}`, corpus: Math.round(corpus), savings: Math.round(realCorpus * 0.3), net_worth: Math.round(corpus * 1.15) };
            });
            setResult(local);
        } finally {
            setLoading(false);
        }
    };

    const Slider = ({ label, field, min, max, step, format }: any) => (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-400">{label}</span>
                <span className="text-[11px] font-bold text-white">{format(params[field as keyof SimParams])}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={params[field as keyof SimParams]}
                onChange={(e) => setParams(p => ({ ...p, [field]: Number(e.target.value) }))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #2563EB ${((params[field as keyof SimParams] as number - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) 0%)` }}
            />
        </div>
    );

    const finalNW = result ? result[result.length - 1]?.net_worth :
        scenarios ? scenarios.moderate[scenarios.moderate.length - 1]?.net_worth : 0;

    return (
        <div className="glass-card p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>
                        <Sliders size={13} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">What-If Simulator</h3>
                        <p className="text-[10px] text-slate-500">Simulate financial outcomes in real time</p>
                    </div>
                </div>
                {/* Mode toggle */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {(['compare', 'custom'] as const).map((m) => (
                        <button key={m} onClick={() => setMode(m)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-all"
                            style={{ background: mode === m ? '#2563EB' : 'transparent', color: mode === m ? 'white' : '#64748B' }}>
                            {m === 'compare' ? '3-Scenario' : 'Custom'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Controls */}
                <div className="space-y-4">
                    <Slider label="Monthly SIP Investment" field="monthly_investment" min={1000} max={100000} step={1000}
                        format={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    <Slider label="Annual Income Growth" field="income_growth_rate" min={0} max={20} step={1}
                        format={(v: number) => `${v}%`} />
                    <Slider label="Monthly Expense Reduction" field="expense_reduction" min={0} max={20000} step={500}
                        format={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    <Slider label="Expected Market Return (CAGR)" field="investment_return_rate" min={6} max={20} step={0.5}
                        format={(v: number) => `${v}%`} />
                    <Slider label="Inflation Rate" field="inflation_rate" min={2} max={10} step={0.5}
                        format={(v: number) => `${v}%`} />
                    <Slider label="Projection Years" field="years" min={1} max={30} step={1}
                        format={(v: number) => `${v} yrs`} />
                    <motion.button whileTap={{ scale: 0.96 }} onClick={runSim}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>
                        {loading ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                        {loading ? 'Simulating...' : 'Run Simulation'}
                    </motion.button>
                </div>

                {/* Chart */}
                <div>
                    {(result || scenarios) ? (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-slate-500">Projected net worth</span>
                                <span className="text-lg font-black text-primary">{formatL(finalNW)}</span>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={scenarios ? scenarios.moderate : result!}>
                                    <defs>
                                        {scenarios ? (
                                            <>
                                                <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                                                <linearGradient id="modGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} /><stop offset="95%" stopColor="#2563EB" stopOpacity={0} /></linearGradient>
                                                <linearGradient id="aggGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} /><stop offset="95%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient>
                                            </>
                                        ) : (
                                            <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} /><stop offset="95%" stopColor="#2563EB" stopOpacity={0} /></linearGradient>
                                        )}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={formatL} width={52} />
                                    <Tooltip formatter={(v: number, name: string) => [formatL(v), name]} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }} />
                                    {scenarios ? (
                                        <>
                                            <Area type="monotone" data={scenarios.conservative} dataKey="net_worth" name="Conservative" stroke="#10B981" strokeWidth={1.5} fill="url(#consGrad)" strokeDasharray="4 4" />
                                            <Area type="monotone" data={scenarios.moderate} dataKey="net_worth" name="Moderate" stroke="#2563EB" strokeWidth={2} fill="url(#modGrad)" />
                                            <Area type="monotone" data={scenarios.aggressive} dataKey="net_worth" name="Aggressive" stroke="#7C3AED" strokeWidth={2} fill="url(#aggGrad)" />
                                        </>
                                    ) : (
                                        <Area type="monotone" dataKey="net_worth" name="Net Worth" stroke="#2563EB" strokeWidth={2} fill="url(#simGrad)" />
                                    )}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-3 opacity-40">
                            <Sliders size={32} className="text-slate-500" />
                            <p className="text-xs text-slate-500">Adjust sliders and click Run Simulation</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
