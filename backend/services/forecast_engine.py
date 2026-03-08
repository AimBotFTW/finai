"""
Forecast Engine — Compound growth net worth projections.
Uses standard financial math: FV of SIP + lump-sum growth.
"""
import math


CAGR_BY_PROFILE = {
    "conservative": 9.0,
    "moderate":     12.0,
    "aggressive":   15.0,
}


def project_net_worth(
    monthly_savings: float,
    existing_corpus: float,
    risk_profile: str = "moderate",
    income_growth_rate: float = 8.0,
    years: int = 10,
    expense_savings: float = 0.0,
) -> list[dict]:
    """
    Year-by-year net worth projection.

    SIP component:
        FV = PMT × ((1 + r)^n − 1) / r
        where r = annual_cagr / 12, n = months

    Lump-sum component:
        FV = PV × (1 + cagr)^t

    income_growth_rate: annual % increase in savings (step-up SIP)
    expense_savings: extra monthly savings from expense cuts (added to SIP)
    """
    cagr = CAGR_BY_PROFILE.get(risk_profile.lower(), 12.0) / 100
    r_monthly = cagr / 12
    income_g = income_growth_rate / 100

    sip = monthly_savings + expense_savings  # starting monthly investment
    corpus = float(existing_corpus)
    liquid_savings = 0.0
    projection = []

    for y in range(1, years + 1):
        # This year's monthly SIP (step-up by income growth)
        year_sip = sip * ((1 + income_g) ** (y - 1))

        # Grow existing corpus for 1 year
        corpus = corpus * (1 + cagr)

        # FV of this year's SIP contributions (intra-year monthly additions)
        year_contributions = year_sip * 12
        # approximate: treat as lump-sum at mid-year for simplicity
        corpus += year_contributions * (1 + cagr / 2)

        # Liquid savings pool (assumed 30% of savings kept outside market)
        liquid_savings += monthly_savings * 0.30 * 12

        net_worth = round(corpus + liquid_savings)

        projection.append({
            "year": y,
            "age_offset": y,
            "label": f"Yr {y}",
            "corpus": round(corpus),
            "liquid_savings": round(liquid_savings),
            "net_worth": net_worth,
            "formatted": _fmt(net_worth),
        })

    return projection


def simulate_scenario(
    monthly_investment: float,
    income_growth_rate: float,
    expense_reduction: float,
    investment_return_rate: float,
    years: int,
    current_savings: float = 0.0,
    existing_investments: float = 0.0,
    inflation_rate: float = 6.0,
) -> list[dict]:
    """
    Custom scenario simulation with user-provided parameters.
    Used by the What-If Simulator endpoint.
    """
    cagr = investment_return_rate / 100
    # Add real return calculation
    real_cagr = (1 + cagr) / (1 + (inflation_rate / 100)) - 1
    
    income_g = income_growth_rate / 100
    effective_monthly = monthly_investment + expense_reduction
    
    # Nominal variables
    corpus = float(existing_investments)
    liquid = float(current_savings)
    
    # Real variables (purchasing power)
    real_corpus = float(existing_investments)
    real_liquid = float(current_savings)
    
    results = []

    for y in range(1, years + 1):
        year_monthly = effective_monthly * ((1 + income_g) ** (y - 1))
        
        # Nominal growth
        corpus = corpus * (1 + cagr) + year_monthly * 12 * (1 + cagr / 2)
        liquid += year_monthly * 12 * 0.20
        nw = round(corpus + liquid)
        
        # Real growth (inflation adjusted)
        # Note: year_monthly is also in current terms, but we assume it grows with income_g.
        # However, for real net worth, we want the value in today's rupees.
        real_corpus = real_corpus * (1 + real_cagr) + (year_monthly / ((1 + (inflation_rate / 100)) ** y)) * 12 * (1 + real_cagr / 2)
        real_liquid += (year_monthly / ((1 + (inflation_rate / 100)) ** y)) * 12 * 0.20
        real_nw = round(real_corpus + real_liquid)
        
        results.append({
            "year": y, 
            "label": f"Yr {y}", 
            "corpus": round(corpus),
            "liquid_savings": round(liquid),
            "net_worth": nw,
            "real_net_worth": real_nw,
            "savings": round(liquid)
        })
    return results

def _fmt(v: float) -> str:
    return f"₹{v / 100_000:.1f}L"


# ── Forecast Charts ───────────────────────────────────────────────────────────

MONTH_LABELS = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]

def get_forecast_charts(monthly_savings: float, emergency_fund: float) -> dict:
    """
    Returns data for the savings performance chart (simulated history).
    Replaces visualization.py:savings_projection.
    """
    target = round(monthly_savings * 0.90)
    ef = emergency_fund * 0.60   # seed at ~60% of current for 6 months ago
    history = []
    for i, month in enumerate(MONTH_LABELS[:6]):
        # Gradually ramp up to current level
        factor = 0.65 + i * 0.07
        s = round(monthly_savings * factor)
        ef += s * 0.40
        history.append({
            "month":     month,
            "savings":   s,
            "target":    target,
            "emergency": round(ef),
        })
    return {"savings_projection": history}
