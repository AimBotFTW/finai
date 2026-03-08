import { useState, useCallback, useRef } from 'react';
import { FinancialData, Goal, AIAdvice, ChatMessage, RiskProfile } from '../types';
import {
    analyzeFinances, getAIAdvice, sendChatMessage, getPortfolio, getForecast, getGoalPlan,
    FinancialInput, PortfolioData, ForecastData,
} from '../api';

// ── Initial empty state ──────────────────────────────────────────────────────────

const initialFinancialData: FinancialData = {
    metrics: {
        monthly_income: 0,
        monthly_expenses: 0,
        monthly_savings: 0,
        total_debt: 0,
        emergency_fund: 0,
        debt_to_income_ratio: 0,
        health_score: 0,
        health_label: 'Not Analyzed',
        savings_ratio: 0,
        emergency_fund_months: 0,
        emergency_fund_requirement: 0,
    },
    actions: [],
    charts: {
        summary: null,
        budget: null,
        forecast: null,
        goals: null,
    },
    health_breakdown: [],
    budget_analysis: [],
};

const GOALS_KEY = 'finai_goals';

const loadGoals = (): Goal[] => {
    try {
        const stored = localStorage.getItem(GOALS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
};

const saveGoals = (goals: Goal[]) => {
    try { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); } catch { /* ignore */ }
};

const initialGoals: Goal[] = [];

const initialAdvice: AIAdvice[] = [];

const initialPortfolio: PortfolioData = {
    risk_profile: 'moderate',
    allocations: [],
    expected_annual_return: 0,
    expected_10yr_value: 0,
    monthly_investable: 0,
    rebalance_note: 'Analyze your finances to get personalized portfolio recommendations',
};

const initialForecast: ForecastData = {
    risk_profile: 'moderate',
    forecast: [],
    final_net_worth: 0,
    cagr: 0,
    assumptions: { annual_return: 0, income_growth: 0, savings_invested_pct: 0 },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useFinancialData = () => {
    const [financialData, setFinancialData] = useState<FinancialData>(initialFinancialData);
    const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
    const [advice, setAdvice] = useState<AIAdvice[]>(initialAdvice);
    const [riskProfile, setRiskProfileState] = useState<RiskProfile>('moderate');
    const [portfolio, setPortfolio] = useState<PortfolioData>(initialPortfolio);
    const [forecast, setForecast] = useState<ForecastData>(initialForecast);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
        id: '1', role: 'assistant',
        content: 'Namaste! 🙏 I\'m FinAI, your personal financial advisor. Ask me anything — "Can I afford a car loan?", "How much should I invest?", or "How do I improve my health score?" I have your financial profile and will give you personalized advice.',
        timestamp: new Date(),
    }]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Analyze finances + advice together
    const analyzeUserFinances = useCallback(async (input: FinancialInput) => {
        setIsLoading(true);
        try {
            const [data, aiAdvice] = await Promise.all([
                analyzeFinances(input),
                getAIAdvice(input),
            ]);
            setFinancialData(data);
            setAdvice(aiAdvice);
            setRiskProfileState(input.risk_profile);

            // Also refresh forecast when finances update
            const monthly_savings = Math.max(input.monthly_income - input.monthly_expenses, 0);
            const fc = await getForecast({
                monthly_income: input.monthly_income,
                monthly_savings,
                risk_profile: input.risk_profile,
                income_growth_pct: 8,
            });
            setForecast(fc);
        } catch (error) {
            console.error('Failed to analyze finances:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh portfolio when risk profile changes
    const setRiskProfile = useCallback(async (profile: RiskProfile) => {
        setRiskProfileState(profile);
        if (financialData.metrics.monthly_income === 0) {
            // Don't fetch portfolio if no financial data available
            return;
        }
        setIsPortfolioLoading(true);
        try {
            const monthly_savings = Math.max(financialData.metrics.monthly_income - financialData.metrics.monthly_expenses, 0);
            const monthly_investable = Math.round(monthly_savings * 0.60 / 500) * 500 || 16000;
            const [port, fc] = await Promise.all([
                getPortfolio({
                    risk_profile: profile,
                    monthly_investable,
                    total_invested: 0,
                    horizon_years: 10,
                }),
                getForecast({
                    monthly_income: financialData.metrics.monthly_income,
                    monthly_savings,
                    risk_profile: profile,
                    income_growth_pct: 8,
                }),
            ]);
            setPortfolio(port);
            setForecast(fc);
        } catch (error) {
            console.error('Portfolio fetch failed:', error);
        } finally {
            setIsPortfolioLoading(false);
        }
    }, [financialData]);

    const sendMessage = useCallback(async (message: string) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: message, timestamp: new Date() };
        setChatMessages(prev => [...prev, userMsg]);
        setIsChatLoading(true);
        try {
            const result = await sendChatMessage(message, [userMsg], {
                monthly_income: financialData.metrics.monthly_income,
                monthly_savings: financialData.metrics.monthly_savings,
                total_debt: financialData.metrics.total_debt,
                emergency_fund: financialData.metrics.emergency_fund,
                debt_ratio: financialData.metrics.debt_to_income_ratio,
                health_score: financialData.metrics.health_score,
                risk_profile: riskProfile,
            });
            const reply = typeof result === 'string' ? result : result.response;
            setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() }]);
        } catch {
            const fallbacks: Record<string, string> = {
                'car': `With your ₹${financialData.metrics.monthly_income.toLocaleString('en-IN')} income, safe EMI limit is ₹${Math.round(financialData.metrics.monthly_income * 0.4).toLocaleString('en-IN')}/month. A 5-year ₹8L car loan ≈ ₹16,600 EMI — check against your existing EMIs.`,
                'invest': `Invest ₹${Math.round(financialData.metrics.monthly_savings * 0.6 / 500) * 500}/month — 60% of your savings. Split: 50% Nifty 50 Index, 30% Flexi Cap, 20% Mid Cap.`,
                'emergency': 'Keep 6 months of expenses in Parag Parikh Liquid Fund (7-7.5% returns, T+1 withdrawal).',
                'tax': 'Invest ₹1.5L in ELSS + ₹50K in NPS Tier 1 for up to ₹60K+ tax savings.',
            };
            const lower = message.toLowerCase();
            const fallback = Object.entries(fallbacks).find(([k]) => lower.includes(k))?.[1]
                ?? 'Great question! Focus on: 1) Emergency fund, 2) SIP investments, 3) Tax savings via 80C + NPS.';
            setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: fallback, timestamp: new Date() }]);
        } finally {
            setIsChatLoading(false);
        }
    }, [financialData, riskProfile]);

    const updateGoal = useCallback(async (updated: Goal) => {
        try {
            const plan = await getGoalPlan({
                goal_name: updated.name,
                target_amount: updated.target_amount,
                current_amount: updated.current_amount,
                timeline_months: updated.timeline_months,
                monthly_income: financialData.metrics.monthly_income,
                monthly_savings: financialData.metrics.monthly_savings,
                risk_profile: riskProfile,
            });
            const goalWithPlan: Goal = {
                ...updated,
                monthly_required: plan.monthly_required,
                feasibility: plan.feasibility,
                strategy: plan.strategy,
                milestones: plan.milestones,
            };
            setGoals(prev => {
                const next = prev.map(g => g.id === goalWithPlan.id ? goalWithPlan : g);
                saveGoals(next);
                return next;
            });
        } catch (error) {
            console.error('Failed to update goal plan:', error);
            setGoals(prev => {
                const next = prev.map(g => g.id === updated.id ? updated : g);
                saveGoals(next);
                return next;
            });
        }
    }, [financialData.metrics, riskProfile]);

    const addGoal = useCallback(async (goal: Goal) => {
        try {
            const plan = await getGoalPlan({
                goal_name: goal.name,
                target_amount: goal.target_amount,
                current_amount: goal.current_amount,
                timeline_months: goal.timeline_months,
                monthly_income: financialData.metrics.monthly_income,
                monthly_savings: financialData.metrics.monthly_savings,
                risk_profile: riskProfile,
            });
            const goalWithPlan: Goal = {
                ...goal,
                monthly_required: plan.monthly_required,
                feasibility: plan.feasibility,
                strategy: plan.strategy,
                milestones: plan.milestones,
            };
            setGoals(prev => {
                const next = [...prev, goalWithPlan];
                saveGoals(next);
                return next;
            });
        } catch (error) {
            console.error('Failed to add goal with plan:', error);
            setGoals(prev => {
                const next = [...prev, goal];
                saveGoals(next);
                return next;
            });
        }
    }, [financialData.metrics, riskProfile]);

    return {
        financialData, goals, advice, chatMessages,
        isLoading, isChatLoading, isPortfolioLoading,
        riskProfile, setRiskProfile,
        portfolio, forecast,
        analyzeUserFinances, sendMessage, updateGoal, addGoal,
    };
};
