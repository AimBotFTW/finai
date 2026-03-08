import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, RefreshCw, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { FinancialData } from '../types';
import { loadSettings } from './SettingsPage';

interface Checkpoint { age: number; years_from_now: number; projected_corpus: number; label: string; }

interface RetirementResult {
    age: number;
    retirement_age: number;
    years_to_retire: number;
    future_monthly_expenses: number;
    required_corpus: number;
    projected_corpus: number;
    corpus_gap: number;
    monthly_investment_required: number;
    additional_monthly_needed: number;
    feasibility: 'On Track' | 'Needs Boost' | 'At Risk';
    feasibility_color: string;
    message: string;
    checkpoints: Checkpoint[];
}

interface RetirementPlannerPageProps { data: FinancialData; }

const fmtL = (v: number) => v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : `₹${(v / 100000).toFixed(1)}L`;

export const RetirementPlannerPage: React.FC<RetirementPlannerPageProps> = ({ data }) => {
    const settings = loadSettings();
    const metrics = data?.metrics;

    const [params, setParams] = useState({
        age: 30,
        retirement_age: Number(settings.retirementAge ?? 60),
        monthly_expenses: metrics?.monthly_expenses ?? 0,
        current_savings: metrics?.emergency_fund ?? 0,
        monthly_investment: metrics ? Math.round(metrics.monthly_savings * 0.6 / 500) * 500 : 0,
        expected_return: 12.0,
        inflation_rate: 6.0,
        life_expectancy: 85,
    });
    const [result, setResult] = useState<RetirementResult | null>(null);
    const [loading, setLoading] = useState(false);

    const calculate = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/retirement', params);
            setResult(res.data);
        } catch {
            // Local fallback calculation
            const yrs = Math.max(params.retirement_age - params.age, 1);
            const futureExp = params.monthly_expenses * Math.pow(1 + params.inflation_rate / 100, yrs);
            const required = Math.round(futureExp * 12 * 25);
            const r = params.expected_return / 100 / 12;
            const n = yrs * 12;
            const fvSIP = r > 0 ? params.monthly_investment * ((Math.pow(1 + r, n) - 1) / r) : params.monthly_investment * n;
            const fvLump = params.current_savings * Math.pow(1 + params.expected_return / 100, yrs);
            const projected = Math.round(fvSIP + fvLump);
            const gap = Math.max(required - projected, 0);
            const addMonthly = gap > 0 && r > 0 && n > 0 ? Math.round(gap * r / (Math.pow(1 + r, n) - 1)) : 0;
            setResult({
                age: params.age,
                retirement_age: params.retirement_age,
                years_to_retire: yrs,
                future_monthly_expenses: Math.round(futureExp),
                required_corpus: required,
                projected_corpus: projected,
                corpus_gap: gap,
                monthly_investment_required: params.monthly_investment + addMonthly,
                additional_monthly_needed: addMonthly,
                feasibility: projected >= required ? 'On Track' : projected >= required * 0.7 ? 'Needs Boost' : 'At Risk',
                feasibility_color: projected >= required ? '#10B981' : projected >= required * 0.7 ? '#F59E0B' : '#EF4444',
                message: projected >= required
                    ? `On track! ₹${params.monthly_investment.toLocaleString('en-IN')}/month SIP will accumulate ${fmtL(projected)}.`
                    : `Need ₹${addMonthly.toLocaleString('en-IN')}/month more to close the ${fmtL(gap)} gap.`,
                checkpoints: Array.from({ length: Math.floor(yrs / 5) }, (_, i) => {
                    const t = (i + 1) * 5;
                    const nm = t * 12;
                    const cp = params.current_savings * Math.pow(1 + params.expected_return / 100, t) +
                        (r > 0 ? params.monthly_investment * ((Math.pow(1 + r, nm) - 1) / r) : 0);
                    return { age: params.age + t, years_from_now: t, projected_corpus: Math.round(cp), label: `Age ${params.age + t}` };
                }),
            });
        } finally {
            setLoading(false);
        }
    };

    const SliderRow = ({ label, field, min, max, step, fmt }: any) => (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="text-xs font-bold text-white">{fmt(params[field as keyof typeof params])}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={params[field as keyof typeof params] as number}
                onChange={e => setParams(p => ({ ...p, [field]: Number(e.target.value) }))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #7C3AED ${((Number(params[field as keyof typeof params]) - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) 0%)` }}
            />
        </div>
    );

    const FeasibilityIcon = result?.feasibility === 'On Track' ? CheckCircle : AlertTriangle;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="section-title flex items-center gap-2">
                    <Sunrise size={18} className="text-purple-400" /> Retirement Planner
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">AI Powered</span>
                </h2>
                <p className="section-subtitle">Plan your retirement corpus with inflation-adjusted projections</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Controls */}
                <div className="glass-card p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white">Your Parameters</h3>
                    <SliderRow label="Current Age" field="age" min={20} max={55} step={1} fmt={(v: number) => `${v} yrs`} />
                    <SliderRow label="Target Retirement Age" field="retirement_age" min={45} max={70} step={1} fmt={(v: number) => `${v} yrs`} />
                    <SliderRow label="Monthly Expenses (Now)" field="monthly_expenses" min={10000} max={500000} step={5000} fmt={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    <SliderRow label="Current Savings / Corpus" field="current_savings" min={0} max={5000000} step={50000} fmt={(v: number) => fmtL(v)} />
                    <SliderRow label="Monthly SIP Investment" field="monthly_investment" min={1000} max={100000} step={1000} fmt={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    <SliderRow label="Expected Return (CAGR)" field="expected_return" min={6} max={18} step={0.5} fmt={(v: number) => `${v}%`} />
                    <SliderRow label="Inflation Rate" field="inflation_rate" min={3} max={10} step={0.5} fmt={(v: number) => `${v}%`} />
                    <motion.button whileTap={{ scale: 0.97 }} onClick={calculate}
                        className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                        {loading ? <RefreshCw size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                        {loading ? 'Calculating...' : 'Calculate Retirement Plan'}
                    </motion.button>
                </div>

                {/* Results */}
                {result ? (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        {/* Feasibility banner */}
                        <div className="glass-card p-4" style={{ border: `1px solid ${result.feasibility_color}30`, background: `${result.feasibility_color}08` }}>
                            <div className="flex items-center gap-3 mb-2">
                                <FeasibilityIcon size={18} style={{ color: result.feasibility_color }} />
                                <span className="text-sm font-bold" style={{ color: result.feasibility_color }}>{result.feasibility}</span>
                                <span className="text-xs text-slate-500">{result.years_to_retire} years to retirement</span>
                            </div>
                            <p className="text-xs text-slate-300">{result.message}</p>
                        </div>

                        {/* Key metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Required Corpus', value: fmtL(result.required_corpus), color: '#EF4444' },
                                { label: 'Projected Corpus', value: fmtL(result.projected_corpus), color: '#10B981' },
                                { label: 'Gap', value: result.corpus_gap > 0 ? fmtL(result.corpus_gap) : '₹0', color: result.corpus_gap > 0 ? '#F59E0B' : '#10B981' },
                                { label: 'Extra SIP Needed', value: result.additional_monthly_needed > 0 ? `₹${result.additional_monthly_needed.toLocaleString('en-IN')}/mo` : 'None', color: result.additional_monthly_needed > 0 ? '#F59E0B' : '#10B981' },
                                { label: 'Future Monthly Expense', value: `₹${result.future_monthly_expenses.toLocaleString('en-IN')}`, color: '#7C3AED' },
                                { label: 'Total SIP Required', value: `₹${result.monthly_investment_required.toLocaleString('en-IN')}/mo`, color: '#2563EB' },
                            ].map((m, i) => (
                                <div key={i} className="glass-card p-3">
                                    <p className="text-[10px] text-slate-500 mb-0.5">{m.label}</p>
                                    <p className="text-sm font-black" style={{ color: m.color }}>{m.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Progress bar */}
                        <div className="glass-card p-4">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-400">Corpus Progress</span>
                                <span className="text-white font-bold">{Math.min(Math.round(result.projected_corpus / result.required_corpus * 100), 100)}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(result.projected_corpus / result.required_corpus * 100, 100)}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                    className="h-full rounded-full" style={{ backgroundColor: result.feasibility_color }} />
                            </div>
                        </div>

                        {/* 5-year checkpoints */}
                        {result.checkpoints.length > 0 && (
                            <div className="glass-card p-4">
                                <h4 className="text-xs font-bold text-white mb-3">5-Year Corpus Checkpoints</h4>
                                <div className="space-y-2">
                                    {result.checkpoints.map((cp, i) => (
                                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5">
                                            <span className="text-xs text-slate-400">{cp.label}</span>
                                            <span className="text-xs font-bold text-white">{fmtL(cp.projected_corpus)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="glass-card p-8 flex flex-col items-center justify-center gap-3 opacity-50">
                        <Sunrise size={32} className="text-slate-500" />
                        <p className="text-sm text-slate-500 text-center">Adjust the sliders and click Calculate to see your retirement projection</p>
                    </div>
                )}
            </div>
        </div>
    );
};
