import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import {
    LayoutDashboard, TrendingUp, LineChart, Target,
    Bot, Settings, ChevronLeft, ChevronRight,
    IndianRupee, Sparkles, LogOut, Sliders, FileText, Sunrise,
} from 'lucide-react';
import { ActivePage } from '../types';
import { loadSettings } from '../pages/SettingsPage';

interface NavItem {
    id: ActivePage | 'settings';
    label: string;
    icon: LucideIcon;
    badge?: string;
    group?: string;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
    { id: 'insights', label: 'Insights', icon: TrendingUp, group: 'main' },
    { id: 'investments', label: 'Investments', icon: LineChart, group: 'main' },
    { id: 'goals', label: 'Goals', icon: Target, group: 'main' },
    { id: 'advisor', label: 'AI Advisor', icon: Bot, badge: 'AI', group: 'ai' },
    { id: 'simulator', label: 'Simulator', icon: Sliders, badge: 'NEW', group: 'ai' },
    { id: 'tax', label: 'Tax Optimizer', icon: FileText, badge: 'AI', group: 'ai' },
    { id: 'retirement', label: 'Retirement', icon: Sunrise, badge: 'NEW', group: 'ai' },
    { id: 'report', label: 'AI Report', icon: FileText, badge: 'NEW', group: 'ai' },
    { id: 'settings', label: 'Settings', icon: Settings, group: 'util' },
];

interface SidebarProps {
    activePage: ActivePage;
    onNavigate: (page: ActivePage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
    const [collapsed, setCollapsed] = useState(false);
    const settings = loadSettings();
    const displayName = settings.displayName || 'Guest User';
    const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 64 : 220 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex flex-col h-screen flex-shrink-0 overflow-hidden"
            style={{
                background: 'rgba(6, 9, 20, 0.95)',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black text-white text-[15px]"
                    style={{ background: 'linear-gradient(135deg, #10B981, #2563EB)', boxShadow: '0 0 16px rgba(16,185,129,0.3)' }}>
                    F
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15 }}
                        >
                            <p className="font-black text-white text-sm leading-none">FinAI</p>
                            <p className="text-[10px] text-primary font-semibold mt-0.5">Advisor</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* User profile */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mx-3 mt-4 mb-2 p-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-300"
                                style={{ background: 'rgba(255,255,255,0.08)' }}>
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{displayName}</p>
                                <p className="text-[10px] text-slate-500 truncate">Not signed in</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => onNavigate(item.id as ActivePage)}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`sidebar-link w-full ${isActive ? 'active' : ''}`}
                        >
                            <div className="relative flex-shrink-0">
                                <Icon size={17} className={isActive ? 'text-primary' : 'text-slate-500'} />
                                {item.badge && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-[7px] font-black rounded-full w-3 h-3 flex items-center justify-center">
                                        AI
                                    </span>
                                )}
                            </div>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.12 }}
                                        className="whitespace-nowrap text-ellipsis overflow-hidden text-sm"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </nav>



            {/* Collapse button */}
            <motion.button
                onClick={() => setCollapsed(!collapsed)}
                whileHover={{ scale: 1.1 }}
                className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center z-20"
                style={{ background: '#1E2D45', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                {collapsed ? <ChevronRight size={11} className="text-slate-400" /> : <ChevronLeft size={11} className="text-slate-400" />}
            </motion.button>
        </motion.aside>
    );
};
