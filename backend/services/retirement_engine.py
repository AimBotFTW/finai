"""
Retirement Planning Engine — Corpus requirement + feasibility projection.
Uses inflation-adjusted expenses + 4% safe withdrawal rule.
"""
import math


def calculate_retirement_plan(
    age: int,
    retirement_age: int,
    monthly_expenses: float,
    current_savings: float,
    monthly_investment: float,
    expected_return: float = 12.0,
    inflation_rate: float = 6.0,
    life_expectancy: int = 85,
) -> dict:
    """
    Retirement corpus planning.

    Step 1: Inflation-adjust current expenses to retirement
        future_expenses_monthly = monthly_expenses × (1 + inflation_rate)^years

    Step 2: Required corpus using 25x rule (4% SWR)
        required_corpus = future_expenses_monthly × 12 × 25

    Step 3: Projected corpus via SIP + lump-sum growth
        FV_sip  = PMT × ((1+r)^n − 1) / r   [monthly SIP compounding]
        FV_lump = PV × (1 + annual_rate)^years [existing savings]

    Step 4: Gap analysis + monthly investment to close gap
    """
    years_to_retire = max(retirement_age - age, 1)
    years_in_retire = max(life_expectancy - retirement_age, 10)

    # Inflation-adjusted future monthly expenses at retirement
    future_monthly = monthly_expenses * ((1 + inflation_rate / 100) ** years_to_retire)

    # Required corpus (25x annual expenses = 4% withdrawal rate)
    required_corpus = round(future_monthly * 12 * 25)

    # Alternative: present value of annuity to fund expenses for years_in_retire
    r_real = (expected_return - inflation_rate) / 100 / 12  # real monthly rate
    if r_real > 0:
        annuity_corpus = round(
            future_monthly * (1 - (1 + r_real) ** (-years_in_retire * 12)) / r_real
        )
        required_corpus = max(required_corpus, annuity_corpus)

    # Projected accumulation
    n_months = years_to_retire * 12
    r = (expected_return / 100) / 12  # nominal monthly rate

    fv_sip = 0
    if r > 0 and n_months > 0:
        fv_sip = monthly_investment * ((1 + r) ** n_months - 1) / r

    fv_lump = current_savings * (1 + expected_return / 100) ** years_to_retire

    projected_corpus = round(fv_sip + fv_lump)
    gap = max(required_corpus - projected_corpus, 0)

    # Monthly investment needed to close gap
    if r > 0 and gap > 0 and n_months > 0:
        additional_monthly = round(gap * r / ((1 + r) ** n_months - 1))
    else:
        additional_monthly = round(gap / max(n_months, 1))

    total_monthly_needed = monthly_investment + additional_monthly

    # Feasibility
    if projected_corpus >= required_corpus:
        feasibility = "On Track"
        feasibility_color = "#10B981"
        message = (
            f"At ₹{monthly_investment:,}/month SIP you'll accumulate ₹{projected_corpus / 100000:.1f}L by age {retirement_age} — "
            f"exceeding the required ₹{required_corpus / 100000:.1f}L corpus."
        )
    elif projected_corpus >= required_corpus * 0.70:
        feasibility = "Needs Boost"
        feasibility_color = "#F59E0B"
        message = (
            f"You'll reach {round(projected_corpus / required_corpus * 100)}% of retirement corpus. "
            f"Increase SIP by ₹{additional_monthly:,}/month to close the ₹{gap / 100000:.1f}L gap."
        )
    else:
        feasibility = "At Risk"
        feasibility_color = "#EF4444"
        message = (
            f"Significant shortfall: ₹{gap / 100000:.1f}L gap. "
            f"Need ₹{total_monthly_needed:,}/month total SIP (currently ₹{monthly_investment:,}). "
            f"Consider also delaying retirement to age {min(retirement_age + 5, 65)} for more accumulation time."
        )

    # 5-year checkpoint projections
    checkpoints = []
    for t in range(5, years_to_retire + 1, 5):
        n = t * 12
        corpus_at_t = (
            monthly_investment * ((1 + r) ** n - 1) / r + current_savings * (1 + expected_return / 100) ** t
            if r > 0 else current_savings * (1 + expected_return / 100) ** t
        )
        checkpoints.append({
            "age": age + t,
            "years_from_now": t,
            "projected_corpus": round(corpus_at_t),
            "label": f"Age {age + t}",
        })

    return {
        "age": age,
        "retirement_age": retirement_age,
        "years_to_retire": years_to_retire,
        "monthly_expenses": monthly_expenses,
        "future_monthly_expenses": round(future_monthly),
        "required_corpus": required_corpus,
        "projected_corpus": projected_corpus,
        "corpus_gap": gap,
        "monthly_investment_current": monthly_investment,
        "monthly_investment_required": total_monthly_needed,
        "additional_monthly_needed": additional_monthly,
        "expected_return": expected_return,
        "inflation_rate": inflation_rate,
        "feasibility": feasibility,
        "feasibility_color": feasibility_color,
        "message": message,
        "checkpoints": checkpoints,
    }
