"""
models.py — All Pydantic request/response models for the AI Financial Advisor API.
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal


# ─── Enums / Literals ─────────────────────────────────────────────────────────

RiskProfileType = Literal["conservative", "moderate", "aggressive"]
PriorityType = Literal["high", "medium", "low", "HIGH", "MEDIUM", "LOW"]
FeasibilityType = Literal["Achievable", "Stretch", "Not Feasible"]


# ─── Request Models ────────────────────────────────────────────────────────────

class FinancialInput(BaseModel):
    monthly_income: float = Field(..., gt=0)
    monthly_expenses: float = Field(..., gt=0)
    total_debt: float = Field(default=0, ge=0)
    emergency_fund: float = Field(default=0, ge=0)
    savings_goal: Optional[float] = None
    timeline_months: Optional[int] = 12
    risk_profile: RiskProfileType = "moderate"


class GoalPlanRequest(BaseModel):
    goal_name: str
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(default=0, ge=0)
    timeline_months: int = Field(..., gt=0)
    monthly_income: Optional[float] = None
    monthly_savings: Optional[float] = None
    risk_profile: RiskProfileType = "moderate"


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[dict] = Field(default_factory=list)
    financial_context: Optional[dict] = None


class PortfolioRequest(BaseModel):
    risk_profile: RiskProfileType = "moderate"
    monthly_investable: float = Field(..., ge=0)
    total_invested: float = Field(default=0, ge=0)
    horizon_years: int = Field(default=10, ge=1)


class ForecastRequest(BaseModel):
    monthly_income: float = Field(..., gt=0)
    monthly_savings: float = Field(..., ge=0)
    existing_investments: float = Field(default=0, ge=0)
    risk_profile: RiskProfileType = "moderate"
    income_growth_pct: float = Field(default=8.0, ge=0)  # annual %


# ─── Sub-models ────────────────────────────────────────────────────────────────

class ExpenseItem(BaseModel):
    category: str
    amount: float
    color: str
    percentage: float = 0.0


class SavingsHistoryItem(BaseModel):
    month: str
    savings: float
    target: float
    emergency: float


class HealthFactor(BaseModel):
    factor: str          # "Savings Rate" | "Debt Ratio" | "Emergency Fund"
    score: int           # 0-100 sub-score
    label: str           # "Good" | "Average" | "Low" | "Excellent"
    color: str           # hex color
    detail: str          # human-readable explanation
    weight: int          # contribution weight (0-100)


class AIAdviceItem(BaseModel):
    category: str
    title: str
    description: str
    priority: PriorityType
    icon: str
    action_steps: list[str] = []


class ActionItem(BaseModel):
    title: str
    description: str
    priority: PriorityType
    impact: str          # e.g. "Save ₹12,000/year"
    icon: str


class BudgetCategory(BaseModel):
    category: str
    amount: float
    color: str
    percentage: float            # actual % of expenses
    recommended_pct: float       # recommended %
    status: Literal["optimal", "over", "under"]
    suggestion: str


class AllocationSlice(BaseModel):
    asset_class: str
    percentage: float
    color: str
    monthly_amount: float
    rationale: str
    examples: list[str] = []


class ForecastDataPoint(BaseModel):
    year: int
    label: str
    savings: float
    investments: float
    net_worth: float


class GoalMilestone(BaseModel):
    month: int
    label: str
    accumulated: float
    percentage: float


# ─── Top-level Response Models ─────────────────────────────────────────────────

class MetricsSummary(BaseModel):
    monthly_income: float
    monthly_expenses: float
    monthly_savings: float
    total_debt: float
    emergency_fund: float
    health_score: int
    savings_ratio: float
    debt_to_income_ratio: float
    emergency_fund_months: float
    health_label: str
    health_color: str

class ChartsSummary(BaseModel):
    summary: dict   # Income vs Expenses
    budget: list    # Category breakdown
    forecast: list  # Projections
    goals: list     # Milestones

class UnifiedAnalysisResponse(BaseModel):
    metrics: MetricsSummary
    actions: list[ActionItem]
    charts: ChartsSummary
    health_breakdown: list[HealthFactor]
    budget_analysis: list[BudgetCategory]


class FinancialMetrics(BaseModel):
    # Core metrics
    monthly_income: float
    monthly_expenses: float
    monthly_savings: float
    savings_ratio: float
    total_debt: float
    emergency_fund: float
    debt_to_income_ratio: float
    emergency_fund_months: float
    emergency_fund_requirement: float
    financial_health_score: int
    health_label: str
    health_breakdown: list[HealthFactor]
    # Chart data
    chart_data: ChartsSummary
    # Actions
    action_items: list[ActionItem]
    budget_analysis: list[BudgetCategory]
    # Legacy compat
    health_score: int
    expense_breakdown: list[ExpenseItem]
    savings_history: list[SavingsHistoryItem]


class PortfolioResponse(BaseModel):
    risk_profile: RiskProfileType
    allocations: list[AllocationSlice]
    expected_annual_return: float
    expected_10yr_value: float
    monthly_investable: float
    rebalance_note: str


class NetWorthForecastResponse(BaseModel):
    risk_profile: RiskProfileType
    forecast: list[ForecastDataPoint]
    final_net_worth: float
    cagr: float
    assumptions: dict


class GoalPlanResponse(BaseModel):
    goal_name: str
    target_amount: float
    current_amount: float
    gap: float
    monthly_required: float
    timeline_months: int
    feasibility: FeasibilityType
    strategy: str
    milestones: list[GoalMilestone]


class ChatResponse(BaseModel):
    response: str
    suggestions: list[str] = []
