import { motion } from 'framer-motion';
import { ShieldCheck, Target, TrendingUp } from 'lucide-react';

export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

interface RiskOption {
    value: RiskProfile;
    label: string;
    icon: typeof ShieldCheck;
    description: string;
    expectedReturn: string;
    color: string;
}

const OPTIONS: RiskOption[] = [
    {
        value: 'conservative',
        label: 'Conservative',
        icon: ShieldCheck,
        description: 'Capital preservation, stable returns',
        expectedReturn: '8–10%',
        color: '#10B981',
    },
    {
        value: 'moderate',
        label: 'Moderate',
        icon: Target,
        description: 'Balanced growth and stability',
        expectedReturn: '10–13%',
        color: '#2563EB',
    },
    {
        value: 'aggressive',
        label: 'Aggressive',
        icon: TrendingUp,
        description: 'Maximum growth, higher risk',
        expectedReturn: '13–17%',
        color: '#7C3AED',
    },
];

interface RiskProfileSelectorProps {
    value: RiskProfile;
    onChange: (profile: RiskProfile) => void;
}

export const RiskProfileSelector: React.FC<RiskProfileSelectorProps> = ({ value, onChange }) => {
    return (
        <div>
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Risk Profile</p>
            <div className="grid grid-cols-3 gap-2">
                {OPTIONS.map((opt, i) => {
                    const isActive = value === opt.value;
                    const Icon = opt.icon;
                    return (
                        <motion.button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="relative p-3 rounded-xl text-left transition-all"
                            style={{
                                background: isActive ? `${opt.color}18` : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isActive ? opt.color + '50' : 'rgba(255,255,255,0.07)'}`,
                                boxShadow: isActive ? `0 0 16px ${opt.color}20` : 'none',
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="risk-active"
                                    className="absolute inset-0 rounded-xl"
                                    style={{ background: `linear-gradient(135deg, ${opt.color}12, transparent)` }}
                                />
                            )}
                            <Icon size={16} style={{ color: isActive ? opt.color : '#64748B' }} className="mb-2" />
                            <p className="text-xs font-bold" style={{ color: isActive ? opt.color : '#94A3B8' }}>
                                {opt.label}
                            </p>
                            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.description}</p>
                            <p className="text-[10px] font-semibold mt-1.5" style={{ color: isActive ? opt.color : '#475569' }}>
                                {opt.expectedReturn} CAGR
                            </p>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
