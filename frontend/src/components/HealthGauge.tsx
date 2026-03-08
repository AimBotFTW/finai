import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

interface HealthGaugeProps {
    score: number;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({ score }) => {
    const getStatus = () => {
        if (score >= 80) return { label: 'Excellent', color: '#10B981', bg: 'bg-success/15 text-success' };
        if (score >= 60) return { label: 'Good', color: '#2563EB', bg: 'bg-primary/15 text-primary' };
        if (score >= 40) return { label: 'Average', color: '#F59E0B', bg: 'bg-warning/15 text-warning' };
        return { label: 'Poor', color: '#EF4444', bg: 'bg-danger/15 text-danger' };
    };

    const status = getStatus();

    const data = [{ value: score, fill: status.color }];
    const background = [{ value: 100, fill: 'rgba(255,255,255,0.05)' }];

    const segments = [
        { label: 'Poor', range: '0-40', color: '#EF4444' },
        { label: 'Average', range: '40-60', color: '#F59E0B' },
        { label: 'Good', range: '60-80', color: '#2563EB' },
        { label: 'Excellent', range: '80-100', color: '#10B981' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white">Financial Health Score</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Based on income, savings & debt</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${status.bg}`}>
                    {status.label}
                </span>
            </div>

            <div className="relative" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="80%"
                        innerRadius="60%"
                        outerRadius="95%"
                        startAngle={180}
                        endAngle={0}
                        data={background}
                    >
                        <RadialBar dataKey="value" cornerRadius={10} fill="rgba(255,255,255,0.05)" />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            cx="50%"
                            cy="80%"
                            innerRadius="60%"
                            outerRadius="95%"
                            startAngle={180}
                            endAngle={180 - (score / 100) * 180}
                            data={data}
                        >
                            <RadialBar dataKey="value" cornerRadius={10} fill={status.color} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="text-4xl font-black"
                        style={{ color: status.color }}
                    >
                        {score}
                    </motion.span>
                    <span className="text-xs text-slate-400">out of 100</span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-1 mt-2">
                {segments.map((seg) => (
                    <div key={seg.label} className="text-center">
                        <div className="h-1 rounded-full mb-1" style={{ backgroundColor: seg.color, opacity: status.label === seg.label ? 1 : 0.3 }} />
                        <p className="text-[10px] text-slate-500">{seg.label}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
