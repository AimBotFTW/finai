"""
FinAI Financial Intelligence Engine — services package.

Provides deterministic, formula-based financial analysis engines.
All calculations use real financial formulas; AI (Gemini) is only used for
generating natural-language explanations of computed results.
"""

from .financial_engine import (
    calculate_savings_ratio, calculate_debt_to_income_ratio,
    calculate_emergency_fund_months, calculate_financial_health_score,
)
from .portfolio_engine import get_portfolio_allocation
from .forecast_engine import project_net_worth
from .budget_engine import analyze_budget
from .goal_engine import calculate_goal_plan
from .retirement_engine import calculate_retirement_plan
from .decision_engine import generate_decisions

__all__ = [
    "calculate_savings_ratio", "calculate_debt_to_income_ratio",
    "calculate_emergency_fund_months", "calculate_financial_health_score",
    "get_portfolio_allocation", "project_net_worth",
    "analyze_budget", "calculate_goal_plan",
    "calculate_retirement_plan", "generate_decisions",
]
