"""
config.py — Load and validate environment configuration.
"""
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = "gemini-2.0-flash"
GEMINI_AVAILABLE: bool = bool(GEMINI_API_KEY)
APP_VERSION: str = "2.0.0"

if not GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY is not set. AI features will use rule-based fallback.")

