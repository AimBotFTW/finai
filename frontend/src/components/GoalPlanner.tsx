import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, X } from 'lucide-react';
import { Goal } from '../types';

interface GoalPlannerProps {
    goals: Goal[];
    onUpdateGoal: (goal: Goal) => void;
    onAddGoal: (goal: Goal) => Promise<void>; // Updated to Promise since it's now async
}

const goalTypes = [
    { value: 'emergency_fund', label: 'Emergency Fund', icon: '🛡️' },
    { value: 'house', label: 'House Purchase', icon: '🏠' },
    { value: 'vacation', label: 'Vacation', icon: '✈️' },
    { value: 'retirement', label: 'Retirement', icon: '🌴' },
];

const priorityColors: Record<Goal['type'], string> = {
    emergency_fund: '#2563EB',
    house: '#7C3AED',
    vacation: '#0891B2',
    retirement: '#10B981',
};

export const GoalPlanner: React.FC<GoalPlannerProps> = ({ goals, onAddGoal }) => {
    const [showForm, setShowForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
    const [form, setForm] = useState({
        type: 'emergency_fund' as Goal['type'],
        target_amount: '',
        current_amount: '',
        timeline_months: '',
    });

    const handleSubmit = async () => {
        const target = parseFloat(form.target_amount);
        const current = parseFloat(form.current_amount) || 0;
        const months = parseInt(form.timeline_months);
        if (!target || !months) return;

        setIsCreating(true);
        try {
            const goalType = goalTypes.find(g => g.value === form.type)!;
            const newGoal: Goal = {
                id: Date.now().toString(),
                type: form.type,
                name: goalType.label,
                target_amount: target,
                current_amount: current,
                timeline_months: months,
                monthly_required: (target - current) / months,
                icon: goalType.icon,
            };
            await onAddGoal(newGoal);
            setShowForm(false);
            setForm({ type: 'emergency_fund', target_amount: '', current_amount: '', timeline_months: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="section-title">Goal Planner</h2>
                    <p className="section-subtitle">AI-powered strategy for your milestones</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={16} /> Add Goal
                </motion.button>
            </div>

            {goals.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-12 text-center flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                        <Target size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No Savings Goals Yet</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                        Define your financial goals and our AI will calculate the optimal strategy to achieve them.
                    </p>
                    <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 mt-2">
                        <Plus size={16} /> Add Your First Goal
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goals.map((goal, i) => {
                        const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                        const color = priorityColors[goal.type];
                        const isExpanded = expandedGoal === goal.id;
                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-5 group cursor-pointer"
                                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{goal.icon}</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-white">{goal.name}</h3>
                                                {goal.feasibility && (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${goal.feasibility === 'Achievable' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            goal.feasibility === 'Stretch' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {goal.feasibility}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {goal.timeline_months} mo · Done {(() => {
                                                    const d = new Date();
                                                    d.setMonth(d.getMonth() + goal.timeline_months);
                                                    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className="text-xs font-bold px-2 py-1 rounded-lg"
                                        style={{ backgroundColor: `${color}20`, color }}
                                    >
                                        {progress.toFixed(0)}%
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-slate-400">Progress</span>
                                            <span className="text-white font-medium">
                                                ₹{(goal.current_amount / 100000).toFixed(1)}L / ₹{(goal.target_amount / 100000).toFixed(1)}L
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-lg p-2.5">
                                            <p className="text-[10px] text-slate-500 mb-0.5">Monthly Required</p>
                                            <p className="text-sm font-bold text-white">
                                                ₹{Math.round(goal.monthly_required).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2.5">
                                            <p className="text-[10px] text-slate-500 mb-0.5">Remaining</p>
                                            <p className="text-sm font-bold text-white">
                                                ₹{((goal.target_amount - goal.current_amount) / 100000).toFixed(1)}L
                                            </p>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && goal.strategy && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pt-3 border-t border-white/5 mt-3"
                                            >
                                                <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-2">AI Strategy</p>
                                                <p className="text-xs text-slate-300 italic mb-4 leading-relaxed">"{goal.strategy}"</p>

                                                {goal.milestones && goal.milestones.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Milestones</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {goal.milestones.map((m, idx) => (
                                                                <div key={idx} className="bg-white/5 rounded-lg p-2 border border-white/5">
                                                                    <div className="flex justify-between text-[10px] mb-1">
                                                                        <span className="text-slate-400">{m.label}</span>
                                                                        <span className="text-white font-bold">{m.percentage}%</span>
                                                                    </div>
                                                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-primary/50" style={{ width: `${m.percentage}%` }} />
                                                                    </div>
                                                                    <p className="text-[9px] text-slate-500 mt-1">Target: ₹{(m.accumulated / 1000).toFixed(0)}K</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {!isExpanded && goal.strategy && (
                                        <p className="text-[10px] text-primary/70 text-center mt-2 font-medium">Click to view AI Strategy & Milestones</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Add Goal Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && !isCreating && setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card p-6 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Target size={18} className="text-primary" />
                                    <h3 className="font-bold text-white">Add New Goal</h3>
                                </div>
                                <button disabled={isCreating} onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1.5 block">Goal Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {goalTypes.map(gt => (
                                            <button
                                                key={gt.value}
                                                disabled={isCreating}
                                                onClick={() => setForm(f => ({ ...f, type: gt.value as Goal['type'] }))}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-medium transition-all ${form.type === gt.value
                                                    ? 'border-primary/50 bg-primary/20 text-white'
                                                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                                                    } ${isCreating ? 'opacity-50' : ''}`}
                                            >
                                                <span>{gt.icon}</span> {gt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 mb-1.5 block">Target Amount (₹)</label>
                                    <input
                                        type="number"
                                        disabled={isCreating}
                                        placeholder="e.g. 500000"
                                        value={form.target_amount}
                                        onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
                                        className="input-field disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 mb-1.5 block">Current Savings (₹)</label>
                                    <input
                                        type="number"
                                        disabled={isCreating}
                                        placeholder="e.g. 50000"
                                        value={form.current_amount}
                                        onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))}
                                        className="input-field disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 mb-1.5 block">Timeline (months)</label>
                                    <input
                                        type="number"
                                        disabled={isCreating}
                                        placeholder="e.g. 24"
                                        value={form.timeline_months}
                                        onChange={e => setForm(f => ({ ...f, timeline_months: e.target.value }))}
                                        className="input-field disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isCreating || !form.target_amount || !form.timeline_months}
                                    className="btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isCreating && (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                            <RefreshCw size={16} />
                                        </motion.div>
                                    )}
                                    {!isCreating && <Plus size={16} />}
                                    {isCreating ? 'AI Planning...' : 'Create Goal'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Local RefreshCw icon
const RefreshCw = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
);
