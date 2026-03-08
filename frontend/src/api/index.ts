import axios, { AxiosError } from 'axios';
import { FinancialData, AIAdvice, ChatMessage } from '../types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
    timeout: 35000,
});

// ── Request types ──────────────────────────────────────────────────────────────
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export interface FinancialInput {
    monthly_income: number;
    monthly_expenses: number;
    total_debt: number;
    current_savings: number;
    monthly_investments: number;
    emergency_fund: number;
    risk_profile: RiskProfile;
}

export interface GoalPlanInput {
    goal_name: string;
    target_amount: number;
    current_amount: number;
    timeline_months: number;
    monthly_income?: number;
    monthly_savings?: number;
    risk_profile?: RiskProfile;
}

export interface PortfolioInput {
    risk_profile: RiskProfile;
    monthly_investable: number;
    total_invested?: number;
    horizon_years?: number;
}

export interface ForecastInput {
    monthly_income: number;
    monthly_savings: number;
    existing_investments?: number;
    risk_profile: string;
    compare?: boolean;
    inflation_rate?: number;
    income_growth_pct?: number;
}

// ── Response types ─────────────────────────────────────────────────────────────
export interface GoalMilestone {
    month: number;
    label: string;
    accumulated: number;
    percentage: number;
}

export interface GoalPlan {
    goal_name: string;
    target_amount: number;
    current_amount: number;
    gap: number;
    monthly_required: number;
    timeline_months: number;
    feasibility: 'Achievable' | 'Stretch' | 'Not Feasible';
    strategy: string;
    milestones: GoalMilestone[];
}

export interface HealthFactor {
    factor: string;
    score: number;
    label: string;
    color: string;
    detail: string;
    weight: number;
}

export interface ActionItem {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    icon: string;
}

export interface BudgetCategory {
    category: string;
    amount: number;
    color: string;
    percentage: number;
    recommended_pct: number;
    status: 'optimal' | 'over' | 'under';
    suggestion: string;
}

export interface AllocationSlice {
    asset_class: string;
    percentage: number;
    color: string;
    monthly_amount: number;
    rationale: string;
    examples: string[];
}

export interface PortfolioData {
    risk_profile: RiskProfile;
    allocations: AllocationSlice[];
    expected_annual_return: number;
    expected_10yr_value: number;
    monthly_investable: number;
    rebalance_note: string;
}

export interface ForecastPoint {
    year: number;
    label: string;
    savings: number;
    investments: number;
    net_worth: number;
}

export interface ForecastData {
    risk_profile: RiskProfile;
    forecast: ForecastPoint[];
    final_net_worth: number;
    cagr: number;
    assumptions: Record<string, number>;
}

// ── API Functions ──────────────────────────────────────────────────────────────
export const analyzeFinances = async (data: FinancialInput): Promise<FinancialData> => {
    const response = await api.post('/analyze-finances', data);
    return response.data;
};

export const getAIAdvice = async (data: FinancialInput): Promise<AIAdvice[]> => {
    const response = await api.post('/ai-advice', data);
    return response.data;
};

export const getPortfolio = async (data: PortfolioInput): Promise<PortfolioData> => {
    const response = await api.post('/portfolio', data);
    return response.data;
};

export const getForecast = async (data: ForecastInput): Promise<ForecastData> => {
    const response = await api.post('/forecast', data);
    return response.data;
};

export const getGoalPlan = async (data: GoalPlanInput): Promise<GoalPlan> => {
    const response = await api.post('/goal-plan', data);
    return response.data;
};

export const sendChatMessage = async (
    message: string,
    history: ChatMessage[],
    financialContext?: Record<string, number | string>,
): Promise<{ response: string; suggestions: string[] }> => {
    const res = await api.post('/chat', {
        message,
        history: history.map(m => ({ role: m.role, content: m.content })),
        financial_context: financialContext,
    });
    const data = res.data;
    if (typeof data === 'string') return { response: data, suggestions: [] };
    return { response: data.response || '', suggestions: data.suggestions || [] };
};

export const runSimulation = async (data: any): Promise<any> => {
    const response = await api.post('/simulate', data);
    return response.data;
};

export const getApiErrorMessage = (err: unknown): string => {
    if (err instanceof AxiosError) return err.response?.data?.detail || err.message;
    return 'An unexpected error occurred.';
};
