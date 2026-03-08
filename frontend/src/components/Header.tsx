import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
    onRefresh: () => void;
    isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading }) => {
    return (
        <header className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(6,9,20,0.8)', backdropFilter: 'blur(20px)' }}>

            {/* Left side - can be used for page title or breadcrumbs */}
            <div className="flex-1">
                {/* Placeholder for future page-specific content */}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
                {/* Refresh */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    title="Refresh"
                >
                    <motion.div
                        animate={{ rotate: isLoading ? 360 : 0 }}
                        transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
                    >
                        <RefreshCw size={14} />
                    </motion.div>
                </motion.button>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 ml-1 cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.08)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }}>
                    GU
                </div>
            </div>
        </header>
    );
};
