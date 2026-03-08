"""
Decision Engine — Rule-based priority-sorted financial action recommendations.
Translates computed financial metrics into concrete, ₹-specific actions.
"""

# Priority weights — lower number = higher importance
PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}


def generate_decisions(
    monthly_income: float,
    monthly_savings: float,
    monthly_expenses: float,
    total_debt: float,
    emergency_fund: float,
    health_score: int = 50,
    risk_profile: str = "moderate",
) -> list[dict]:
    """
    Generate up to 8 prioritized action items from financial metrics.
    Each action has: priority, icon, title, description, impact, category.
    """
    actions: list[dict] = []
    savings_rate = (monthly_savings / monthly_income) if monthly_income > 0 else 0
    dti = (total_debt / (monthly_income * 12)) if monthly_income > 0 else 0
    ef_months = (emergency_fund / monthly_expenses) if monthly_expenses > 0 else 0
    sip_amount = round(monthly_savings * 0.60 / 500) * 500

    # ── High Priority Rules ───────────────────────────────────────────────────

    if ef_months < 3:
        target = round(monthly_expenses * 6)
        monthly_needed = round(max(target - emergency_fund, 0) / 12 / 500) * 500
        actions.append({
            "priority": "high", "category": "Emergency Fund", "icon": "🔴",
            "title": f"Build Emergency Fund to ₹{target / 100000:.1f}L",
            "description": f"Emergency fund covers only {ef_months:.1f} months. Park ₹{monthly_needed:,}/month in a liquid fund.",
            "impact": f"Protects against job loss, medical emergencies. ₹{target:,} target.",
            "action_amount": monthly_needed,
            "action_label": f"₹{monthly_needed:,}/month → Liquid Fund",
        })

    if savings_rate < 0.10:
        extra = round((monthly_income * 0.20 - monthly_savings) / 500) * 500
        actions.append({
            "priority": "high", "category": "Savings Rate", "icon": "🔴",
            "title": "Increase Savings Rate to 20%+",
            "description": f"You save {round(savings_rate * 100)}% of income. Cut one expense category to add ₹{extra:,}/month.",
            "impact": f"₹{extra * 12:,}/year additional savings = ₹{round(extra * 12 * 5 * 1.5 / 100000):.0f}L in 5 years.",
            "action_amount": extra,
            "action_label": f"Increase savings by ₹{extra:,}/month",
        })

    if dti > 0.35:
        debt_payment_extra = round(monthly_savings * 0.25 / 500) * 500
        actions.append({
            "priority": "high", "category": "Debt", "icon": "🔴",
            "title": "Reduce High Debt Load",
            "description": f"Debt-to-income at {round(dti * 100)}%. Pay ₹{debt_payment_extra:,} extra/month toward highest-rate debt (avalanche method).",
            "impact": f"Saves interest; frees ₹{debt_payment_extra * 12:,}/year for investing after payoff.",
            "action_amount": debt_payment_extra,
            "action_label": f"₹{debt_payment_extra:,}/month extra debt payment",
        })

    if health_score < 45:
        actions.append({
            "priority": "high", "category": "Overall", "icon": "🔴",
            "title": "Financial Health Intervention Needed",
            "description": "Health score below 45. Focus on emergency fund first, then savings rate improvement.",
            "impact": "Bringing score above 60 takes 3–6 months of disciplined budgeting.",
            "action_amount": 0,
            "action_label": "Follow action plan above",
        })

    # ── Medium Priority Rules ─────────────────────────────────────────────────

    if 3 <= ef_months < 6:
        gap = round(max(monthly_expenses * 6 - emergency_fund, 0))
        monthly_topup = round(gap / 6 / 500) * 500
        actions.append({
            "priority": "medium", "category": "Emergency Fund", "icon": "🟡",
            "title": f"Top Up Emergency Fund (+₹{gap / 1000:.0f}K)",
            "description": f"Covers {ef_months:.1f} months. Need ₹{gap:,} more for full 6-month cushion.",
            "impact": f"Add ₹{monthly_topup:,}/month for 6 months to complete.",
            "action_amount": monthly_topup,
            "action_label": f"₹{monthly_topup:,}/month for 6 months",
        })

    if sip_amount > 0 and savings_rate >= 0.20:
        step_up = round(sip_amount * 0.10 / 500) * 500
        actions.append({
            "priority": "medium", "category": "Investment", "icon": "🟡",
            "title": f"Increase SIP by ₹{step_up:,} (10% Step-Up)",
            "description": f"Annual 10% SIP step-up doubles 10-year corpus vs flat SIP. Start with ₹{sip_amount + step_up:,}/month.",
            "impact": f"₹{step_up:,}/month extra → +₹{round(step_up * 12 * 10 * 1.8 / 100000):.0f}L additional corpus in 10 years.",
            "action_amount": step_up,
            "action_label": f"₹{sip_amount + step_up:,}/month SIP (step-up from ₹{sip_amount:,})",
        })

    if 0.20 <= dti <= 0.35:
        actions.append({
            "priority": "medium", "category": "Debt", "icon": "🟡",
            "title": "Avoid New Loans Until Debt Falls Below 20%",
            "description": f"DTI at {round(dti * 100)}%. Manageable, but new loans increase interest burden. Focus on debt payoff.",
            "impact": "Each ₹1,00,000 prepaid saves ₹14,000+ in interest over 5 years (10% rate).",
            "action_amount": 0,
            "action_label": "No new credit cards or personal loans for 12 months",
        })

    # Tax saving — check if underutilizing 80C
    annual_savings = monthly_savings * 12
    tax_gap = max(150000 - annual_savings * 0.5, 0)  # rough 80C utilization
    if tax_gap > 10000:
        tax_saved = round(tax_gap * 0.10)  # 10% slab saving estimate
        actions.append({
            "priority": "medium", "category": "Tax", "icon": "🟡",
            "title": f"Invest ₹{round(tax_gap / 1000):.0f}K More in 80C to Save ₹{tax_saved:,} Tax",
            "description": f"Utilize full ₹1.5L 80C limit via ELSS (3-yr lock-in) or PPF. Currently leaving ₹{round(tax_gap):,} unused.",
            "impact": f"Tax saving: ₹{tax_saved:,} this FY + market returns on ELSS.",
            "action_amount": round(tax_gap / 12),
            "action_label": f"₹{round(tax_gap / 12):,}/month ELSS SIP",
        })

    # ── Low Priority Rules ────────────────────────────────────────────────────

    if savings_rate >= 0.30:
        actions.append({
            "priority": "low", "category": "Insurance", "icon": "🟢",
            "title": "Review Life & Health Insurance Coverage",
            "description": "Ensure life cover = 10–15× annual income and health cover ≥ ₹10L (family floater).",
            "impact": "Protects your wealth-building plan against unexpected events.",
            "action_amount": 0,
            "action_label": "Annual insurance review",
        })

    if savings_rate >= 0.25 and risk_profile == "moderate":
        actions.append({
            "priority": "low", "category": "Portfolio", "icon": "🟢",
            "title": "Add International ETF Exposure",
            "description": "Allocate 10–15% of SIP to US/global ETF (NASDAQ, S&P 500) for currency and geo-diversification.",
            "impact": "Reduces India-specific risk. USD appreciation adds return during INR depreciation.",
            "action_amount": round(sip_amount * 0.15 / 500) * 500,
            "action_label": f"₹{round(sip_amount * 0.15 / 500) * 500:,}/month → Motilal Oswal Nasdaq 100 ETF",
        })

    # Sort by priority
    actions.sort(key=lambda a: PRIORITY_ORDER.get(a["priority"], 99))
    return actions[:8]  # return top 8 actions
