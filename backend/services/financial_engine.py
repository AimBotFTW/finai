"""
Financial Engine — Core deterministic financial calculations.
Uses real financial formulas; no AI/ML dependencies.
"""


# ── Savings Amount ─────────────────────────────────────────────────────────────

def calculate_savings_amount(income: float, expenses: float) -> float:
    """Calculate absolute monthly savings."""
    return max(income - expenses, 0.0)


# ── Savings Ratio ─────────────────────────────────────────────────────────────

def calculate_savings_ratio(income: float, savings: float) -> dict:
    """
    savings_ratio = savings / income

    Scoring:
        ≥ 30%  → score 90  (Excellent)
        20–30% → score 70  (Good)
        10–20% → score 50  (Average)
        < 10%  → score 25  (Poor)
    """
    if income <= 0:
        return {"ratio": 0.0, "percentage": 0.0, "score": 25, "label": "Poor",
                "message": "Income data not available."}

    ratio = min(savings / income, 1.0)
    pct = round(ratio * 100, 1)

    if ratio >= 0.30:
        score, label = 90, "Excellent"
        msg = f"You save {pct}% of income — top tier. Keep compounding."
    elif ratio >= 0.20:
        score, label = 70, "Good"
        msg = f"Saving {pct}% of income. Increasing to 30% would significantly accelerate wealth."
    elif ratio >= 0.10:
        score, label = 50, "Average"
        msg = f"Saving {pct}% of income. Target 20%+ by reducing discretionary spending."
    else:
        score, label = 25, "Poor"
        msg = f"Saving only {pct}% of income. Urgent: cut expenses or increase income."

    return {"ratio": round(ratio, 4), "percentage": pct, "score": score, "label": label, "message": msg}


# ── Debt-to-Income Ratio ──────────────────────────────────────────────────────

def calculate_debt_to_income_ratio(annual_debt: float, monthly_income: float) -> dict:
    """
    dti = annual_debt / annual_income

    Scoring (mirrors US CFPB + India NHB guidelines):
        < 20%  → Excellent (score 90)
        20–28% → Good      (score 75)
        28–35% → Moderate  (score 55)
        > 35%  → Risky     (score 20)
    """
    annual_income = monthly_income * 12
    if annual_income <= 0:
        return {"ratio": 0.0, "percentage": 0.0, "score": 50, "label": "Unknown",
                "message": "Income data unavailable."}

    ratio = min(annual_debt / annual_income, 2.0)
    pct = round(ratio * 100, 1)

    if ratio < 0.20:
        score, label = 90, "Excellent"
        msg = f"DTI at {pct}% — excellent. Well within safe borrowing limits."
    elif ratio < 0.28:
        score, label = 75, "Good"
        msg = f"DTI at {pct}% — manageable. Avoid adding new long-term debt."
    elif ratio < 0.35:
        score, label = 55, "Moderate"
        msg = f"DTI at {pct}% — approaching risky territory. Prioritize debt payoff."
    else:
        score, label = 20, "Risky"
        msg = f"DTI at {pct}% — dangerously high. Stop new borrowing; aggressively repay debt."

    return {"ratio": round(ratio, 4), "percentage": pct, "score": score, "label": label, "message": msg}


# ── Emergency Fund Coverage ───────────────────────────────────────────────────

def calculate_emergency_fund_months(emergency_fund: float, monthly_expenses: float) -> dict:
    """
    months = emergency_fund / monthly_expenses

    Scoring:
        ≥ 6 months → Ideal   (score 100)
        3–6 months → OK      (score 60)
        1–3 months → Low     (score 30)
        < 1 month  → Risky   (score 10)
    """
    if monthly_expenses <= 0:
        return {"months": 0.0, "score": 50, "label": "Unknown",
                "target_amount": 0, "gap": 0, "message": "Expense data unavailable."}

    months = emergency_fund / monthly_expenses
    target = round(monthly_expenses * 6)
    gap = max(target - emergency_fund, 0)

    if months >= 6:
        score, label = 100, "Ideal"
        msg = f"Emergency fund covers {months:.1f} months — you're fully protected."
    elif months >= 3:
        score, label = 60, "Adequate"
        msg = f"Covers {months:.1f} months. Top up by ₹{gap:,} to reach the 6-month target."
    elif months >= 1:
        score, label = 30, "Low"
        msg = f"Only {months:.1f} months covered. Increase by ₹{gap:,} urgently."
    else:
        score, label = 10, "Critical"
        msg = f"Emergency fund critically low ({months:.1f} months). Park ₹{round(monthly_expenses * 6 / 12 / 500) * 500:,}/month in liquid fund immediately."

    return {
        "months": round(months, 2), "score": score, "label": label,
        "target_amount": target, "gap": gap, "message": msg,
    }


# ── Composite Financial Health Score ─────────────────────────────────────────

def calculate_financial_health_score(
    monthly_income: float,
    monthly_savings: float,
    annual_debt: float,
    emergency_fund: float,
    monthly_expenses: float,
) -> dict:
    """
    Weighted composite score:

        health_score = (savings_score × 0.40) +
                       (debt_score × 0.30) +
                       (emergency_score × 0.30)

    Returns full breakdown with per-factor details.
    """
    savings_result = calculate_savings_ratio(monthly_income, monthly_savings)
    debt_result    = calculate_debt_to_income_ratio(annual_debt, monthly_income)
    ef_result      = calculate_emergency_fund_months(emergency_fund, monthly_expenses)

    raw = (
        savings_result["score"] * 0.40 +
        debt_result["score"]    * 0.30 +
        ef_result["score"]      * 0.30
    )
    health_score = min(round(raw), 100)

    if health_score >= 80:
        label, color = "Excellent", "#10B981"
    elif health_score >= 65:
        label, color = "Good",      "#22D3EE"
    elif health_score >= 45:
        label, color = "Average",   "#F59E0B"
    else:
        label, color = "Poor",      "#EF4444"

    return {
        "health_score": health_score,
        "health_label": label,
        "health_color": color,
        "breakdown": [
            {
                "factor": "Savings Rate",
                "score": savings_result["score"],
                "label": savings_result["label"],
                "percentage": savings_result["percentage"],
                "message": savings_result["message"],
                "weight": 40,
                "color": "#10B981" if savings_result["score"] >= 70 else "#F59E0B" if savings_result["score"] >= 50 else "#EF4444",
            },
            {
                "factor": "Debt Ratio",
                "score": debt_result["score"],
                "label": debt_result["label"],
                "percentage": debt_result["percentage"],
                "message": debt_result["message"],
                "weight": 30,
                "color": "#10B981" if debt_result["score"] >= 70 else "#F59E0B" if debt_result["score"] >= 50 else "#EF4444",
            },
            {
                "factor": "Emergency Fund",
                "score": ef_result["score"],
                "label": ef_result["label"],
                "months": ef_result["months"],
                "message": ef_result["message"],
                "weight": 30,
                "color": "#10B981" if ef_result["score"] >= 70 else "#F59E0B" if ef_result["score"] >= 30 else "#EF4444",
            },
        ],
        "savings_detail":   savings_result,
        "debt_detail":      debt_result,
        "emergency_detail": ef_result,
    }


def get_summary_charts(monthly_income: float, monthly_expenses: float) -> dict:
    """
    Returns data for the Income vs Expenses donut chart.
    Replaces visualization.py:income_expense_split.
    """
    savings = calculate_savings_amount(monthly_income, monthly_expenses)
    savings_rate = round((savings / monthly_income) * 100, 1) if monthly_income > 0 else 0

    return {
        "income_expense_split": {
            "total": monthly_income,
            "segments": [
                {"name": "Savings",  "value": round(savings),          "color": "#10B981"},
                {"name": "Expenses", "value": round(monthly_expenses), "color": "#EF4444"},
            ],
            "savings_rate": savings_rate,
        }
    }
