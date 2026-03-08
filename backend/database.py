"""
database.py — SQLite persistence layer using SQLAlchemy.

Zero-setup: uses SQLite file (finai.db) by default.
Switch to PostgreSQL or Supabase by setting DATABASE_URL in .env:
    DATABASE_URL=postgresql://user:password@host:5432/finai
"""
import os
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, Float, String, Text,
    DateTime, Boolean, ForeignKey, JSON,
)
from sqlalchemy.orm import DeclarativeBase, Session, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finai.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=False,
)


class Base(DeclarativeBase):
    pass


# ── Tables ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), default="User")
    email         = Column(String(200), unique=True, nullable=True)
    age           = Column(Integer, default=30)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile       = relationship("FinancialProfile", back_populates="user", uselist=False, cascade="all, delete")
    goals         = relationship("Goal", back_populates="user", cascade="all, delete")
    portfolio     = relationship("PortfolioAllocation", back_populates="user", uselist=False, cascade="all, delete")
    advice_history= relationship("AdviceHistory", back_populates="user", cascade="all, delete")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete")


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"
    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"), unique=True)
    monthly_income    = Column(Float, default=0)
    monthly_expenses  = Column(Float, default=0)
    monthly_savings   = Column(Float, default=0)
    total_debt        = Column(Float, default=0)
    emergency_fund    = Column(Float, default=0)
    risk_profile      = Column(String(20), default="moderate")
    health_score      = Column(Integer, default=0)
    health_label      = Column(String(20), default="")
    savings_ratio     = Column(Float, default=0)
    debt_ratio        = Column(Float, default=0)
    emergency_months  = Column(Float, default=0)
    updated_at        = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Goal(Base):
    __tablename__ = "goals"
    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"))
    name             = Column(String(200))
    target_amount    = Column(Float)
    current_amount   = Column(Float, default=0)
    timeline_months  = Column(Integer, default=60)
    monthly_required = Column(Float, default=0)
    feasibility      = Column(String(20), default="Unknown")
    priority         = Column(String(10), default="medium")
    is_completed     = Column(Boolean, default=False)
    created_at       = Column(DateTime, default=datetime.utcnow)
    updated_at       = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="goals")


class PortfolioAllocation(Base):
    __tablename__ = "portfolio_allocations"
    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), unique=True)
    risk_profile    = Column(String(20), default="moderate")
    allocations_json= Column(JSON)          # stores the list of allocation dicts
    expected_cagr   = Column(Float, default=12.0)
    monthly_sip     = Column(Float, default=0)
    projected_corpus= Column(Float, default=0)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="portfolio")


class AdviceHistory(Base):
    __tablename__ = "advice_history"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    advice_json= Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="advice_history")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    role       = Column(String(10))    # "user" or "assistant"
    content    = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")


# ── Bootstrap / CRUD helpers ──────────────────────────────────────────────────

def create_tables():
    Base.metadata.create_all(bind=engine)


def get_session() -> Session:
    return Session(engine)


def save_financial_profile(
    session: Session,
    user_id: int,
    data: dict,
) -> FinancialProfile:
    """Upsert the financial profile for a user."""
    profile = session.query(FinancialProfile).filter_by(user_id=user_id).first()
    if not profile:
        profile = FinancialProfile(user_id=user_id)
        session.add(profile)

    for key, value in data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)

    profile.updated_at = datetime.utcnow()
    session.commit()
    session.refresh(profile)
    return profile


def save_chat_message(session: Session, user_id: int, role: str, content: str):
    msg = ChatMessage(user_id=user_id, role=role, content=content)
    session.add(msg)
    session.commit()


def get_chat_history(session: Session, user_id: int, limit: int = 20) -> list[dict]:
    messages = (
        session.query(ChatMessage)
        .filter_by(user_id=user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    return [{"role": m.role, "content": m.content, "timestamp": m.created_at.isoformat()}
            for m in reversed(messages)]
