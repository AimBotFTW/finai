"""
Goal Planning Engine — Monthly savings requirement + feasibility analysis.
"""
import math


def calculate_goal_plan(
    goal_name: str,
    target_amount: float,
    current_savings: float,
    monthly_savings_available: float,
    timeline_months: int | None = None,
    expected_return: float = 10.0,
) -> dict:
    """
    Calculate whether a financial goal is feasible and when it can be achieved.

    Formula (with investment returns):
        If using SIP-style accumulation with return r = expected_return/12 per month:
        FV = PMT × ((1+r)^n − 1) / r  →  solve for PMT or n

    Feasibility:
        monthly_required ≤ current_surplus           → Achievable
        monthly_required ≤ current_surplus × 1.50    → Stretch
        monthly_required >  current_surplus × 1.50   → Not Feasible
    """
    gap = max(target_amount - current_savings, 0)
    r = (expected_return / 100) / 12  # monthly rate

    if timeline_months is None or timeline_months <= 0:
        # Default: 5-year horizon
        timeline_months = 60

    # SIP required to meet gap: PMT = FV × r / ((1+r)^n − 1)
    if r > 0:
        monthly_required = round(gap * r / ((1 + r) ** timeline_months - 1))
    else:
        monthly_required = round(gap / max(timeline_months, 1))

    # Feasibility
    if monthly_required <= monthly_savings_available:
        feasibility, feasibility_color = "Achievable", "#10B981"
        feasibility_msg = (
            f"You can meet this goal by investing ₹{monthly_required:,}/month for {timeline_months} months. "
            f"Only {round(monthly_required / monthly_savings_available * 100)}% of your monthly surplus."
        )
    elif monthly_required <= monthly_savings_available * 1.5:
        feasibility, feasibility_color = "Stretch", "#F59E0B"
        feasibility_msg = (
            f"Achievable with extra effort. You need ₹{monthly_required:,}/month vs "
            f"available ₹{monthly_savings_available:,}. "
            f"Reduce one expense category to bridge the ₹{monthly_required - monthly_savings_available:,}/month gap."
        )
    else:
        feasibility, feasibility_color = "Not Feasible", "#EF4444"
        # Calculate feasible timeline instead
        feasible_months = _months_needed(gap, monthly_savings_available, r)
        feasibility_msg = (
            f"Not achievable in {timeline_months} months at current savings. "
            f"Either invest ₹{monthly_required:,}/month or extend timeline to {feasible_months} months."
        )
        timeline_months = feasible_months or timeline_months

    # Quarterly milestones
    milestones = _quarterly_milestones(gap, monthly_required, timeline_months, target_amount, current_savings, r)

    return {
        "goal_name":       goal_name,
        "target_amount":   target_amount,
        "current_savings": current_savings,
        "gap":             gap,
        "monthly_required":   monthly_required,
        "timeline_months": timeline_months,
        "expected_return": expected_return,
        "feasibility":     feasibility,
        "feasibility_color": feasibility_color,
        "feasibility_message": feasibility_msg,
        "milestones":      milestones,
        "strategy": (
            f"Start a ₹{monthly_required:,}/month SIP in a {_fund_type(expected_return)} for {timeline_months} months "
            f"to accumulate ₹{target_amount:,} for '{goal_name}'."
        ),
    }


def _months_needed(gap: float, monthly_pmt: float, r: float) -> int:
    """Solve n: PMT × ((1+r)^n − 1) / r = FV → n = log(1 + FV×r/PMT) / log(1+r)"""
    if monthly_pmt <= 0:
        return 999
    if r > 0:
        ratio = 1 + gap * r / monthly_pmt
        if ratio <= 0:
            return 999
        n = math.log(ratio) / math.log(1 + r)
    else:
        n = gap / monthly_pmt
    return max(round(n), 1)


def _quarterly_milestones(gap, monthly_required, n_months, target, current, r):
    milestones = []
    for quarter in range(1, min(n_months // 3 + 1, 9)):  # max 8 quartiles
        months = quarter * 3
        if r > 0:
            corpus = monthly_required * ((1 + r) ** months - 1) / r
        else:
            corpus = monthly_required * months
        accumulated = round(current + corpus)
        pct = round(min(accumulated / target * 100, 100))
        milestones.append({
            "period": f"Q{quarter} (Month {months})",
            "months_elapsed": months,
            "accumulated": accumulated,
            "percentage": pct,
        })
    return milestones


def _fund_type(return_pct: float) -> str:
    if return_pct >= 13:
        return "equity/mid-cap fund"
    elif return_pct >= 9:
        return "balanced/hybrid fund"
    else:
        return "liquid/short-term debt fund"


def get_goal_charts(
    goal_name: str,
    target_amount: float,
    current_savings: float,
    monthly_savings_available: float,
    timeline_months: int = 60
) -> dict:
    """
    Returns data for goal progress milestones.
    """
    plan = calculate_goal_plan(
        goal_name, target_amount, current_savings,
        monthly_savings_available, timeline_months
    )
    return {"goal_milestones": plan.get("milestones", [])}
