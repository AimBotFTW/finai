import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Loader2, Sparkles, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface AnalyzeFormProps {
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

export const AnalyzeForm: React.FC<AnalyzeFormProps> = ({ onAnalyze, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
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
    const [success, setSuccess] = useState(false);

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
            setSuccess(true);
            setTimeout(() => { setSuccess(false); setIsOpen(false); }, 1500);
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
        <div>
            {/* Toggle button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
            >
                <Calculator size={15} />
                Analyze My Finances
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </motion.button>

            {/* Form panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 right-0 mt-2 z-40 mx-6"
                    >
                        <div className="glass-card p-5" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.2)' }}>
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                                    <Sparkles size={13} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Analyze & Get AI Advice</h3>
                                    <p className="text-[10px] text-slate-500">Enter your financial details to get personalized insights</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                    {inputFields.map(field => (
                                        <div key={field.id} className={field.id === 'emergency_fund' ? 'md:col-span-3' : ''}>
                                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                                                {field.label} {field.required && <span className="text-danger">*</span>}
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{field.prefix}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={values[field.id as keyof typeof values] || ''}
                                                    onChange={e => handleChange(field.id, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="w-full pl-6 pr-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-1 transition-all"
                                                    style={{
                                                        background: errors[field.id] ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)',
                                                        border: errors[field.id] ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                                    }}
                                                />
                                            </div>
                                            {errors[field.id] ? (
                                                <p className="text-[10px] text-danger mt-1 flex items-center gap-1">
                                                    <AlertTriangle size={9} /> {errors[field.id]}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-slate-600 mt-1">{field.hint}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Risk Profile Selection */}
                                <div className="mb-4">
                                    <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                                        Risk Profile <span className="text-danger">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {riskProfiles.map(profile => (
                                            <button
                                                key={profile.value}
                                                type="button"
                                                onClick={() => setValues(prev => ({ ...prev, risk_profile: profile.value as any }))}
                                                className={`p-3 rounded-xl border text-xs font-medium transition-all ${values.risk_profile === profile.value
                                                    ? 'border-primary/50 bg-primary/20 text-white'
                                                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                <div className="font-semibold">{profile.label}</div>
                                                <div className="text-[9px] mt-0.5 opacity-70">{profile.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {errors.submit && (
                                    <div className="mb-3 px-3 py-2 rounded-xl text-xs text-danger flex items-center gap-2"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <AlertTriangle size={12} /> {errors.submit}
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        style={{
                                            background: success
                                                ? 'linear-gradient(135deg, #10B981, #059669)'
                                                : 'linear-gradient(135deg, #7C3AED, #2563EB)',
                                            boxShadow: '0 0 20px rgba(124,58,237,0.25)',
                                        }}
                                    >
                                        {isLoading ? (
                                            <><Loader2 size={14} className="animate-spin" /> Analyzing with Gemini AI...</>
                                        ) : success ? (
                                            <>✓ Analysis Complete</>
                                        ) : (
                                            <><Sparkles size={14} /> Analyze & Get AI Advice</>
                                        )}
                                    </motion.button>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                                    >
                                        Cancel
                                    </button>
                                    <p className="text-[10px] text-slate-600 ml-auto">
                                        Powered by Gemini 2.0 Flash
                                    </p>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
