"""
Application configuration using Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "MaxScore API"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/maxscore"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage (Cloudflare R2)
    R2_ENDPOINT: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "maxscore-uploads"
    R2_PUBLIC_URL: str = ""

    # Authentication (Clerk)
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_WEBHOOK_SECRET: str = ""

    # AI/ML
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Payments (Stripe)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID_MONTHLY: str = ""
    STRIPE_PRICE_ID_YEARLY: str = ""

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://maxscore.app",
        "https://www.maxscore.app",
        "https://web-theta-flame-49.vercel.app",
    ]

    # Rate Limiting
    FREE_TIER_DAILY_SCANS: int = 1
    PRO_TIER_DAILY_SCANS: int = 100
    CHAT_MESSAGE_LIMIT_FREE: int = 3
    CHAT_MESSAGE_LIMIT_PRO: int = 1000

    # Image Processing
    MAX_IMAGE_SIZE_MB: int = 10
    SUPPORTED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
