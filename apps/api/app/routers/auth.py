"""
Authentication router - Clerk integration.
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class TokenValidationResponse(BaseModel):
    valid: bool
    user_id: Optional[str] = None
    tier: str = "FREE"


@router.post("/validate")
async def validate_token(authorization: str = Header(...)) -> TokenValidationResponse:
    """
    Validate Clerk JWT token.
    In production, this verifies the token with Clerk's JWKS.
    """
    try:
        # Extract bearer token
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")

        token = authorization.split(" ")[1]

        # In production: verify JWT with Clerk JWKS
        # For demo, we'll accept any token
        return TokenValidationResponse(
            valid=True,
            user_id="demo_user",
            tier="FREE",
        )

    except Exception as e:
        logger.error(f"Token validation error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/me")
async def get_current_user(authorization: str = Header(...)):
    """
    Get current user info from token.
    """
    validation = await validate_token(authorization)

    if not validation.valid:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return {
        "user_id": validation.user_id,
        "tier": validation.tier,
        "email": "demo@maxscore.app",
    }
