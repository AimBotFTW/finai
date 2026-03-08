import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { InsightsPage } from './pages/InsightsPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { GoalsPage } from './pages/GoalsPage';
import { AdvisorPage } from './pages/AdvisorPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ReportPage } from './pages/ReportPage';
import { useFinancialData } from './hooks/useFinancialData';
import { ActivePage } from './types';
import { SettingsPage } from './pages/SettingsPage';
import { TaxOptimizerPage } from './pages/TaxOptimizerPage';
import { RetirementPlannerPage } from './pages/RetirementPlannerPage';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -8 },
};

function App() {
    const [activePage, setActivePage] = useState<ActivePage>('dashboard');
    const [showLanding, setShowLanding] = useState(true);
    const {
        financialData,
        goals,
        advice,
        chatMessages,
        isLoading,
        isChatLoading,
        isPortfolioLoading,
        analyzeUserFinances,
        sendMessage,
        updateGoal,
        addGoal,
        riskProfile,
        setRiskProfile,
        portfolio,
        forecast,
    } = useFinancialData();

    const handleRefresh = () => {
        // Only refresh if we have financial data
        if (financialData.metrics.monthly_income > 0) {
            analyzeUserFinances({
                monthly_income: financialData.metrics.monthly_income,
                monthly_expenses: financialData.metrics.monthly_expenses,
                total_debt: financialData.metrics.total_debt,
                current_savings: 0, // This would need to be tracked separately
                monthly_investments: financialData.metrics.monthly_savings * 0.6, // Estimate
                emergency_fund: financialData.metrics.emergency_fund,
                risk_profile: riskProfile,
            });
        }
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard':
                return <DashboardPage data={financialData} onAnalyze={analyzeUserFinances} isLoading={isLoading} advice={advice} onNavigate={setActivePage} />;
            case 'insights':
                return <InsightsPage data={financialData} forecast={forecast} riskProfile={riskProfile} />;
            case 'investments':
                return <InvestmentsPage portfolio={portfolio} riskProfile={riskProfile} onRiskChange={setRiskProfile} isLoading={isPortfolioLoading} />;
            case 'goals':
                return <GoalsPage goals={goals} onUpdateGoal={updateGoal} onAddGoal={addGoal} />;
            case 'advisor':
                return (
                    <AdvisorPage
                        advice={advice}
                        chatMessages={chatMessages}
                        onSendMessage={sendMessage}
                        isLoading={isLoading}
                        isChatLoading={isChatLoading}
                    />
                );
            case 'simulator':
                return <SimulatorPage data={financialData} riskProfile={riskProfile} />;
            case 'settings':
                return <SettingsPage />;
            case 'report':
                return <ReportPage data={financialData} riskProfile={riskProfile} />;
            case 'tax':
                return <TaxOptimizerPage data={financialData} />;
            case 'retirement':
                return <RetirementPlannerPage data={financialData} />;
            default:
                return <DashboardPage data={financialData} onAnalyze={analyzeUserFinances} isLoading={isLoading} advice={advice} onNavigate={setActivePage} />;
        }
    };


    if (showLanding) {
        return (
            <LandingPage
                onEnterDashboard={() => {
                    setShowLanding(false);
                    setActivePage('dashboard');
                }}
            />
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Subtle ambient blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04] blur-3xl"
                    style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.03] blur-3xl"
                    style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
            </div>

            <Sidebar activePage={activePage} onNavigate={setActivePage} />

            <div className="flex flex-col flex-1 overflow-hidden">
                <Header onRefresh={handleRefresh} isLoading={isLoading} />

                <main className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePage}
                            variants={pageVariants}
                            initial="initial"
                            animate="in"
                            exit="out"
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            {renderPage()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default App;
