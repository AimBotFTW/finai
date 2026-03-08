import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string;
    rawValue?: number;
    subtitle: string;
    icon: LucideIcon;
    trend?: { value: string; positive: boolean };
    accentColor?: string;
    delay?: number;
    prefix?: string;
    suffix?: string;
}

function useCountUp(target: number, duration = 1200, enabled = true) {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        if (!ref.current || !enabled || !target) return;
        const start = 0;
        const startTime = performance.now();
        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * eased);
            if (ref.current) {
                ref.current.textContent = current.toLocaleString('en-IN');
            }
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, enabled]);
    return ref;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    rawValue,
    subtitle,
    icon: Icon,
    trend,
    accentColor = '#2563EB',
    delay = 0,
    prefix = '',
    suffix = '',
}) => {
    const counterRef = useCountUp(rawValue || 0, 1200, !!rawValue);

    // mini sparkline dots
    const sparkPoints = [40, 55, 45, 70, 60, 80, 72].map((v, i) => ({ x: i * 14, y: 80 - v }));
    const sparkPath = sparkPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="glass-card p-5 cursor-default relative overflow-hidden group"
            style={{ transition: 'border-color 0.3s, box-shadow 0.3s' }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${accentColor}40`;
                e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${accentColor}18`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
            }}
        >
            {/* Background glow blob */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-[0.07] blur-2xl group-hover:opacity-[0.14] transition-opacity"
                style={{ backgroundColor: accentColor }} />

            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}28` }}>
                    <Icon size={17} style={{ color: accentColor }} />
                </div>
                {trend && (
                    <span className={trend.positive ? 'trend-badge-up' : 'trend-badge-down'}>
                        {trend.positive ? '▲' : '▼'} {trend.value}
                    </span>
                )}
            </div>

            {/* Value */}
            <div className="mb-1">
                <p className="metric-value">
                    {prefix}
                    {rawValue ? (
                        <span ref={counterRef}>0</span>
                    ) : (
                        value
                    )}
                    {suffix}
                </p>
            </div>
            <p className="text-[11px] font-bold text-slate-300 mb-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</p>
            <p className="text-[11px] text-slate-500">{subtitle}</p>

            {/* Mini sparkline */}
            <div className="mt-3 overflow-hidden" style={{ height: 28 }}>
                <svg width="90" height="28" viewBox="0 0 90 80" fill="none" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="90" y2="0" gradientUnits="userSpaceOnUse">
                            <stop stopColor={accentColor} stopOpacity="0.3" />
                            <stop offset="1" stopColor={accentColor} stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <path d={sparkPath} stroke={`url(#spark-${title})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </motion.div>
    );
};
