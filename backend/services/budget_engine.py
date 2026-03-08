"""
Budget Engine — Indian household budget benchmark analysis.
Compares user spending categories against recommended Indian ratios.
Source: RBI Household Finance Survey + industry standards.
"""

BENCHMARKS: list[dict] = [
    {"category": "Rent / Housing",  "recommended_pct": 30, "icon": "🏠", "color": "#2563EB"},
    {"category": "Food & Groceries","recommended_pct": 15, "icon": "🍽️", "color": "#10B981"},
    {"category": "Transport",       "recommended_pct": 10, "icon": "🚗", "color": "#7C3AED"},
    {"category": "Utilities",       "recommended_pct": 8,  "icon": "💡", "color": "#0891B2"},
    {"category": "Entertainment",   "recommended_pct": 5,  "icon": "🎬", "color": "#F59E0B"},
    {"category": "Healthcare",      "recommended_pct": 5,  "icon": "🏥", "color": "#EF4444"},
    {"category": "Personal Care",   "recommended_pct": 5,  "icon": "💆", "color": "#EC4899"},
    {"category": "Miscellaneous",   "recommended_pct": 7,  "icon": "📦", "color": "#94A3B8"},
]

# Approximate split of total expenses if user doesn't give category breakdown
DEFAULT_SPLIT_PCT = {
    "Rent / Housing":  37.5,
    "Food & Groceries":16.7,
    "Transport":       10.4,
    "Utilities":        8.3,
    "Entertainment":   10.4,
    "Healthcare":       4.2,
    "Personal Care":    4.2,
    "Miscellaneous":    8.3,
}


def analyze_budget(
    monthly_expenses: float,
    category_breakdown: dict | None = None,
) -> list[dict]:
    """
    Parameters
    ----------
    monthly_expenses : total monthly spend
    category_breakdown : optional dict {category: amount}; uses defaults if absent

    Returns
    -------
    List of per-category dicts with actual%, recommended%, status, alert, saving tip.
    """
    if not category_breakdown:
        # Derive from default split percentages
        category_breakdown = {
            cat: round(monthly_expenses * pct / 100)
            for cat, pct in DEFAULT_SPLIT_PCT.items()
        }

    total = sum(category_breakdown.values()) or monthly_expenses
    result = []

    for bench in BENCHMARKS:
        cat = bench["category"]
        amount = category_breakdown.get(cat, 0)
        actual_pct = round((amount / total) * 100, 1) if total > 0 else 0
        rec_pct = bench["recommended_pct"]
        over_by_pct = round(actual_pct - rec_pct, 1)
        over_by_amount = round((over_by_pct / 100) * total)
        annual_saving = over_by_amount * 12

        if over_by_pct > 5:
            status = "over"
            alert = f"{cat} at {actual_pct}% (benchmark {rec_pct}%). Overspending by ₹{over_by_amount:,}/month — saves ₹{annual_saving:,}/year if fixed."
            tip = _budget_tip(cat, over_by_amount)
        elif over_by_pct > 0:
            status = "watch"
            alert = f"{cat} at {actual_pct}% — slightly above benchmark {rec_pct}%."
            tip = f"Trim by ₹{over_by_amount:,}/month to stay within benchmark."
        else:
            status = "ok"
            alert = f"{cat} at {actual_pct}% — within recommended {rec_pct}%."
            tip = "Good. Maintain this level."

        result.append({
            "category":        cat,
            "amount":          amount,
            "percentage":      actual_pct,
            "recommended_pct": rec_pct,
            "over_by_pct":     max(over_by_pct, 0),
            "over_by_amount":  max(over_by_amount, 0),
            "annual_saving":   max(annual_saving, 0),
            "status":          status,
            "alert":           alert,
            "tip":             tip,
            "icon":            bench["icon"],
            "color":           bench["color"],
        })

    return result


def _budget_tip(category: str, over_amount: int) -> str:
    tips = {
        "Rent / Housing":   f"Consider house-sharing, relocating to a neighbouring area, or negotiating rent. Save ₹{over_amount:,}/month.",
        "Food & Groceries": f"Weekly meal planning + cooking at home vs restaurants can cut ₹{over_amount:,}/month easily.",
        "Transport":        f"Try public transport, carpooling, or switch to a bi-annual vehicle service plan. Save ₹{over_amount:,}/month.",
        "Entertainment":    f"Switch to annual OTT plans + limit dining out to 2x/month. Target saving ₹{over_amount:,}/month.",
        "Utilities":        f"LED bulbs, 5-star AC settings (24–26°C), and reducing standby power can trim ₹{over_amount:,}/month.",
        "Personal Care":    f"Budget grooming services and plan purchases during sales. Save ₹{over_amount:,}/month.",
    }
    return tips.get(category, f"Review spending in this category and aim to reduce by ₹{over_amount:,}/month.")


def get_budget_charts(monthly_expenses: float, category_breakdown: dict | None = None) -> dict:
    """
    Returns data for the expense breakdown chart.
    Replaces visualization.py:expense_breakdown.
    """
    analysis = analyze_budget(monthly_expenses, category_breakdown)
    # Format for Recharts
    chart_data = [
        {
            "category":   item["category"],
            "amount":     item["amount"],
            "color":      item["color"],
            "percentage": item["percentage"],
        }
        for item in analysis
    ]
    return {"expense_breakdown": chart_data}
