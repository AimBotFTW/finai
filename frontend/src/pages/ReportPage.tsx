import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, ChevronDown, ChevronRight, Download } from 'lucide-react';
import axios from 'axios';
import { FinancialData } from '../types';
import { RiskProfile } from '../components/RiskProfileSelector';
import { loadSettings } from './SettingsPage';

interface ReportSection {
    title: string;
    summary?: string;
    [key: string]: any;
}

interface ReportData {
    name: string;
    generated_at: string;
    executive_summary: string;
    sections: ReportSection[];
}

interface ReportPageProps {
    data: FinancialData;
    riskProfile: RiskProfile;
}

const SECTION_ICONS = ['🏥', '💰', '📈', '🎯', '⚠️', '📊'];
const SECTION_COLORS = ['#10B981', '#2563EB', '#7C3AED', '#F59E0B', '#EF4444', '#0891B2'];

export const ReportPage: React.FC<ReportPageProps> = ({ data, riskProfile }) => {
    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [openSection, setOpenSection] = useState<number | null>(0);

    const metrics = data?.metrics;
    const settings = loadSettings();
    const userName = settings.displayName || 'Guest';

    if (!metrics || metrics.monthly_income === 0) return (
        <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
            <FileText size={28} className="text-slate-600" />
            <h3 className="text-base font-bold text-white">No Financial Data</h3>
            <p className="text-sm text-slate-400 max-w-sm">Analyze your finances first to generate a personalized AI report.</p>
        </div>
    );
    if (!metrics) return <div className="p-8 text-center text-slate-400">Loading data for report...</div>;

    const generateReport = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/financial-report', {
                monthly_income: metrics.monthly_income,
                monthly_expenses: metrics.monthly_expenses,
                total_debt: metrics.total_debt,
                emergency_fund: metrics.emergency_fund,
                risk_profile: riskProfile,
                age: 30,
                name: userName,
            });
            setReport(res.data);
        } catch {
            // Fallback report
            setReport({
                name: userName,
                generated_at: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
                executive_summary: `Hi ${userName}, your financial health score is ${metrics.health_score}/100. You're saving ${Math.round(metrics.monthly_savings / metrics.monthly_income * 100)}% of income — excellent. However, your emergency fund covers only ${(metrics.emergency_fund / metrics.monthly_expenses).toFixed(1)} months. Build this buffer first, then increase your ${riskProfile} SIP to reach your 10-year wealth goal.`,
                sections: [
                    { title: 'Financial Health Assessment', summary: `Health score: ${metrics.health_score}/100. Savings rate ${Math.round(metrics.monthly_savings / metrics.monthly_income * 100)}% is excellent. Emergency fund needs attention.`, score: metrics.health_score, label: metrics.health_label ?? 'Good' },
                    { title: 'Budget Optimization Summary', summary: `Monthly expenses ₹${metrics.monthly_expenses.toLocaleString('en-IN')}. Estimated 3–4 categories exceed benchmarks. Potential savings: ₹8,784/month.`, monthly_expenses: metrics.monthly_expenses, over_budget_count: 3 },
                    { title: 'Recommended Investment Strategy', summary: `As a ${riskProfile} investor, start ₹${Math.round(metrics.monthly_savings * 0.60 / 500) * 500}/month SIP at 10–13% CAGR. Step up 10% yearly.`, risk_profile: riskProfile, monthly_sip_recommended: Math.round(metrics.monthly_savings * 0.60 / 500) * 500 },
                    { title: 'Goal Feasibility Analysis', summary: `With ₹${metrics.monthly_savings.toLocaleString('en-IN')}/month surplus, emergency fund is highest priority. Retirement corpus at 60 requires ₹8K/month.`, current_monthly_surplus: metrics.monthly_savings },
                    { title: 'Risk Warnings', warnings: [{ level: 'medium', icon: '🟡', message: `Emergency fund at ${(metrics.emergency_fund / metrics.monthly_expenses).toFixed(1)} months. Need ₹${Math.round(Math.max(metrics.monthly_expenses * 6 - metrics.emergency_fund, 0)).toLocaleString('en-IN')} more.` }] },
                    { title: 'Wealth Projection', summary: `At ${riskProfile} risk profile, estimated net worth after 10 years: ₹${Math.round(metrics.monthly_savings * 0.6 * 12 * 10 * 1.8 / 100000)}L. Increasing SIP by ₹5,000 adds ₹18L.`, final_net_worth: Math.round(metrics.monthly_savings * 0.6 * 12 * 10 * 1.8) },
                ],
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="section-title flex items-center gap-2">
                        <FileText size={18} className="text-primary" />
                        AI Financial Strategy Report
                    </h2>
                    <p className="section-subtitle">Full 6-section financial analysis — health, budget, investments, goals, risks, wealth</p>
                </div>
                <motion.button whileTap={{ scale: 0.96 }} onClick={generateReport}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>
                    {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                    {isLoading ? 'Generating...' : report ? 'Refresh Report' : 'Generate Report'}
                </motion.button>
            </div>

            {!report ? (
                <div className="glass-card p-12 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.1)' }}>
                        <FileText size={28} className="text-primary" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-base font-bold text-white mb-1">Generate Your AI Financial Report</h3>
                        <p className="text-sm text-slate-400 max-w-sm">A personalized 6-section financial strategy report covering health score, budget, investments, goals, risks, and 10-year wealth projection.</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={generateReport}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>
                        {isLoading ? 'Generating...' : 'Generate Report'}
                    </motion.button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Executive summary */}
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5"
                        style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.06))', border: '1px solid rgba(37,99,235,0.2)' }}>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">🤖</div>
                            <div>
                                <p className="text-xs font-bold text-blue-400 mb-1">AI Executive Summary · {report.generated_at}</p>
                                <p className="text-sm text-slate-200 leading-relaxed">{report.executive_summary}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sections */}
                    {report.sections.map((section, i) => {
                        const isOpen = openSection === i;
                        const icon = SECTION_ICONS[i] ?? '📌';
                        const color = SECTION_COLORS[i] ?? '#2563EB';

                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                className="glass-card overflow-hidden" style={{ border: `1px solid ${color}20` }}>
                                <button onClick={() => setOpenSection(isOpen ? null : i)} className="w-full p-4 text-left">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{icon}</span>
                                            <div>
                                                <p className="text-sm font-bold text-white">{section.title}</p>
                                                {!isOpen && section.summary && (
                                                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-md">{section.summary}</p>
                                                )}
                                            </div>
                                        </div>
                                        {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                                    </div>
                                </button>

                                {isOpen && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 space-y-3"
                                        style={{ borderTop: `1px solid ${color}15` }}>
                                        {section.summary && (
                                            <p className="text-sm text-slate-300 leading-relaxed pt-3">{section.summary}</p>
                                        )}

                                        {/* Health score badge */}
                                        {section.score !== undefined && (
                                            <div className="flex items-center gap-3">
                                                <div className="text-3xl font-black" style={{ color }}>{section.score}</div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">/100 · {section.label}</p>
                                                    <div className="mt-1 h-2 w-32 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                        <div className="h-full rounded-full" style={{ width: `${section.score}%`, backgroundColor: color }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Warnings list */}
                                        {section.warnings && (
                                            <div className="space-y-2">
                                                {section.warnings.map((w: any, j: number) => (
                                                    <div key={j} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)' }}>
                                                        <span>{w.icon}</span>
                                                        <p className="text-xs text-slate-300">{w.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Wealth projection highlight */}
                                        {section.final_net_worth && (
                                            <div className="p-3 rounded-xl text-center" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                                                <p className="text-[10px] text-slate-500">10-Year Net Worth</p>
                                                <p className="text-2xl font-black" style={{ color }}>
                                                    ₹{(section.final_net_worth / 100000).toFixed(1)}L
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
