import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, DollarSign, Bot, Save, Check } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface AppSettings {
    displayName: string;
    currency: string;
    defaultRiskTolerance: 'conservative' | 'moderate' | 'aggressive';
    retirementAge: number;
    aiSuggestionsEnabled: boolean;
    notificationsEnabled: boolean;
}

const STORAGE_KEY = 'finai_settings';

const defaultSettings: AppSettings = {
    displayName: 'Guest User',
    currency: 'INR',
    defaultRiskTolerance: 'moderate',
    retirementAge: 60,
    aiSuggestionsEnabled: true,
    notificationsEnabled: true,
};

export const loadSettings = (): AppSettings => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return defaultSettings;
};

const saveSettings = (s: AppSettings) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
};

// ── Sub-components ──────────────────────────────────────────────────────────

const SectionCard: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode; delay?: number }> = ({ icon, title, subtitle, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="glass-card p-6"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)' }}>
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="text-[11px] text-slate-500">{subtitle}</p>
            </div>
        </div>
        <div className="space-y-4">{children}</div>
    </motion.div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
        {children}
    </div>
);

const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50 transition";
const selectCls = `${inputCls} cursor-pointer appearance-none`;

const Toggle: React.FC<{ enabled: boolean; onChange: (v: boolean) => void; label: string; subtitle: string }> = ({ enabled, onChange, label, subtitle }) => (
    <div className="flex items-center justify-between py-1">
        <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className="relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0"
            style={{ background: enabled ? '#2563EB' : 'rgba(255,255,255,0.1)', width: 40, height: 22 }}
        >
            <motion.div
                animate={{ x: enabled ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow"
            />
        </button>
    </div>
);

// ── Main Page ───────────────────────────────────────────────────────────────

export const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>(loadSettings);
    const [saved, setSaved] = useState(false);

    const update = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) =>
        setSettings(prev => ({ ...prev, [key]: val }));

    const handleSave = () => {
        saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
                <h1 className="text-xl font-black text-white">Settings</h1>
                <p className="text-sm text-slate-500">Manage your profile and preferences</p>
            </motion.div>

            {/* 1. User Profile */}
            <SectionCard icon={<User size={16} className="text-blue-400" />} title="User Profile" subtitle="Your display identity" delay={0.05}>
                <Field label="Display Name">
                    <input
                        type="text"
                        value={settings.displayName}
                        onChange={e => update('displayName', e.target.value)}
                        placeholder="Enter your name"
                        className={inputCls}
                    />
                </Field>
            </SectionCard>

            {/* 2. Financial Preferences */}
            <SectionCard icon={<DollarSign size={16} className="text-emerald-400" />} title="Financial Preferences" subtitle="Defaults used across the app" delay={0.1}>
                <Field label="Preferred Currency">
                    <select value={settings.currency} onChange={e => update('currency', e.target.value)} className={selectCls} style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <option value="INR">₹ Indian Rupee (INR)</option>
                        <option value="USD">$ US Dollar (USD)</option>
                        <option value="EUR">€ Euro (EUR)</option>
                        <option value="GBP">£ British Pound (GBP)</option>
                    </select>
                </Field>
                <Field label="Default Risk Tolerance">
                    <div className="grid grid-cols-3 gap-2">
                        {(['conservative', 'moderate', 'aggressive'] as const).map(r => (
                            <button
                                key={r}
                                onClick={() => update('defaultRiskTolerance', r)}
                                className="py-2 rounded-xl text-xs font-semibold capitalize transition"
                                style={{
                                    background: settings.defaultRiskTolerance === r
                                        ? r === 'conservative' ? 'rgba(16,185,129,0.2)' : r === 'moderate' ? 'rgba(37,99,235,0.2)' : 'rgba(239,68,68,0.2)'
                                        : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${settings.defaultRiskTolerance === r
                                        ? r === 'conservative' ? '#10B981' : r === 'moderate' ? '#2563EB' : '#EF4444'
                                        : 'rgba(255,255,255,0.08)'}`,
                                    color: settings.defaultRiskTolerance === r ? 'white' : '#64748B',
                                }}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </Field>
                <Field label="Target Retirement Age">
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min={45}
                            max={75}
                            value={settings.retirementAge}
                            onChange={e => update('retirementAge', Number(e.target.value))}
                            className="flex-1 accent-blue-500"
                        />
                        <span className="text-sm font-bold text-white w-10 text-center">{settings.retirementAge}</span>
                    </div>
                </Field>
            </SectionCard>

            {/* 3. AI Preferences */}
            <SectionCard icon={<Bot size={16} className="text-violet-400" />} title="AI Preferences" subtitle="Control AI-powered features" delay={0.15}>
                <Toggle
                    enabled={settings.aiSuggestionsEnabled}
                    onChange={v => update('aiSuggestionsEnabled', v)}
                    label="AI Suggestions"
                    subtitle="Show AI-generated financial recommendations"
                />
                <div className="h-px bg-white/5" />
                <Toggle
                    enabled={settings.notificationsEnabled}
                    onChange={v => update('notificationsEnabled', v)}
                    label="Notifications"
                    subtitle="Alert me about budget overruns and goal milestones"
                />
            </SectionCard>

            {/* Save button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-end pb-4">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                    style={{
                        background: saved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #2563EB, #7C3AED)',
                        border: saved ? '1px solid #10B981' : 'none',
                    }}
                >
                    {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Settings</>}
                </motion.button>
            </motion.div>
        </div>
    );
};
