import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle2, Bell } from 'lucide-react';

export interface RiskAlert {
    level: 'high' | 'medium' | 'low';
    icon: string;
    title: string;
    message: string;
    action?: string;
}

interface RiskAlertsProps {
    monthlyIncome: number;
    monthlySavings: number;
    totalDebt: number;
    emergencyFund: number;
    monthlyExpenses: number;
}

function buildAlerts(
    monthlyIncome: number,
    monthlySavings: number,
    totalDebt: number,
    emergencyFund: number,
    monthlyExpenses: number,
): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    const efMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
    const dti = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 0;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

    if (efMonths < 3) {
        alerts.push({
            level: 'high',
            icon: '🔴',
            title: 'Critical: Emergency Fund',
            message: `Only ${efMonths.toFixed(1)} months covered. You need ₹${Math.round(Math.max(monthlyExpenses * 6 - emergencyFund, 0)).toLocaleString('en-IN')} more to reach 6-month safety net.`,
            action: 'Park ₹' + Math.round(Math.max(monthlyExpenses * 6 - emergencyFund, 0) / 12 / 500) * 500 + '/month in Parag Parikh Liquid Fund',
        });
    } else if (efMonths < 6) {
        alerts.push({
            level: 'medium',
            icon: '🟡',
            title: 'Emergency Fund Below Target',
            message: `${efMonths.toFixed(1)} months covered. Need ₹${Math.round(Math.max(monthlyExpenses * 6 - emergencyFund, 0)).toLocaleString('en-IN')} more.`,
            action: 'Top up by ₹' + Math.round(Math.max(monthlyExpenses * 6 - emergencyFund, 0) / 6 / 500) * 500 + '/month',
        });
    }

    if (dti > 36) {
        alerts.push({
            level: 'high',
            icon: '🔴',
            title: 'High Debt Exposure',
            message: `Debt-to-income at ${dti.toFixed(1)}% — well above safe limit of 28%. Risk of financial stress.`,
            action: 'Pay ₹' + Math.round(monthlySavings * 0.25 / 500) * 500 + '/month extra toward highest-rate debt',
        });
    } else if (dti > 20) {
        alerts.push({
            level: 'medium',
            icon: '🟡',
            title: 'Moderate Debt Level',
            message: `DTI at ${dti.toFixed(1)}%. Manageable. Avoid new large loans until under 20%.`,
        });
    }

    if (savingsRate < 10) {
        alerts.push({
            level: 'high',
            icon: '🔴',
            title: 'Low Savings Rate',
            message: `Saving only ${savingsRate.toFixed(1)}% of income. Target minimum 20% for long-term wealth building.`,
            action: 'Cut one major expense category to boost savings by ₹' + Math.round((monthlyIncome * 0.20 - monthlySavings) / 500) * 500 + '/month',
        });
    }

    if (expenseRatio > 80) {
        alerts.push({
            level: 'medium',
            icon: '🟡',
            title: 'High Expense Ratio',
            message: `Spending ${expenseRatio.toFixed(0)}% of income. Ideal target is <65% to maintain investing capacity.`,
            action: 'Review entertainment & dining expenses first',
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            level: 'low',
            icon: '🟢',
            title: 'All Clear',
            message: 'No critical risk alerts. Your financial fundamentals are strong. Review quarterly.',
        });
    }

    return alerts.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.level] - { high: 0, medium: 1, low: 2 }[b.level]));
}

const LEVEL_CONFIG = {
    high: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: AlertTriangle, label: 'Urgent' },
    medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: AlertCircle, label: 'Warning' },
    low: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle2, label: 'Clear' },
};

export const RiskAlerts: React.FC<RiskAlertsProps> = (props) => {
    const alerts = buildAlerts(
        props.monthlyIncome, props.monthlySavings, props.totalDebt,
        props.emergencyFund, props.monthlyExpenses,
    );
    const urgentCount = alerts.filter(a => a.level === 'high').length;

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center relative"
                        style={{ background: urgentCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)' }}>
                        <Bell size={12} style={{ color: urgentCount > 0 ? '#EF4444' : '#10B981' }} />
                        {urgentCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-danger text-[8px] font-black text-white flex items-center justify-center">
                                {urgentCount}
                            </div>
                        )}
                    </div>
                    <span className="text-xs font-bold text-white">Risk Alerts</span>
                </div>
                <span className="text-[10px] text-slate-500">{urgentCount} urgent</span>
            </div>

            <div className="space-y-2">
                <AnimatePresence>
                    {alerts.map((alert, i) => {
                        const cfg = LEVEL_CONFIG[alert.level];
                        const Icon = cfg.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className="p-3 rounded-xl"
                                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                            >
                                <div className="flex items-start gap-2">
                                    <Icon size={13} style={{ color: cfg.color }} className="flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                                style={{ background: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
                                            <span className="text-[11px] font-semibold text-white truncate">{alert.title}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-snug">{alert.message}</p>
                                        {alert.action && (
                                            <p className="text-[10px] font-semibold mt-1" style={{ color: cfg.color }}>
                                                → {alert.action}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};
