"""
utils.py — Helper utilities for formatting, parsing and cleaning.
"""
import re
import json


def clean_currency(value_str: str) -> float:
    """
    Clean a currency string and return a float.
    E.g. '₹75,000' -> 75000.0, '1.5L' -> 150000.0
    """
    value_str = str(value_str).strip()
    # Handle Indian shorthand: L = lakh, Cr = crore
    lakh_match = re.match(r"[\₹]?\s*([\d.]+)\s*[Ll]", value_str)
    crore_match = re.match(r"[\₹]?\s*([\d.]+)\s*[Cc][Rr]", value_str)
    if lakh_match:
        return float(lakh_match.group(1)) * 100_000
    if crore_match:
        return float(crore_match.group(1)) * 10_000_000
    # Remove ₹ symbol and commas
    cleaned = re.sub(r"[₹,\s]", "", value_str)
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def format_percentage(value: float, decimals: int = 1) -> str:
    """Format a float as a percentage string. E.g. 0.36 -> '36.0%'"""
    return f"{value:.{decimals}f}%"


def format_inr(amount: float) -> str:
    """Format a float as Indian Rupee string. E.g. 75000 -> '₹75,000'"""
    return f"₹{amount:,.0f}"


def split_advice_sections(raw_text: str) -> list[dict]:
    """
    Parse Gemini-generated advice text into structured advice items.
    Expects the model to return a JSON array; falls back to empty list.
    """
    try:
        # Strip markdown fences if present
        text = raw_text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]).strip()
        # Try direct JSON parse
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return []


def split_goal_sections(raw_text: str) -> dict:
    """
    Parse Gemini goal plan text into structured fields.
    Returns dict with keys: strategy, milestones, feasibility.
    """
    result = {"strategy": raw_text, "milestones": [], "feasibility": "Achievable"}
    try:
        text = raw_text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]).strip()
        parsed = json.loads(text)
        result.update(parsed)
    except (json.JSONDecodeError, ValueError):
        pass
    return result
