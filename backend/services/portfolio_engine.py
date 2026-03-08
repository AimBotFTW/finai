"""
Portfolio Engine — Rule-based asset allocation by risk profile.
Follows SEBI MF category guidelines and Indian market norms.
"""

PORTFOLIOS = {
    "conservative": {
        "description": "Capital preservation with moderate growth. Suited for age 50+ or risk-averse investors.",
        "expected_cagr_range": "8–10%",
        "expected_cagr": 9.0,
        "allocations": [
            {"asset": "Large Cap Index Fund",   "percentage": 30, "icon": "📈", "color": "#2563EB",
             "rationale": "Blue-chip stability with Nifty 50 exposure",
             "example_funds": ["Nippon India Index Fund – Nifty 50", "UTI Nifty 50 Index Fund"]},
            {"asset": "Debt / Bond Funds",       "percentage": 30, "icon": "🏦", "color": "#10B981",
             "rationale": "Fixed income for stability and regular interest",
             "example_funds": ["HDFC Short Term Debt Fund", "Axis Banking & PSU Debt Fund"]},
            {"asset": "Gold ETF",                "percentage": 15, "icon": "🥇", "color": "#F59E0B",
             "rationale": "Hedge against equity volatility and inflation",
             "example_funds": ["SBI Gold ETF", "Nippon India Gold BeES"]},
            {"asset": "Liquid Fund",             "percentage": 15, "icon": "💧", "color": "#0891B2",
             "rationale": "High-liquidity reserves for opportunities and emergencies",
             "example_funds": ["Parag Parikh Liquid Fund", "HDFC Liquid Fund"]},
            {"asset": "Flexi Cap Fund",          "percentage": 10, "icon": "🔄", "color": "#7C3AED",
             "rationale": "Dynamic allocation across market caps for modest growth",
             "example_funds": ["UTI Flexi Cap Fund", "DSP Flexi Cap Fund"]},
        ],
    },

    "moderate": {
        "description": "Balanced growth and stability. Suitable for 35–50 year olds with 5–10 year horizon.",
        "expected_cagr_range": "10–13%",
        "expected_cagr": 11.5,
        "allocations": [
            {"asset": "Nifty 50 Index Fund",     "percentage": 35, "icon": "📊", "color": "#2563EB",
             "rationale": "Core equity exposure to India's 50 largest companies",
             "example_funds": ["Mirae Asset Nifty 50 Index", "Motilal Oswal Nifty 50 Index"]},
            {"asset": "Flexi Cap Fund",           "percentage": 25, "icon": "🔄", "color": "#7C3AED",
             "rationale": "Dynamic allocation — fund manager picks best opportunities",
             "example_funds": ["Parag Parikh Flexi Cap", "Canara Robeco Flexi Cap"]},
            {"asset": "International ETF",        "percentage": 15, "icon": "🌍", "color": "#EC4899",
             "rationale": "Global diversification (US, Europe) to reduce India-specific risk",
             "example_funds": ["Mirae Asset NYSE FANG+", "Motilal Oswal Nasdaq 100 ETF"]},
            {"asset": "Gold ETF",                 "percentage": 10, "icon": "🥇", "color": "#F59E0B",
             "rationale": "Portfolio hedge, typically counter-cyclical to equity",
             "example_funds": ["Nippon India Gold BeES", "Axis Gold ETF"]},
            {"asset": "Liquid / Short-term Debt", "percentage": 15, "icon": "💧", "color": "#0891B2",
             "rationale": "Dry powder for rebalancing and short-term needs",
             "example_funds": ["Parag Parikh Liquid Fund", "Nippon India Liquid Fund"]},
        ],
    },

    "aggressive": {
        "description": "Maximum long-term growth. Best for investors under 35 with 10+ year horizon.",
        "expected_cagr_range": "13–17%",
        "expected_cagr": 15.0,
        "allocations": [
            {"asset": "Mid & Small Cap Fund",    "percentage": 30, "icon": "🚀", "color": "#7C3AED",
             "rationale": "High-growth segment — historically 3–5% above large cap over 10 years",
             "example_funds": ["Nippon India Small Cap", "Quant Mid Cap Fund"]},
            {"asset": "Nifty 50 Index Fund",     "percentage": 25, "icon": "📊", "color": "#2563EB",
             "rationale": "Stability anchor within an aggressive allocation",
             "example_funds": ["Kotak Nifty 50 Index Fund", "HDFC Index Fund-Nifty 50"]},
            {"asset": "International ETF",       "percentage": 20, "icon": "🌍", "color": "#EC4899",
             "rationale": "Exposure to global tech and growth (NASDAQ, S&P 500)",
             "example_funds": ["Motilal Oswal Nasdaq 100 ETF", "Franklin India Feeder – US Opportunities"]},
            {"asset": "Thematic / Sectoral",     "percentage": 15, "icon": "⚡", "color": "#F59E0B",
             "rationale": "High-conviction bets on India's structural growth themes",
             "example_funds": ["Nippon India Digital Advantage Fund", "ICICI Pru Technology Fund"]},
            {"asset": "Gold / REITs",            "percentage": 10, "icon": "🏢", "color": "#10B981",
             "rationale": "Alternative assets for non-correlated returns",
             "example_funds": ["Embassy Office Parks REIT", "Nippon India Gold BeES"]},
        ],
    },
}


def get_portfolio_allocation(
    risk_profile: str,
    monthly_savings: float = 0,
    years: int = 10,
) -> dict:
    """
    Return recommended asset allocation for a given risk profile.
    Includes projected corpus calculation using expected CAGR.
    """
    profile = risk_profile.lower()
    if profile not in PORTFOLIOS:
        profile = "moderate"

    p = PORTFOLIOS[profile]
    cagr = p["expected_cagr"] / 100
    r_monthly = cagr / 12
    n = years * 12
    sip = round(monthly_savings * 0.60 / 500) * 500  # 60% of savings invested

    # FV of SIP: PMT × ((1+r)^n - 1) / r
    projected_corpus = round(sip * ((1 + r_monthly) ** n - 1) / r_monthly) if r_monthly > 0 and sip > 0 else 0

    return {
        "risk_profile": profile,
        "description": p["description"],
        "expected_cagr_range": p["expected_cagr_range"],
        "expected_cagr": p["expected_cagr"],
        "allocations": p["allocations"],
        "monthly_sip": sip,
        "years": years,
        "projected_corpus": projected_corpus,
        "rationale": (
            f"As a {profile} investor, a ₹{sip:,}/month SIP at {p['expected_cagr']}% CAGR "
            f"grows to ₹{projected_corpus / 100000:.1f}L over {years} years. "
            f"This portfolio balances {p['allocations'][0]['asset']} (~{p['allocations'][0]['percentage']}%) "
            f"as the core holding."
        ),
    }
