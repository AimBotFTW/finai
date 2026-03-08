import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, CheckCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { FinancialData } from '../types';
import { loadSettings } from './SettingsPage';

interface TaxRec {
    section: string;
    category: string;
    eligible_amount: number;
    tax_saved: number;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    tip: string;
    options: string[];
}

interface TaxResult {
    recommendations: TaxRec[];
    total_possible_savings: number;
    effective_tax_rate: number;
    annual_income: number;
    summary: string;
}

interface TaxOptimizerPageProps {
    data: FinancialData;
}

const PRIORITY_STYLE: Record<string, { bg: string; badge: string; color: string }> = {
    high: { bg: 'border-red-500/20 bg-red-500/5', badge: 'bg-red-500/20 text-red-400', color: '#EF4444' },
    medium: { bg: 'border-yellow-500/20 bg-yellow-500/5', badge: 'bg-yellow-500/20 text-yellow-400', color: '#F59E0B' },
    low: { bg: 'border-blue-500/20 bg-blue-500/5', badge: 'bg-blue-500/20 text-blue-400', color: '#2563EB' },
};

export const TaxOptimizerPage: React.FC<TaxOptimizerPageProps> = ({ data }) => {
    const settings = loadSettings();
    const metrics = data?.metrics;

    const [form, setForm] = useState({
        existing_80c: 0,
        has_nps: false,
        has_health_insurance: false,
        has_parents_insurance: false,
        hra_eligible: true,
    });
    const [result, setResult] = useState<TaxResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState<number | null>(0);

    const monthly_income = metrics?.monthly_income ?? 0;

    const analyze = async () => {
        if (!monthly_income) return;
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/tax-analysis', {
                monthly_income,
                ...form,
            });
            setResult(res.data);
        } catch {
            // Fallback — simple estimate
            const annual = monthly_income * 12;
            const rate = annual > 1500000 ? 0.30 : annual > 1000000 ? 0.20 : annual > 700000 ? 0.10 : 0.05;
            const gap80c = Math.max(150000 - form.existing_80c, 0);
            setResult({
                recommendations: [
                    { section: 'Section 80C', category: 'ELSS / PPF', eligible_amount: gap80c, tax_saved: Math.round(gap80c * rate), priority: 'high', icon: '📋', tip: `Invest ₹${gap80c.toLocaleString('en-IN')} in ELSS before March 31.`, options: ['ELSS Fund', 'PPF', 'Tax-Saver FD'] },
                    { section: 'Section 80CCD(1B)', category: 'NPS Tier 1', eligible_amount: 50000, tax_saved: Math.round(50000 * rate), priority: 'high', icon: '🏦', tip: 'Open NPS Tier 1 for additional ₹50,000 deduction.', options: ['eNPS Portal', 'Employer NPS'] },
                    { section: 'Section 80D', category: 'Health Insurance', eligible_amount: 25000, tax_saved: Math.round(25000 * rate), priority: 'medium', icon: '🏥', tip: 'Buy a ₹10L family floater health plan.', options: ['HDFC ERGO', 'Niva Bupa', 'ICICI Lombard'] },
                ],
                total_possible_savings: Math.round((gap80c + 75000) * rate),
                effective_tax_rate: rate * 100,
                annual_income: annual,
                summary: `By optimizing deductions, you could save ₹${Math.round((gap80c + 75000) * rate).toLocaleString('en-IN')} in tax this FY.`,
            });
        } finally {
            setLoading(false);
        }
    };

    const Toggle = ({ label, field }: { label: string; field: keyof typeof form }) => (
        <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">{label}</span>
            <button
                onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))}
                className={`w-10 h-5 rounded-full transition-all relative ${form[field] ? 'bg-primary' : 'bg-white/10'}`}
            >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form[field] ? 'left-5' : 'left-0.5'}`} />
            </button>
        </div>
    );

    if (!monthly_income) return (
        <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
            <FileText size={32} className="text-slate-600" />
            <h3 className="text-base font-bold text-white">No Financial Data</h3>
            <p className="text-sm text-slate-400 max-w-sm">Analyze your finances on the Dashboard first to enable tax optimization.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="section-title flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> Tax Optimizer
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">FY 2025-26</span>
                </h2>
                <p className="section-subtitle">Maximize deductions under 80C, 80D, NPS, and HRA</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Income summary */}
                {[
                    { label: 'Annual Income', value: `₹${(monthly_income * 12 / 100000).toFixed(1)}L`, color: '#2563EB' },
                    { label: 'Effective Tax Rate', value: result ? `${result.effective_tax_rate}%` : '—', color: '#F59E0B' },
                    { label: 'Potential Tax Saved', value: result ? `₹${(result.total_possible_savings / 1000).toFixed(0)}K` : '—', color: '#10B981' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="glass-card p-4 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">{s.label}</p>
                        <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Input form */}
            <div className="glass-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-white mb-3">Your Tax Profile</h3>
                <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Existing 80C Investments (₹)</label>
                    <input type="number" placeholder="e.g. 50000" value={form.existing_80c || ''}
                        onChange={e => setForm(f => ({ ...f, existing_80c: parseFloat(e.target.value) || 0 }))}
                        className="input-field" />
                </div>
                <div className="space-y-3">
                    <Toggle label="Have NPS (National Pension Scheme)?" field="has_nps" />
                    <Toggle label="Have Health Insurance (Self/Family)?" field="has_health_insurance" />
                    <Toggle label="Have Health Insurance for Parents?" field="has_parents_insurance" />
                    <Toggle label="Eligible for HRA (Rent Allowance)?" field="hra_eligible" />
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={analyze}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#10B981,#2563EB)' }}>
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
                    {loading ? 'Analyzing...' : 'Analyze Tax Savings'}
                </motion.button>
            </div>

            {result && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Summary banner */}
                    <div className="glass-card p-4" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.06))', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-emerald-400 mb-1">AI Tax Summary</p>
                                <p className="text-sm text-slate-200">{result.summary}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    {result.recommendations.map((rec, i) => {
                        const style = PRIORITY_STYLE[rec.priority] ?? PRIORITY_STYLE.medium;
                        const isOpen = open === i;
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                className={`glass-card overflow-hidden border ${style.bg}`}>
                                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full p-4 text-left">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{rec.icon}</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-white">{rec.section}</p>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>{rec.priority}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{rec.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <div>
                                                <p className="text-[10px] text-slate-500">Tax Saved</p>
                                                <p className="text-sm font-black text-emerald-400">₹{rec.tax_saved.toLocaleString('en-IN')}</p>
                                            </div>
                                            {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                                        </div>
                                    </div>
                                </button>
                                {isOpen && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${style.color}20` }}>
                                        <p className="text-sm text-slate-300 pt-3">{rec.tip}</p>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-2">Eligible Amount: <span className="text-white font-bold">₹{rec.eligible_amount.toLocaleString('en-IN')}</span></p>
                                            <div className="flex flex-wrap gap-2">
                                                {rec.options.map((opt, j) => (
                                                    <span key={j} className="text-[11px] px-2 py-1 rounded-lg bg-white/5 text-slate-300">{opt}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
};
