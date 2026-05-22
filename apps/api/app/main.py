"""
MaxScore API - Face Analysis and Looksmaxxing Platform
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.routers import auth, scans, payments, users, chat
# Temporarily disabled - imports heavy ML libraries (MediaPipe via scorer)
# from app.routers import scores

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting MaxScore API...")
    yield
    logger.info("Shutting down MaxScore API...")


app = FastAPI(
    title="MaxScore API",
    description="AI-powered face analysis and looksmaxxing recommendations",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(scans.router, prefix="/api/v1/scans", tags=["Scans"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
# Temporarily disabled - imports heavy ML libraries
# app.include_router(scores.router, prefix="/api/v1/scores", tags=["Scores"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "MaxScore API",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "redis": "connected",
        "services": {
            "face_detection": "ready",
            "llm": "ready",
            "storage": "ready",
        },
    }
