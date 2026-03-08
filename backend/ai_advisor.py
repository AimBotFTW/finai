"""
ai_advisor.py — Gemini AI integration for advice, portfolio, goal planning, and chat.
Fully risk-profile aware with structured fallbacks.
"""
from typing import Optional
from config import GEMINI_API_KEY, GEMINI_MODEL
from utils import split_advice_sections, split_goal_sections

# ── Initialize Gemini ──────────────────────────────────────────────────────────
GEMINI_AVAILABLE = False
gemini_model = None

if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel(GEMINI_MODEL)
        GEMINI_AVAILABLE = True
        print(f"✅ Gemini AI initialized with model: {GEMINI_MODEL}")
    except Exception as e:
        print(f"❌ Gemini initialization failed: {e}")


# ─── Portfolio Allocations by Risk Profile ─────────────────────────────────────

PORTFOLIO_TEMPLATES = {
    "conservative": {
        "expected_return": 9.0,
        "rebalance_note": "Rebalance annually. Maintain higher debt allocation for stability.",
        "allocations": [
            {"asset_class": "Large Cap Index Funds", "percentage": 30, "color": "#2563EB",
             "rationale": "Blue-chip stability with market returns",
             "examples": ["Nifty 50 BeES", "HDFC Nifty 50 Index Fund"]},
            {"asset_class": "Debt Mutual Funds",     "percentage": 30, "color": "#10B981",
             "rationale": "Capital preservation with 7-8% returns",
             "examples": ["HDFC Corporate Bond", "ICICI Pru Short Term"]},
            {"asset_class": "Gold / Gold ETFs",      "percentage": 15, "color": "#F59E0B",
             "rationale": "Inflation hedge, crisis protection",
             "examples": ["Nippon India Gold ETF", "SBI Gold Fund"]},
            {"asset_class": "Liquid Funds",          "percentage": 15, "color": "#0891B2",
             "rationale": "High liquidity emergency reserve",
             "examples": ["Parag Parikh Liquid Fund", "Axis Liquid Fund"]},
            {"asset_class": "Flexi Cap Funds",       "percentage": 10, "color": "#7C3AED",
             "rationale": "Modest equity exposure across market caps",
             "examples": ["Parag Parikh Flexi Cap", "HDFC Flexi Cap"]},
        ],
    },
    "moderate": {
        "expected_return": 12.0,
        "rebalance_note": "Rebalance every 6 months. Review equity allocation on major market moves.",
        "allocations": [
            {"asset_class": "Nifty 50 Index Funds",  "percentage": 35, "color": "#2563EB",
             "rationale": "Core market exposure with low expense ratio",
             "examples": ["UTI Nifty 50 Index", "Nifty BeES ETF"]},
            {"asset_class": "Flexi Cap Funds",       "percentage": 25, "color": "#7C3AED",
             "rationale": "Active management across market caps",
             "examples": ["Parag Parikh Flexi Cap", "Mirae Asset Flexi Cap"]},
            {"asset_class": "International ETFs",    "percentage": 15, "color": "#0891B2",
             "rationale": "Geographic diversification, USD exposure",
             "examples": ["Motilal Oswal Nasdaq 100", "Nippon India US Equity"]},
            {"asset_class": "Gold ETFs",             "percentage": 10, "color": "#F59E0B",
             "rationale": "Inflation hedge and volatility buffer",
             "examples": ["Nippon India Gold ETF", "Kotak Gold ETF"]},
            {"asset_class": "Liquid / Debt Funds",   "percentage": 15, "color": "#10B981",
             "rationale": "Liquidity cushion and income stability",
             "examples": ["Axis Liquid Fund", "HDFC Short Term Debt"]},
        ],
    },
    "aggressive": {
        "expected_return": 15.0,
        "rebalance_note": "Rebalance quarterly. Stay invested through market downturns.",
        "allocations": [
            {"asset_class": "Mid & Small Cap Funds", "percentage": 30, "color": "#EF4444",
             "rationale": "High growth potential, higher volatility",
             "examples": ["Nippon India Small Cap", "Axis Midcap Fund"]},
            {"asset_class": "Nifty 50 / Next 50",    "percentage": 25, "color": "#2563EB",
             "rationale": "Stable large cap anchor",
             "examples": ["UTI Nifty 50 Index", "HDFC Nifty Next 50"]},
            {"asset_class": "International ETFs",    "percentage": 20, "color": "#0891B2",
             "rationale": "US & global tech exposure",
             "examples": ["Motilal Oswal Nasdaq 100", "Franklin US Feeder"]},
            {"asset_class": "Flexi Cap / Thematic",  "percentage": 15, "color": "#7C3AED",
             "rationale": "Opportunistic sector plays",
             "examples": ["Parag Parikh Flexi Cap", "ICICI Pru Technology"]},
            {"asset_class": "Gold / REITs",          "percentage": 10, "color": "#F59E0B",
             "rationale": "Alternative assets for diversification",
             "examples": ["Embassy REIT", "Nippon Gold ETF"]},
        ],
    },
}


# ─── Portfolio Recommendation ──────────────────────────────────────────────────

def generate_portfolio(
    risk_profile: str,
    monthly_investable: float,
    total_invested: float,
    horizon_years: int,
) -> dict:
    """Generate AI-recommended portfolio allocation from risk profile."""
    template = PORTFOLIO_TEMPLATES.get(risk_profile, PORTFOLIO_TEMPLATES["moderate"])
    expected_return = template["expected_return"] / 100

    # Calculate 10-year projected value using SIP formula
    monthly_return = expected_return / 12
    n = horizon_years * 12
    expected_10yr = (
        monthly_investable * ((((1 + monthly_return) ** n) - 1) / monthly_return) * (1 + monthly_return)
        + total_invested * ((1 + expected_return) ** horizon_years)
    )

    allocations = []
    for alloc in template["allocations"]:
        allocations.append({
            **alloc,
            "monthly_amount": round(monthly_investable * alloc["percentage"] / 100 / 100) * 100,
        })

    if GEMINI_AVAILABLE and gemini_model:
        try:
            prompt = f"""You are an Indian portfolio advisor. For a {risk_profile} investor with ₹{monthly_investable:,.0f}/month to invest over {horizon_years} years, improve this portfolio rationale.

For each of these assets, write one crisp 1-sentence rationale specific to current Indian market conditions (2025-26):
{', '.join(a['asset_class'] for a in template['allocations'])}

Return ONLY a JSON array of objects: [{{"asset_class": "...", "rationale": "..."}}]
No markdown, no extra text."""
            response = gemini_model.generate_content(prompt)
            import json, re
            text = response.text.strip().strip("```json").strip("```")
            rationales = json.loads(text)
            rationale_map = {r["asset_class"]: r["rationale"] for r in rationales}
            for alloc in allocations:
                if alloc["asset_class"] in rationale_map:
                    alloc["rationale"] = rationale_map[alloc["asset_class"]]
        except Exception as e:
            print(f"Portfolio Gemini error: {e}")

    return {
        "risk_profile": risk_profile,
        "allocations": allocations,
        "expected_annual_return": template["expected_return"],
        "expected_10yr_value": round(expected_10yr),
        "monthly_investable": monthly_investable,
        "rebalance_note": template["rebalance_note"],
    }


# ─── Financial Advice ──────────────────────────────────────────────────────────

def _rule_based_advice(
    monthly_income: float,
    monthly_savings: float,
    total_debt: float,
    dti: float,
    months_ef: float,
    risk_profile: str,
) -> list[dict]:
    advice = []
    sip = round(monthly_savings * 0.55 / 500) * 500
    advice.append({
        "category": "SIP Investment",
        "title": f"Start ₹{sip:,}/month SIP",
        "description": f"Invest ₹{sip:,}/month in {'Index + Mid Cap' if risk_profile == 'aggressive' else 'Index Funds'} SIP. At {PORTFOLIO_TEMPLATES[risk_profile]['expected_return']}% CAGR, corpus in 10 years ≈ ₹{round(sip * 12 * 10 * 1.8 / 1000):,}K.",
        "priority": "high", "icon": "📈",
        "action_steps": [f"Open SIP on Zerodha/Groww", f"Auto-debit ₹{sip:,} on salary day", "Step-up SIP by 10% annually"],
    })
    if dti > 15:
        extra = round(monthly_savings * 0.18 / 500) * 500
        advice.append({
            "category": "Debt Reduction",
            "title": "Accelerate Debt Payoff",
            "description": f"DTI at {dti:.1f}%. Pay ₹{extra:,}/month extra using avalanche method (highest interest first).",
            "priority": "high" if dti > 36 else "medium", "icon": "💳",
            "action_steps": ["List all debts by interest rate", f"Add ₹{extra:,}/month to highest-rate debt", "Avoid new credit card balance"],
        })
    if months_ef < 6:
        needed = max((6 - months_ef) * monthly_savings, 0)
        advice.append({
            "category": "Emergency Fund",
            "title": "Build 6-Month Buffer",
            "description": f"Only {months_ef:.1f} months covered. Need ₹{needed:,.0f} more — park in a Liquid Fund (7-7.5% returns).",
            "priority": "medium" if months_ef >= 3 else "high", "icon": "🛡️",
            "action_steps": ["Open Parag Parikh or Axis Liquid Fund", f"Auto-transfer ₹{round(needed/12/500)*500:,}/month", "Keep separate from investment accounts"],
        })
    sec80c = min(monthly_income * 12 * 0.05, 150000)
    advice.append({
        "category": "Tax Savings",
        "title": "Maximize 80C + NPS",
        "description": f"Invest ₹{sec80c:,.0f} in ELSS + ₹50,000 in NPS Tier 1 for ₹{(sec80c + 50000) * 0.30:,.0f} tax savings.",
        "priority": "medium", "icon": "🧾",
        "action_steps": ["Buy ELSS fund before March 31", "Open NPS Tier 1 via eNPS portal", "Claim HRA and home loan deductions"],
    })
    advice.append({
        "category": "Passive Income",
        "title": "Create Passive Income",
        "description": "ETF dividends + REIT distributions. Embassy REIT yields ~6% annually with quarterly payouts.",
        "priority": "low", "icon": "💰",
        "action_steps": ["Buy Embassy or Mindspace REIT on NSE", "Invest in dividend-paying Nifty ETFs", "Target ₹5,000/month passive income in 3 years"],
    })
    return advice


def generate_financial_advice(
    monthly_income: float,
    monthly_expenses: float,
    total_debt: float,
    savings_ratio: float,
    financial_health_score: int,
    risk_profile: str = "moderate",
    emergency_fund: float = 0.0,
) -> list[dict]:
    monthly_savings = max(monthly_income - monthly_expenses, 0)
    dti = (total_debt / (monthly_income * 12)) * 100 if monthly_income > 0 else 0
    # Correct emergency fund months calculation
    months_ef = (emergency_fund / monthly_expenses) if monthly_expenses > 0 else 0

    if GEMINI_AVAILABLE and gemini_model:
        prompt = f"""You are an expert Indian financial advisor. User's profile:
- Monthly Income: ₹{monthly_income:,.0f}
- Monthly Expenses: ₹{monthly_expenses:,.0f}
- Monthly Savings: ₹{monthly_savings:,.0f} ({savings_ratio:.1f}% ratio)
- Total Debt: ₹{total_debt:,.0f} (DTI: {dti:.1f}%)
- Emergency Fund: {months_ef:.1f} months covered
- Risk Profile: {risk_profile.title()}
- Health Score: {financial_health_score}/100

Generate 5 personalized, prioritized financial advice items in JSON array format.
Each object MUST have:
- "category": string (one of: "SIP Investment", "Debt Reduction", "Emergency Fund", "Tax Savings", "Passive Income", "Insurance", "Risk Alert")
- "title": string (max 6 words, specific ₹ amounts where relevant)
- "description": string (specific ₹ amounts, max 2 sentences, actionable)
- "priority": "high"|"medium"|"low"
- "icon": single emoji
- "action_steps": array of 3 specific actionable strings with ₹ amounts

Tailor advice to {risk_profile} risk profile. Reference Indian products: ELSS, NPS, SIP, ETFs, REITs, PPF.
Cover: emergency fund status ({months_ef:.1f} months), debt ({dti:.1f}% DTI), and investment suggestions.
Return ONLY valid JSON array, no markdown.
"""
        try:
            response = gemini_model.generate_content(prompt)
            items = split_advice_sections(response.text)
            if items and len(items) >= 3:
                return items
        except Exception as e:
            print(f"Gemini advice error: {e}")

    return _rule_based_advice(monthly_income, monthly_savings, total_debt, dti, months_ef, risk_profile)



# ─── Goal Plan ─────────────────────────────────────────────────────────────────

def generate_goal_plan(
    goal_name: str,
    target_amount: float,
    timeline_months: int,
    current_amount: float = 0,
    monthly_income: Optional[float] = None,
    monthly_savings: Optional[float] = None,
    risk_profile: str = "moderate",
) -> dict:
    gap = max(target_amount - current_amount, 0)
    monthly_required = round(gap / timeline_months, 2) if timeline_months > 0 else gap

    if monthly_savings:
        if monthly_required > monthly_savings * 0.90: feasibility = "Not Feasible"
        elif monthly_required > monthly_savings * 0.50: feasibility = "Stretch"
        else: feasibility = "Achievable"
    else:
        feasibility = "Achievable"

    # Quarterly milestones
    milestones = []
    step = max(timeline_months // 4, 1)
    for m in range(step, timeline_months + 1, step):
        acc = round(current_amount + monthly_required * m)
        pct = round(min((acc / target_amount) * 100, 100), 1)
        q = (m - 1) // step + 1
        milestones.append({"month": m, "label": f"Q{q}", "accumulated": acc, "percentage": pct})

    strategy = ""
    if GEMINI_AVAILABLE and gemini_model:
        prompt = f"""Indian financial advisor. Help user achieve: {goal_name}
Target: ₹{target_amount:,.0f} | Saved: ₹{current_amount:,.0f} | Gap: ₹{gap:,.0f}
Timeline: {timeline_months} months | Monthly needed: ₹{monthly_required:,.0f}
Risk Profile: {risk_profile.title()} | Feasibility: {feasibility}

Write a 3-sentence actionable strategy. Mention specific Indian investment vehicles suited to the timeline.
Be encouraging and specific with ₹ amounts."""
        try:
            response = gemini_model.generate_content(prompt)
            strategy = response.text.strip()
        except Exception as e:
            print(f"Goal plan Gemini error: {e}")

    if not strategy:
        vehicle = "Liquid/RD Fund" if timeline_months <= 6 else "Debt + Equity blend" if timeline_months <= 24 else "SIP in equity funds"
        strategy = (
            f"To achieve your {goal_name} goal of ₹{target_amount:,.0f} in {timeline_months} months, "
            f"invest ₹{monthly_required:,.0f}/month in a {vehicle}. "
            f"Automate the transfer on salary day — discipline is the key to reaching ₹{target_amount:,.0f}. "
            f"Review progress every quarter and top up if income increases."
        )

    return {
        "goal_name": goal_name, "target_amount": target_amount,
        "current_amount": current_amount, "gap": gap,
        "monthly_required": monthly_required, "timeline_months": timeline_months,
        "feasibility": feasibility, "strategy": strategy, "milestones": milestones,
    }


# ─── Chatbot (with full financial context) ────────────────────────────────────

def finance_chatbot_response(
    user_question: str,
    history: list[dict],
    financial_context: Optional[dict] = None,
) -> dict:
    if GEMINI_AVAILABLE and gemini_model:
        ctx = financial_context or {}
        ctx_text = ""
        if ctx:
            ctx_text = f"""
USER'S FINANCIAL PROFILE (use this for personalized answers):
- Monthly Income: ₹{ctx.get('monthly_income', 'unknown'):,}
- Monthly Savings: ₹{ctx.get('monthly_savings', 'unknown'):,}
- Total Debt: ₹{ctx.get('total_debt', 0):,}
- Emergency Fund: ₹{ctx.get('emergency_fund', 0):,}
- Debt-to-Income: {ctx.get('debt_ratio', 'unknown')}%
- Health Score: {ctx.get('health_score', 'unknown')}/100
- Risk Profile: {ctx.get('risk_profile', 'moderate').title()}
"""
        history_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history[-6:]])
        prompt = f"""You are FinAI, an expert Indian financial advisor AI. Be specific, concise (2-4 sentences), and personal.
Always use ₹ amounts. Reference Indian investment products: SIP, ELSS, NPS scraper, ETFs, FD, RD, PPF, REITs.
{ctx_text}
{"CONVERSATION:\n" + history_text if history_text else ""}

User: {user_question}

After your answer, on a NEW LINE write "SUGGESTIONS:" then 3 comma-separated follow-up questions.
Answer:"""
        try:
            response = gemini_model.generate_content(prompt)
            raw = response.text.strip()
            if "SUGGESTIONS:" in raw:
                parts = raw.split("SUGGESTIONS:")
                return {"response": parts[0].strip(), "suggestions": [s.strip() for s in parts[1].split(",")][:3]}
            return {"response": raw, "suggestions": []}
        except Exception as e:
            print(f"Chat Gemini error: {e}")

    # Rule-based fallback with financial context awareness
    msg = user_question.lower()
    ctx = financial_context or {}
    income = ctx.get("monthly_income", 0)
    savings = ctx.get("monthly_savings", 0)

    if any(k in msg for k in ("car", "loan", "afford", "emi")):
        if income:
            max_emi = round(income * 0.40)
            resp = f"With your income of ₹{income:,}/month, your safe EMI capacity is ~₹{max_emi:,}/month (40% rule). A 5-year car loan at 9% for ₹8L means ~₹16,600 EMI — affordable if your existing EMIs are under ₹{max_emi - 16600:,}."
        else:
            resp = "For a car loan, follow the 20/4/10 rule: 20% down payment, ≤4-year loan, ≤10% of gross income as EMI. On ₹75K income, keep EMI under ₹7,500/month for safe repayment."
    elif any(k in msg for k in ("invest", "sip", "how much")):
        if savings:
            sip = round(savings * 0.60 / 500) * 500
            resp = f"Based on your savings of ₹{savings:,}/month, invest ₹{sip:,} in SIPs (60% of savings). Split: 50% Nifty 50 Index, 30% Flexi Cap, 20% Mid Cap. Increase by 10% annually."
        else:
            resp = "A good rule of thumb: invest at least 20% of income in SIPs. Start with Nifty 50 Index Fund (low cost) and add Mid Cap exposure after building an emergency fund."
    elif any(k in msg for k in ("emergency", "fund", "safe")):
        resp = "Keep 6 months of expenses in a Liquid Mutual Fund — not savings account. Best options: Parag Parikh Liquid Fund or Axis Liquid Fund (7-7.5% returns, instant withdrawal)."
    else:
        resp = "Great question! The three pillars of financial health: 1) 6-month emergency fund in a liquid fund, 2) SIP in diversified equity, 3) Maximize 80C + NPS for tax savings. What area would you like to focus on?"

    return {"response": resp, "suggestions": ["How to start my first SIP?", "Best tax-saving options for FY26?", "How much emergency fund do I need?"]}
