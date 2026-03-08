"""
AI Financial Advisor — FastAPI Backend v4.0
AI Wealth Copilot — full financial planning platform.
Deterministic financial engines in services/ + Gemini AI explanation layer.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# New deterministic services/ layer
from services.financial_engine import (
    calculate_financial_health_score as svc_health,
    calculate_savings_amount as svc_savings_amt,
    get_summary_charts as svc_summary_charts
)
from services.portfolio_engine import get_portfolio_allocation as svc_portfolio
from services.forecast_engine import (
    project_net_worth as svc_forecast, 
    simulate_scenario as svc_simulate,
    get_forecast_charts as svc_forecast_charts
)
from services.budget_engine import analyze_budget as svc_budget, get_budget_charts as svc_budget_charts
from services.goal_engine import calculate_goal_plan as svc_goal, get_goal_charts as svc_goal_charts
from services.retirement_engine import calculate_retirement_plan as svc_retirement
from services.decision_engine import generate_decisions as svc_decisions

# Database & Config
from database import create_tables, get_session, save_financial_profile, save_chat_message, get_chat_history
from config import APP_VERSION, GEMINI_AVAILABLE, GEMINI_MODEL

# Helpers
from tax_analysis import tax_optimization_analysis
from report_generator import generate_financial_report
from models import (
    FinancialInput, GoalPlanRequest, ChatRequest,
    PortfolioRequest, ForecastRequest,
    FinancialMetrics, GoalPlanResponse, ChatResponse,
    PortfolioResponse, NetWorthForecastResponse,
    AIAdviceItem, AllocationSlice, ForecastDataPoint,
    ExpenseItem, SavingsHistoryItem,
    HealthFactor, ActionItem, BudgetCategory, GoalMilestone,
    UnifiedAnalysisResponse, MetricsSummary, ChartsSummary
)
from ai_advisor import (
    generate_financial_advice, generate_goal_plan,
    finance_chatbot_response, generate_portfolio,
    GEMINI_AVAILABLE as AI_GEMINI_AVAILABLE,
)

app = FastAPI(
    title="AI Financial Advisor API",
    description="AI Wealth Copilot — deterministic financial engines + Gemini AI",
    version="4.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://finai-advisor.vercel.app", # Example Vercel prod URL
        "*" # Keep for now to avoid blockers, adjust in final report
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    create_tables()
    print("✅ FinAI database tables initialized (SQLite: finai.db)")


# ── GET / ──────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "FinAI Wealth Copilot API v4.0 🚀",
        "version": "4.0",
        "gemini_available": AI_GEMINI_AVAILABLE,
        "model": GEMINI_MODEL if AI_GEMINI_AVAILABLE else "rule-based",
        "services": {
            "financial_engine": "deterministic",
            "portfolio_engine": "deterministic",
            "forecast_engine": "deterministic (SIP FV formula)",
            "budget_engine": "deterministic (Indian 8-category benchmarks)",
            "goal_engine": "deterministic (PMT + feasibility)",
            "retirement_engine": "deterministic (4% SWR + inflation-adjust)",
            "decision_engine": "rule-based (priority sorted actions)",
            "ai_explanation": "Gemini 2.0 Flash" if AI_GEMINI_AVAILABLE else "rule-based fallback",
            "database": "SQLite (upgrade to PostgreSQL via DATABASE_URL env)",
        },
        "endpoints": [
            "/analyze-finances", "/ai-advice", "/portfolio",
            "/goal-plan", "/forecast", "/budget-analysis", "/chat",
            "/simulate", "/tax-analysis", "/financial-report",
            "/retirement", "/decisions",
        ],
    }


# ── POST /analyze-finances ─────────────────────────────────────────────────────
@app.post("/analyze-finances", response_model=UnifiedAnalysisResponse)
async def analyze_finances(data: FinancialInput):
    """Refactored v5.0 — Metrics, Actions, Charts (Three-tier response)."""
    # 1. Base Metrics
    monthly_savings = svc_savings_amt(data.monthly_income, data.monthly_expenses)
    
    # 2. Health Analysis
    health_data = svc_health(
        monthly_income=data.monthly_income,
        monthly_savings=monthly_savings,
        annual_debt=data.total_debt,
        emergency_fund=data.emergency_fund,
        monthly_expenses=data.monthly_expenses,
    )
    
    # 3. Chart Data Generation
    summary_charts  = svc_summary_charts(data.monthly_income, data.monthly_expenses)
    budget_charts   = svc_budget_charts(data.monthly_expenses, None)
    forecast_charts = svc_forecast_charts(monthly_savings, data.emergency_fund)
    goal_charts     = svc_goal_charts("General Savings", 1000000, data.emergency_fund, monthly_savings)
    
    # 4. Action Center
    raw_actions = svc_decisions(
        monthly_income=data.monthly_income,
        monthly_savings=monthly_savings,
        monthly_expenses=data.monthly_expenses,
        total_debt=data.total_debt,
        emergency_fund=data.emergency_fund,
        health_score=health_data["health_score"],
        risk_profile=data.risk_profile,
    )
    
    actions = [ActionItem(
        title=a["title"],
        description=a["description"],
        priority=a["priority"].upper(), # Normalize to uppercase
        impact=a["impact"],
        icon=a["icon"]
    ) for a in raw_actions]

    # 5. Budget Benchmarks
    budget = svc_budget(data.monthly_expenses)

    return UnifiedAnalysisResponse(
        metrics=MetricsSummary(
            monthly_income=data.monthly_income,
            monthly_expenses=data.monthly_expenses,
            monthly_savings=monthly_savings,
            total_debt=data.total_debt,
            emergency_fund=data.emergency_fund,
            health_score=health_data["health_score"],
            savings_ratio=round(health_data["savings_detail"]["ratio"] * 100, 1),
            debt_to_income_ratio=round(health_data["debt_detail"]["ratio"] * 100, 1),
            emergency_fund_months=health_data["emergency_detail"]["months"],
            health_label=health_data["health_label"],
            health_color=health_data["health_color"]
        ),
        actions=actions,
        charts=ChartsSummary(
            summary=summary_charts["income_expense_split"],
            budget=budget_charts["expense_breakdown"],
            forecast=forecast_charts["savings_projection"],
            goals=goal_charts["goal_milestones"]
        ),
        health_breakdown=[HealthFactor(
            factor=f["factor"],
            score=f["score"],
            label=f["label"],
            color=f["color"],
            detail=f["message"], # Map message to detail
            weight=f["weight"]
        ) for f in health_data["breakdown"]],
        budget_analysis=[BudgetCategory(
            category=b["category"],
            amount=b["amount"],
            color=b["color"],
            percentage=b["percentage"],
            recommended_pct=b["recommended_pct"],
            status="over" if b["status"] == "over" else "optimal" if b["status"] == "ok" else "under",
            suggestion=b["tip"]
        ) for b in budget]
    )


# ── POST /ai-advice ────────────────────────────────────────────────────────────
@app.post("/ai-advice", response_model=list[AIAdviceItem])
async def get_ai_advice(data: FinancialInput):
    """5 risk-profile-aware personalized AI recommendations."""
    monthly_savings = svc_savings_amt(data.monthly_income, data.monthly_expenses)
    health_data = svc_health(
        monthly_income=data.monthly_income,
        monthly_savings=monthly_savings,
        annual_debt=data.total_debt,
        emergency_fund=data.emergency_fund,
        monthly_expenses=data.monthly_expenses,
    )
    
    items = generate_financial_advice(
        monthly_income=data.monthly_income,
        monthly_expenses=data.monthly_expenses,
        total_debt=data.total_debt,
        savings_ratio=health_data["savings_detail"]["ratio"],
        financial_health_score=health_data["health_score"],
        risk_profile=data.risk_profile,
        emergency_fund=data.emergency_fund,
    )
    return [AIAdviceItem(
        category=i.get("category", "General"),
        title=i.get("title", ""),
        description=i.get("description", ""),
        priority=i.get("priority", "medium"),
        icon=i.get("icon", "💡"),
        action_steps=i.get("action_steps", []),
    ) for i in items]


# ── POST /portfolio ────────────────────────────────────────────────────────────
@app.post("/portfolio", response_model=PortfolioResponse)
async def get_portfolio(data: PortfolioRequest):
    """AI-generated asset allocation based on risk profile."""
    plan = generate_portfolio(
        risk_profile=data.risk_profile,
        monthly_investable=data.monthly_investable,
        total_invested=data.total_invested,
        horizon_years=data.horizon_years,
    )
    return PortfolioResponse(
        risk_profile=plan["risk_profile"],
        allocations=[AllocationSlice(**a) for a in plan["allocations"]],
        expected_annual_return=plan["expected_annual_return"],
        expected_10yr_value=plan["expected_10yr_value"],
        monthly_investable=plan["monthly_investable"],
        rebalance_note=plan["rebalance_note"],
    )


# ── POST /forecast ─────────────────────────────────────────────────────────────
@app.post("/forecast", response_model=NetWorthForecastResponse)
async def get_forecast(data: ForecastRequest):
    """10-year net worth projection chart data."""
    fc = svc_forecast(
        monthly_savings=data.monthly_savings,
        existing_corpus=data.existing_investments,
        risk_profile=data.risk_profile,
        income_growth_rate=data.income_growth_pct,
        years=10,
    )
    final = fc[-1]["net_worth"] if fc else 0
    start = fc[0]["net_worth"] if fc else 1
    cagr = round(((final / start) ** (1 / 10) - 1) * 100, 1) if start > 0 else 0
    
    # Return rates for assumptions
    return_rates = {"conservative": 9.0, "moderate": 12.0, "aggressive": 15.0}
    
    return NetWorthForecastResponse(
        risk_profile=data.risk_profile,
        forecast=[ForecastDataPoint(
            year=p["year"],
            label=p["label"],
            savings=p["liquid_savings"],
            investments=p["corpus"],
            net_worth=p["net_worth"]
        ) for p in fc],
        final_net_worth=final,
        cagr=cagr,
        assumptions={
            "annual_return": return_rates.get(data.risk_profile, 12.0),
            "income_growth": data.income_growth_pct,
            "savings_invested_pct": 70, # assuming 70% in corpus, 30% liquid as per forecast_engine
        },
    )


# ── POST /budget-analysis ──────────────────────────────────────────────────────
@app.post("/budget-analysis", response_model=list[BudgetCategory])
async def get_budget_analysis(data: FinancialInput):
    """Detect overspending patterns across expense categories."""
    result = svc_budget(data.monthly_expenses)
    return [BudgetCategory(
        category=b["category"],
        amount=b["amount"],
        color=b["color"],
        percentage=b["percentage"],
        recommended_pct=b["recommended_pct"],
        status="over" if b["status"] == "over" else "optimal" if b["status"] == "ok" else "under",
        suggestion=b["tip"]
    ) for b in result]


# ── POST /goal-plan ────────────────────────────────────────────────────────────
@app.post("/goal-plan", response_model=GoalPlanResponse)
async def create_goal_plan(data: GoalPlanRequest):
    """AI goal strategy with milestones and feasibility."""
    plan = svc_goal(
        goal_name=data.goal_name,
        target_amount=data.target_amount,
        current_savings=data.current_amount,
        monthly_savings_available=data.monthly_savings or 0.0,
        timeline_months=data.timeline_months,
    )
    return GoalPlanResponse(
        goal_name=plan["goal_name"],
        target_amount=plan["target_amount"],
        current_amount=plan["current_savings"],
        gap=plan["gap"],
        monthly_required=plan["monthly_required"],
        timeline_months=plan["timeline_months"],
        feasibility=plan["feasibility"],
        strategy=plan["strategy"],
        milestones=[GoalMilestone(
            month=m["months_elapsed"],
            label=m["period"],
            accumulated=m["accumulated"],
            percentage=m["percentage"]
        ) for m in plan["milestones"]],
    )


# ── POST /chat ─────────────────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Context-aware financial chatbot with personalized responses."""
    result = finance_chatbot_response(
        user_question=request.message,
        history=request.history,
        financial_context=request.financial_context,
    )
    return ChatResponse(response=result["response"], suggestions=result.get("suggestions", []))


# ── POST /simulate ─────────────────────────────────────────────────────────────
class SimulateRequest(BaseModel):
    monthly_investment: float
    income_growth_rate: float = 8.0
    expense_reduction: float = 0.0
    investment_return_rate: float = 12.0
    years: int = 10
    current_savings: float = 0.0
    existing_investments: float = 0.0
    compare: bool = False
    risk_profile: str = "moderate"
    inflation_rate: float = 6.0

@app.post("/simulate")
async def simulate(req: SimulateRequest):
    """What-If scenario simulator — compound interest projections."""
    if req.compare:
        return {
            "conservative": svc_simulate(
                monthly_investment=req.monthly_investment,
                income_growth_rate=req.income_growth_rate,
                expense_reduction=req.expense_reduction,
                investment_return_rate=9.0, # Conservative
                years=req.years,
                current_savings=req.current_savings,
                existing_investments=req.existing_investments,
                inflation_rate=req.inflation_rate,
            ),
            "moderate": svc_simulate(
                monthly_investment=req.monthly_investment,
                income_growth_rate=req.income_growth_rate,
                expense_reduction=req.expense_reduction,
                investment_return_rate=12.0, # Moderate
                years=req.years,
                current_savings=req.current_savings,
                existing_investments=req.existing_investments,
                inflation_rate=req.inflation_rate,
            ),
            "aggressive": svc_simulate(
                monthly_investment=req.monthly_investment,
                income_growth_rate=req.income_growth_rate,
                expense_reduction=req.expense_reduction,
                investment_return_rate=15.0, # Aggressive
                years=req.years,
                current_savings=req.current_savings,
                existing_investments=req.existing_investments,
                inflation_rate=req.inflation_rate,
            )
        }
    else:
        return {
            "scenario": svc_simulate(
                monthly_investment=req.monthly_investment,
                income_growth_rate=req.income_growth_rate,
                expense_reduction=req.expense_reduction,
                investment_return_rate=req.investment_return_rate,
                years=req.years,
                current_savings=req.current_savings,
                existing_investments=req.existing_investments,
                inflation_rate=req.inflation_rate,
            )
        }


# ── POST /tax-analysis ─────────────────────────────────────────────────────────
class TaxRequest(BaseModel):
    monthly_income: float
    existing_80c: float = 0.0
    has_nps: bool = False
    has_health_insurance: bool = False
    has_parents_insurance: bool = False
    hra_eligible: bool = True

@app.post("/tax-analysis")
async def tax_analysis(req: TaxRequest):
    """Indian tax optimization engine — 80C, NPS, 80D, HRA."""
    return tax_optimization_analysis(
        monthly_income=req.monthly_income,
        existing_80c=req.existing_80c,
        has_nps=req.has_nps,
        has_health_insurance=req.has_health_insurance,
        has_parents_health_insurance=req.has_parents_insurance,
        hra_eligible=req.hra_eligible,
    )


# ── POST /financial-report ─────────────────────────────────────────────────────
class ReportRequest(BaseModel):
    monthly_income: float
    monthly_expenses: float
    total_debt: float = 0.0
    emergency_fund: float = 0.0
    risk_profile: str = "moderate"
    age: int = 30
    name: str = "User"

@app.post("/financial-report")
async def financial_report(req: ReportRequest):
    """Full AI financial strategy report — 6 structured sections."""
    return generate_financial_report(
        monthly_income=req.monthly_income,
        monthly_expenses=req.monthly_expenses,
        total_debt=req.total_debt,
        emergency_fund=req.emergency_fund,
        risk_profile=req.risk_profile,
        age=req.age,
        name=req.name,
    )


# ── POST /retirement ───────────────────────────────────────────────────────────
class RetirementRequest(BaseModel):
    age: int = 30
    retirement_age: int = 60
    monthly_expenses: float
    current_savings: float = 0.0
    monthly_investment: float = 0.0
    expected_return: float = 12.0
    inflation_rate: float = 6.0
    life_expectancy: int = 85

@app.post("/retirement")
async def retirement(req: RetirementRequest):
    """Retirement corpus planning — 4% SWR + inflation-adjusted expenses + feasibility."""
    return svc_retirement(
        age=req.age,
        retirement_age=req.retirement_age,
        monthly_expenses=req.monthly_expenses,
        current_savings=req.current_savings,
        monthly_investment=req.monthly_investment,
        expected_return=req.expected_return,
        inflation_rate=req.inflation_rate,
        life_expectancy=req.life_expectancy,
    )


# ── POST /decisions ─────────────────────────────────────────────────────────────
class DecisionRequest(BaseModel):
    monthly_income: float
    monthly_savings: float
    monthly_expenses: float
    total_debt: float = 0.0
    emergency_fund: float = 0.0
    health_score: int = 50
    risk_profile: str = "moderate"

@app.post("/decisions")
async def decisions(req: DecisionRequest):
    """Rule-based priority-sorted financial action recommendations."""
    return {
        "actions": svc_decisions(
            monthly_income=req.monthly_income,
            monthly_savings=req.monthly_savings,
            monthly_expenses=req.monthly_expenses,
            total_debt=req.total_debt,
            emergency_fund=req.emergency_fund,
            health_score=req.health_score,
            risk_profile=req.risk_profile,
        )
    }


# ── POST /health-score ── (services/ powered) ───────────────────────────────────
class HealthScoreRequest(BaseModel):
    monthly_income: float
    monthly_savings: float
    total_debt: float = 0.0
    emergency_fund: float = 0.0
    monthly_expenses: float

@app.post("/health-score")
async def health_score_detailed(req: HealthScoreRequest):
    """Detailed health score with factor breakdown from services/financial_engine."""
    return svc_health(
        monthly_income=req.monthly_income,
        monthly_savings=req.monthly_savings,
        annual_debt=req.total_debt,
        emergency_fund=req.emergency_fund,
        monthly_expenses=req.monthly_expenses,
    )

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
