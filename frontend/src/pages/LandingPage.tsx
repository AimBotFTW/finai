import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { DashboardPreview } from '../components/landing/DashboardPreview';
import { GoalTrackingSection } from '../components/landing/GoalTrackingSection';
import { PricingSection } from '../components/landing/PricingSection';
import { AboutSection } from '../components/landing/AboutSection';
import { CTASection } from '../components/landing/CTASection';

interface LandingPageProps {
    onEnterDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
    return (
        <div className="min-h-screen overflow-x-hidden" style={{ background: '#03040E' }}>
            {/* Navbar */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
                style={{ background: 'rgba(3, 4, 14, 0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-black text-[15px] shadow-glow-blue" style={{ boxShadow: '0 0 16px rgba(16,185,129,0.3)' }}>
                        F
                    </div>
                    <span className="font-bold text-white text-lg tracking-tight">FinAI</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    {['Home', 'Features', 'Pricing', 'About'].map((item) => (
                        <button
                            key={item}
                            onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onEnterDashboard}
                    className="text-sm font-semibold px-5 py-2.5 rounded-full text-white"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                    Start now →
                </motion.button>
            </motion.nav>

            <HeroSection onEnterDashboard={onEnterDashboard} />
            <FeaturesSection />
            <DashboardPreview onEnterDashboard={onEnterDashboard} />
            <GoalTrackingSection />
            <PricingSection />
            <AboutSection />
            <CTASection onEnterDashboard={onEnterDashboard} />

            {/* Footer */}
            <footer className="py-8 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-slate-500 text-sm">© 2026 FinAI · AI Financial Advisor · Smart Financial Planning for India 🇮🇳</p>
            </footer>
        </div>
    );
};
