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

export interface FinancialMetrics {
    monthly_income: number;
    monthly_expenses: number;
    monthly_savings: number;
    total_debt: number;
    emergency_fund: number;
    debt_to_income_ratio: number;
    health_score: number;
    health_label?: string;
    savings_ratio?: number;
    emergency_fund_months?: number;
    emergency_fund_requirement?: number;
}

export interface FinancialCharts {
    summary?: any;
    budget?: any;
    forecast?: any;
    goals?: any;
}

export interface FinancialData {
    metrics: FinancialMetrics;
    actions: ActionItem[];
    charts: FinancialCharts;
    health_breakdown?: HealthFactor[];
    budget_analysis?: BudgetCategory[];
}

export interface ExpenseItem {
    category: string;
    amount: number;
    color: string;
}

export interface SavingsHistory {
    month: string;
    savings: number;
    target: number;
    emergency: number;
}

export interface Goal {
    id: string;
    type: 'emergency_fund' | 'house' | 'vacation' | 'retirement';
    name: string;
    target_amount: number;
    current_amount: number;
    timeline_months: number;
    monthly_required: number;
    icon: string;
    feasibility?: 'Achievable' | 'Stretch' | 'Not Feasible';
    strategy?: string;
    milestones?: { month: number; label: string; accumulated: number; percentage: number }[];
}

export interface AIAdvice {
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    action_steps?: string[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export type ActivePage = 'dashboard' | 'insights' | 'investments' | 'goals' | 'advisor' | 'simulator' | 'report' | 'settings' | 'tax' | 'retirement';
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';
