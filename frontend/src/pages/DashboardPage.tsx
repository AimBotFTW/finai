import { loadSettings } from './SettingsPage';
import { motion } from 'framer-motion';
import { IndianRupee, PiggyBank, CreditCard, Wallet } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { HealthBreakdown } from '../components/HealthBreakdown';
import { Charts } from '../components/Charts';
import { AIInsightCard } from '../components/AIInsightCard';
import { ActionCenter } from '../components/ActionCenter';
import { BudgetOptimizer } from '../components/BudgetOptimizer';
import { AnalyzeForm } from '../components/AnalyzeForm';
import { OnboardingForm } from '../components/OnboardingForm';
import { WealthCoach } from '../components/WealthCoach';
import { RiskAlerts } from '../components/RiskAlerts';
import { FinancialData, AIAdvice, ActivePage } from '../types';
import { FinancialInput } from '../api';

interface DashboardPageProps {
    data: FinancialData;
    onAnalyze: (input: FinancialInput) => Promise<void>;
    isLoading: boolean;
    advice: AIAdvice[];
    onNavigate: (page: ActivePage) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ data, onAnalyze, isLoading, advice, onNavigate }) => {
    const settings = loadSettings();
    const firstName = settings.displayName.split(' ')[0];
    const metrics = data?.metrics;
    const actions = data?.actions;
    const charts = data?.charts;

    const savingsRate = metrics && metrics.monthly_income > 0 ? Math.round((metrics.monthly_savings / metrics.monthly_income) * 100) : 0;
    const efMonths = metrics && metrics.monthly_expenses > 0 ? (metrics.emergency_fund_months ?? (metrics.emergency_fund / metrics.monthly_expenses)) : 0;

    // Show empty state if no financial data has been analyzed yet
    if (!metrics || metrics.monthly_income === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] pt-12 pb-24">
                <OnboardingForm onAnalyze={onAnalyze} isLoading={isLoading} />
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* ── Welcome bar + Analyze form ── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-xl font-black text-white">
                            Welcome back, <span className="text-gradient">{firstName}</span> 👋
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Your financial health is{' '}
                            <span className={`font-semibold ${metrics.health_score >= 80 ? 'text-success' :
                                metrics.health_score >= 60 ? 'text-blue-400' :
                                    metrics.health_score >= 40 ? 'text-warning' : 'text-danger'
                                }`}>
                                {metrics.health_label ?? (metrics.health_score >= 80 ? 'Excellent' : metrics.health_score >= 60 ? 'Good' : metrics.health_score >= 40 ? 'Average' : 'Poor')}
                            </span>
                            {' · '}Score: {metrics.health_score}/100
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <AnalyzeForm onAnalyze={onAnalyze} isLoading={isLoading} />
                    </div>
                </div>
            </motion.div>

            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard title="Monthly Income" value="" rawValue={metrics.monthly_income} prefix="₹" subtitle="Gross salary + side income" icon={IndianRupee} trend={{ value: '5.1%', positive: true }} accentColor="#10B981" delay={0} />
                <MetricCard title="Monthly Savings" value="" rawValue={metrics.monthly_savings} prefix="₹" subtitle={`₹${metrics.monthly_expenses.toLocaleString('en-IN')} expenses`} icon={PiggyBank} trend={{ value: `${savingsRate}%`, positive: savingsRate >= 20 }} accentColor="#2563EB" delay={0.08} />
                <MetricCard title="Total Debt" value="" rawValue={metrics.total_debt} prefix="₹" subtitle={`DTI: ${metrics.debt_to_income_ratio.toFixed(1)}%`} icon={CreditCard} trend={{ value: `${metrics.debt_to_income_ratio.toFixed(1)}%`, positive: metrics.debt_to_income_ratio < 28 }} accentColor="#EF4444" delay={0.16} />
                <MetricCard title="Emergency Fund" value={`${efMonths.toFixed(1)}mo`} subtitle={`₹${metrics.emergency_fund.toLocaleString('en-IN')} · Target 6 mo`} icon={Wallet} trend={{ value: efMonths >= 6 ? '✓ Safe' : `Need ${(6 - efMonths).toFixed(1)} more`, positive: efMonths >= 6 }} accentColor="#7C3AED" delay={0.24} />
            </div>

            {/* ── Risk Alerts + Wealth Coach ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RiskAlerts
                    monthlyIncome={metrics.monthly_income}
                    monthlySavings={metrics.monthly_savings}
                    totalDebt={metrics.total_debt}
                    emergencyFund={metrics.emergency_fund}
                    monthlyExpenses={metrics.monthly_expenses}
                />
                <WealthCoach data={metrics as any} riskProfile={'moderate'} finalNetWorth={Math.round(metrics.monthly_savings * 0.6 * 120 * 1.5)} />
            </div>

            {/* ── Health Score + AI Insights ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                    <HealthBreakdown
                        factors={data.health_breakdown ?? []}
                        overallScore={metrics.health_score}
                        healthLabel={metrics.health_label ?? 'Good'}
                    />
                </div>
                <div className="md:col-span-2">
                    <AIInsightCard
                        advice={advice}
                        onDetailedAnalysis={() => onNavigate('insights')}
                    />
                </div>
            </div>

            {/* ── Charts ── */}
            {charts ? <Charts data={data} /> : (
                <div className="glass-card p-8 text-center text-slate-400">Loading charts...</div>
            )}

            {/* ── Action Center + Budget Optimizer ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionCenter actions={actions ?? []} isLoading={isLoading} />
                <BudgetOptimizer categories={data.budget_analysis ?? []} monthlyExpenses={metrics.monthly_expenses} />
            </div>

            {/* ── Quick Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Net Worth Est.', value: `₹${(metrics.monthly_savings * 15.6 / 100000).toFixed(1)}L`, color: '#10B981' },
                    { label: 'Savings Rate', value: `${savingsRate}%`, color: '#2563EB' },
                    { label: 'Emergency Fund', value: `${efMonths.toFixed(1)} mo`, color: '#7C3AED' },
                    { label: 'Debt-to-Income', value: `${metrics.debt_to_income_ratio.toFixed(1)}%`, color: metrics.debt_to_income_ratio > 36 ? '#EF4444' : '#F59E0B' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }} className="glass-card p-4">
                        <p className="text-[11px] text-slate-500 mb-1.5">{s.label}</p>
                        <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
