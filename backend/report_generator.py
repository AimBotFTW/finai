"""
report_generator.py — Full AI Financial Strategy Report (multi-section).
Uses Gemini when available, structured rule-based fallback otherwise.
"""
from config import GEMINI_API_KEY, GEMINI_MODEL
from services.financial_engine import calculate_financial_health_score as svc_health
from services.budget_engine import analyze_budget as svc_budget
from services.forecast_engine import project_net_worth as svc_forecast

GEMINI_AVAILABLE = False
gemini_model = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel(GEMINI_MODEL)
        GEMINI_AVAILABLE = True
    except Exception:
        pass


def generate_financial_report(
    monthly_income: float,
    monthly_expenses: float,
    total_debt: float,
    emergency_fund: float,
    risk_profile: str = "moderate",
    age: int = 30,
    name: str = "User",
) -> dict:
    monthly_savings = max(monthly_income - monthly_expenses, 0)
    
    # New deterministic health analysis
    health_data = svc_health(
        monthly_income=monthly_income,
        monthly_savings=monthly_savings,
        annual_debt=total_debt,
        emergency_fund=emergency_fund,
        monthly_expenses=monthly_expenses
    )
    
    health = health_data["health_score"]
    label = health_data["health_label"]
    breakdown = health_data["breakdown"]
    
    savings_ratio = health_data["savings_detail"]["ratio"] * 100
    dti = health_data["debt_detail"]["ratio"] * 100
    ef_months = health_data["emergency_detail"]["months"]
    
    # New budget and forecast
    budget = svc_budget(monthly_expenses)
    forecast = svc_forecast(monthly_savings, 0, risk_profile, 8.0, 10)

    over_budget = [c for c in budget if c["status"] == "over"]
    final_nw = forecast[-1]["net_worth"] if forecast else 0

    RISK_RETURNS = {"conservative": "8–10%", "moderate": "10–13%", "aggressive": "13–17%"}
    expected_ret = RISK_RETURNS.get(risk_profile, "10–13%")

    # ── Sections ───────────────────────────────────────────────────────────────
    health_section = {
        "title": "Financial Health Assessment",
        "score": health,
        "label": label,
        "summary": f"Your overall financial health score is {health}/100 ({label}). "
                   f"With a {savings_ratio:.0f}% savings rate and debt-to-income ratio of {dti:.1f}%, "
                   f"your finances are {label.lower()}-positioned. "
                   f"Your emergency fund covers {ef_months:.1f} months (target: 6).",
        "factors": breakdown,
    }

    budget_section = {
        "title": "Budget Optimization Summary",
        "monthly_expenses": monthly_expenses,
        "over_budget_count": len(over_budget),
        "potential_saving": sum(
            round(monthly_expenses * (c["percentage"] - c["recommended_pct"]) / 100)
            for c in over_budget
        ),
        "categories": budget,
        "summary": (
            f"{len(over_budget)} expense categories exceed recommended benchmarks. "
            + (f"Biggest opportunity: reduce {over_budget[0]['category']} from "
               f"{over_budget[0]['percentage']}% to {over_budget[0]['recommended_pct']}% "
               f"(save ₹{round(monthly_expenses * (over_budget[0]['percentage'] - over_budget[0]['recommended_pct']) / 100):,}/month)."
               if over_budget else "All categories within benchmarks.")
        ),
    }

    investment_section = {
        "title": "Recommended Investment Strategy",
        "risk_profile": risk_profile.title(),
        "expected_annual_return": expected_ret,
        "monthly_sip_recommended": round(monthly_savings * 0.60 / 500) * 500,
        "portfolio_split": {
            "conservative": [("Large Cap Index", 30), ("Debt Funds", 30), ("Gold", 15), ("Liquid", 15), ("Flexi Cap", 10)],
            "moderate":     [("Nifty 50 Index", 35), ("Flexi Cap", 25), ("Int'l ETF", 15), ("Gold", 10), ("Liquid/Debt", 15)],
            "aggressive":   [("Mid/Small Cap", 30), ("Nifty 50", 25), ("Int'l ETF", 20), ("Flexi Cap", 15), ("Gold/REITs", 10)],
        }.get(risk_profile, []),
        "summary": (
            f"As a {risk_profile} investor, start a ₹{round(monthly_savings * 0.60 / 500) * 500:,}/month SIP. "
            f"At {expected_ret} CAGR, your projected corpus over 10 years is ₹{final_nw / 100000:.1f}L. "
            f"Step up SIP by 10% each year to accelerate wealth creation."
        ),
    }

    goals_section = {
        "title": "Goal Feasibility Analysis",
        "current_monthly_surplus": monthly_savings,
        "recommended_goals": [
            {
                "goal": "6-Month Emergency Fund",
                "target": round(monthly_expenses * 6),
                "monthly_needed": round(max(monthly_expenses * 6 - emergency_fund, 0) / 12),
                "feasible": ef_months < 6,
                "priority": "high" if ef_months < 3 else "medium",
            },
            {
                "goal": "Retirement Corpus (2 Cr)",
                "target": 20000000,
                "monthly_needed": round(20000000 / (max(60 - age, 1) * 12)),
                "feasible": monthly_savings * 0.30 >= round(20000000 / (max(60 - age, 1) * 12)),
                "priority": "medium",
            },
            {
                "goal": "House Down Payment (₹30L)",
                "target": 3000000,
                "monthly_needed": round(3000000 / 60),  # 5-yr horizon
                "feasible": monthly_savings >= round(3000000 / 60),
                "priority": "medium",
            },
        ],
        "summary": f"With ₹{monthly_savings:,}/month surplus, your most urgent goal is building the emergency fund. "
                   f"Allocate funds across goals in order of timeline and priority.",
    }

    risk_section = {
        "title": "Risk Warnings",
        "warnings": _build_risk_warnings(monthly_income, monthly_savings, total_debt, emergency_fund, monthly_expenses, ef_months, dti),
    }

    wealth_section = {
        "title": "Wealth Projection",
        "years": 10,
        "projection": forecast,
        "final_net_worth": final_nw,
        "summary": (
            f"Based on your current savings of ₹{monthly_savings:,}/month and {risk_profile} risk profile, "
            f"your estimated net worth after 10 years is ₹{final_nw / 100000:.1f}L at {expected_ret} CAGR. "
            f"Increasing monthly SIP by ₹5,000 could add ₹{round(5000 * 12 * 10 * 1.5 / 100000):.0f}L more."
        ),
    }

    # Optional Gemini enhancement for executive summary
    executive_summary = _rule_executive_summary(name, health, label, savings_ratio, ef_months, risk_profile, final_nw)
    if GEMINI_AVAILABLE and gemini_model:
        try:
            prompt = f"""Write a warm, concise 3-sentence executive financial summary for {name}.
Key facts:
- Health score: {health}/100 ({label})
- Savings rate: {savings_ratio:.0f}%
- Emergency fund: {ef_months:.1f} months
- Risk profile: {risk_profile}
- 10-yr net worth projection: ₹{final_nw / 100000:.1f}L
Be specific, encouraging, and mention 1 key action to take immediately."""
            response = gemini_model.generate_content(prompt)
            executive_summary = response.text.strip()
        except Exception:
            pass

    return {
        "name": name,
        "generated_at": "March 2026",
        "executive_summary": executive_summary,
        "sections": [health_section, budget_section, investment_section, goals_section, risk_section, wealth_section],
    }


def _rule_executive_summary(name, health, label, savings_ratio, ef_months, risk_profile, final_nw):
    return (
        f"Hi {name}, your financial health score is {health}/100 ({label}) — you're saving {savings_ratio:.0f}% of your income, which is excellent. "
        f"However, your emergency fund covers only {ef_months:.1f} months (target: 6). "
        f"Focus on building this buffer, then increase your {risk_profile} SIP investment to reach your ₹{final_nw / 100000:.0f}L 10-year wealth goal."
    )


def _build_risk_warnings(monthly_income, monthly_savings, total_debt, emergency_fund, monthly_expenses, ef_months, dti):
    warnings = []
    if ef_months < 3:
        warnings.append({"level": "high", "icon": "🔴", "message": f"Emergency fund critical: only {ef_months:.1f} months covered. Target = 6 months (₹{monthly_expenses * 6:,.0f})."})
    elif ef_months < 6:
        warnings.append({"level": "medium", "icon": "🟡", "message": f"Emergency fund at {ef_months:.1f} months. Need ₹{max(monthly_expenses * 6 - emergency_fund, 0):,.0f} more to reach 6-month target."})
    if dti > 36:
        warnings.append({"level": "high", "icon": "🔴", "message": f"High debt exposure: DTI at {dti:.1f}% (safe limit <28%). Prioritize debt reduction."})
    elif dti > 20:
        warnings.append({"level": "medium", "icon": "🟡", "message": f"Debt-to-income at {dti:.1f}%. Manageable, but avoid taking new loans."})
    if monthly_savings / monthly_income < 0.10 if monthly_income > 0 else True:
        warnings.append({"level": "high", "icon": "🔴", "message": "Savings rate below 10%. Reduce expenses or increase income urgently."})
    if monthly_expenses / monthly_income > 0.80 if monthly_income > 0 else False:
        warnings.append({"level": "medium", "icon": "🟡", "message": f"Expense ratio at {monthly_expenses / monthly_income * 100:.0f}% of income. Target <65%."})
    if not warnings:
        warnings.append({"level": "low", "icon": "🟢", "message": "No critical risk alerts. Maintain discipline and review portfolio quarterly."})
    return warnings
