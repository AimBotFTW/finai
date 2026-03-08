"""
tax_analysis.py — Indian Tax Optimization Engine (FY 2025-26).
Detects eligibility across 80C, 80D, NPS, HRA, and other sections.
"""

SECTION_80C_LIMIT = 150000
NPS_EXTRA_LIMIT = 50000          # 80CCD(1B)
HEALTH_INS_SELF = 25000          # 80D — self + family
HEALTH_INS_PARENTS = 25000       # 80D — parents

TAX_SLABS_NEW = [                # New regime FY 2025-26
    (300000, 0.0),
    (700000, 0.05),
    (1000000, 0.10),
    (1200000, 0.15),
    (1500000, 0.20),
    (float("inf"), 0.30),
]


def compute_tax_saving(income: float, investments: dict) -> float:
    """
    Approximate marginal tax saving for a given deduction in INR.
    Uses new tax regime slabs.
    """
    annual = income * 12
    slab_rate = 0.0
    remaining = annual
    for limit, rate in TAX_SLABS_NEW:
        if remaining <= 0:
            break
        band = min(remaining, limit)
        if band > 0 and rate > 0:
            slab_rate = rate  # take highest slab reached
        remaining -= band
    return slab_rate


def tax_optimization_analysis(
    monthly_income: float,
    existing_80c: float = 0,
    has_nps: bool = False,
    has_health_insurance: bool = False,
    has_parents_health_insurance: bool = False,
    hra_eligible: bool = True,
) -> list[dict]:
    """
    Return a list of tax-saving recommendations with potential savings.
    """
    annual_income = monthly_income * 12
    recommendations = []
    rate = compute_tax_saving(monthly_income, {})

    # ── Section 80C ──────────────────────────────────────────────────────────
    sec80c_used = min(existing_80c, SECTION_80C_LIMIT)
    sec80c_gap = max(SECTION_80C_LIMIT - sec80c_used, 0)

    if sec80c_gap > 0:
        tax_saved = round(sec80c_gap * rate)
        recommendations.append({
            "section": "Section 80C",
            "category": "ELSS / PPF / Tax-Saver FD / LIC",
            "eligible_amount": sec80c_gap,
            "tax_saved": tax_saved,
            "priority": "high" if sec80c_gap >= 75000 else "medium",
            "icon": "📋",
            "tip": f"Invest ₹{sec80c_gap:,.0f} in ELSS mutual fund before March 31 to save ₹{tax_saved:,} tax.",
            "options": ["ELSS (Lock-in 3 yrs, market-linked)", "PPF (15 yrs, 7.1% guaranteed)", "Tax-Saver FD (5 yrs fixed)"],
        })

    # ── NPS — 80CCD(1B) ──────────────────────────────────────────────────────
    if not has_nps:
        nps_saved = round(NPS_EXTRA_LIMIT * rate)
        recommendations.append({
            "section": "Section 80CCD(1B)",
            "category": "NPS Tier 1",
            "eligible_amount": NPS_EXTRA_LIMIT,
            "tax_saved": nps_saved,
            "priority": "high",
            "icon": "🏦",
            "tip": f"Open NPS Tier 1 (eNPS portal) to save ₹{nps_saved:,} as an additional deduction beyond 80C.",
            "options": ["NPS via eNPS portal (NSDL)", "NPS via employer contribution", "Auto Choice fund allocation"],
        })

    # ── Health Insurance — 80D ───────────────────────────────────────────────
    if not has_health_insurance:
        hi_saved = round(HEALTH_INS_SELF * rate)
        recommendations.append({
            "section": "Section 80D",
            "category": "Health Insurance (Self + Family)",
            "eligible_amount": HEALTH_INS_SELF,
            "tax_saved": hi_saved,
            "priority": "medium",
            "icon": "🏥",
            "tip": f"Buy a ₹10L family floater health plan (~₹8,000–15,000/yr) and save ₹{hi_saved:,} tax.",
            "options": ["Niva Bupa (Star Health)", "HDFC ERGO", "ICICI Lombard iHealth"],
        })

    if not has_parents_health_insurance and annual_income >= 500000:
        pi_saved = round(HEALTH_INS_PARENTS * rate)
        recommendations.append({
            "section": "Section 80D",
            "category": "Health Insurance (Parents)",
            "eligible_amount": HEALTH_INS_PARENTS,
            "tax_saved": pi_saved,
            "priority": "medium",
            "icon": "👨‍👩‍👧",
            "tip": f"Insure parents with a ₹10L senior citizen plan and save ₹{pi_saved:,} additional tax.",
            "options": ["Star Senior Citizen Red Carpet", "New India Senior Citizen plan"],
        })

    # ── HRA (if applicable) ───────────────────────────────────────────────────
    if hra_eligible:
        hra_approx = round(monthly_income * 0.4 * 12)
        hra_saved = round(hra_approx * rate)
        recommendations.append({
            "section": "HRA Exemption",
            "category": "House Rent Allowance",
            "eligible_amount": hra_approx,
            "tax_saved": hra_saved,
            "priority": "low",
            "icon": "🏠",
            "tip": f"Ensure you claim HRA exemption (~₹{hra_approx:,}/yr). Submit rent receipts to HR by February.",
            "options": ["Collect rent receipts (above ₹1L/yr needs landlord PAN)", "Include within salary structure"],
        })

    # Summary
    total_deductions = sec80c_gap + (NPS_EXTRA_LIMIT if not has_nps else 0)
    total_savings = round(total_deductions * rate)

    return {
        "recommendations": recommendations,
        "total_possible_savings": total_savings,
        "effective_tax_rate": round(rate * 100, 1),
        "annual_income": annual_income,
        "summary": f"By optimizing your tax savings, you could save up to ₹{total_savings:,} in tax this FY.",
    }
