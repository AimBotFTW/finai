import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

interface OnboardingFormProps {
    onAnalyze: (data: {
        monthly_income: number;
        monthly_expenses: number;
        total_debt: number;
        current_savings: number;
        monthly_investments: number;
        emergency_fund: number;
        risk_profile: 'conservative' | 'moderate' | 'aggressive';
    }) => Promise<void>;
    isLoading: boolean;
}

const inputFields = [
    { id: 'monthly_income', label: 'Monthly Income', placeholder: '75,000', prefix: '₹', hint: 'Your total monthly take-home salary', required: true },
    { id: 'monthly_expenses', label: 'Monthly Expenses', placeholder: '48,000', prefix: '₹', hint: 'Total monthly spending (rent, food, etc.)', required: true },
    { id: 'total_debt', label: 'Total Debt', placeholder: '1,50,000', prefix: '₹', hint: 'Outstanding loans, credit card balance', required: false },
    { id: 'current_savings', label: 'Current Savings', placeholder: '2,00,000', prefix: '₹', hint: 'Total savings in bank accounts', required: false },
    { id: 'monthly_investments', label: 'Monthly Investments', placeholder: '15,000', prefix: '₹', hint: 'Current SIP/Investment amount per month', required: false },
    { id: 'emergency_fund', label: 'Emergency Fund', placeholder: '81,000', prefix: '₹', hint: 'Current savings in liquid/savings account', required: false },
];

const riskProfiles = [
    { value: 'conservative', label: 'Conservative', description: 'Low risk, stable returns' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced risk and returns' },
    { value: 'aggressive', label: 'Aggressive', description: 'High risk, high returns' },
];

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onAnalyze, isLoading }) => {
    const [values, setValues] = useState({
        monthly_income: 0,
        monthly_expenses: 0,
        total_debt: 0,
        current_savings: 0,
        monthly_investments: 0,
        emergency_fund: 0,
        risk_profile: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!values.monthly_income || values.monthly_income <= 0)
            errs.monthly_income = 'Income must be greater than 0';
        if (!values.monthly_expenses || values.monthly_expenses <= 0)
            errs.monthly_expenses = 'Expenses must be greater than 0';
        if (values.monthly_expenses >= values.monthly_income)
            errs.monthly_expenses = 'Expenses cannot exceed income';
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setErrors({});
        try {
            await onAnalyze(values);
        } catch (err) {
            setErrors({ submit: 'Analysis failed. Please check backend is running.' });
        }
    };

    const handleChange = (id: string, raw: string) => {
        const num = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
        setValues(prev => ({ ...prev, [id]: num }));
        if (errors[id]) setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto glass-card p-6 md:p-10"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.3)' }}
        >
            <div className="text-center mb-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', boxShadow: '0 10px 30px rgba(37,99,235,0.4)' }}>
                    <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Set up your Financial Profile</h2>
                <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Provide your basic details to instantly generate a personalized dashboard, AI advice, predictive forecasts, and tailored budget recommendations.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {inputFields.map(field => (
                        <div key={field.id}>
                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                                {field.label} {field.required && <span className="text-danger">*</span>}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{field.prefix}</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={values[field.id as keyof typeof values] || ''}
                                    onChange={e => handleChange(field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full pl-8 pr-4 py-3.5 rounded-xl text-lg font-medium text-white focus:outline-none focus:ring-2 transition-all"
                                    style={{
                                        background: errors[field.id] ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                                        border: errors[field.id] ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                    }}
                                />
                            </div>
                            {errors[field.id] ? (
                                <p className="text-xs font-medium text-danger mt-2 flex items-center gap-1.5">
                                    <AlertTriangle size={12} /> {errors[field.id]}
                                </p>
                            ) : (
                                <p className="text-[11px] text-slate-500 mt-2 font-medium">{field.hint}</p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-white/10">
                    <label className="block text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider text-center">
                        Select Your Risk Profile <span className="text-danger">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {riskProfiles.map(profile => (
                            <button
                                key={profile.value}
                                type="button"
                                onClick={() => setValues(prev => ({ ...prev, risk_profile: profile.value as any }))}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${values.risk_profile === profile.value
                                    ? 'border-primary bg-primary/20 text-white'
                                    : 'border-white/5 bg-white/5 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10'
                                    }`}
                            >
                                <div className="font-bold text-sm mb-1">{profile.label}</div>
                                <div className="text-xs opacity-70 leading-relaxed">{profile.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {errors.submit && (
                    <div className="p-4 rounded-xl text-sm font-medium text-danger flex items-center justify-center gap-2"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <AlertTriangle size={16} /> {errors.submit}
                    </div>
                )}

                <div className="pt-6">
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-lg font-black text-white hover:shadow-glow-blue transition-all disabled:opacity-60 disabled:hover:shadow-none"
                        style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
                    >
                        {isLoading ? (
                            <><Loader2 size={24} className="animate-spin" /> Generating Financial Strategy...</>
                        ) : (
                            <><Calculator size={24} /> Analyze & Start Planning</>
                        )}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};
