"""
Users router - user management and quotas.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter()


class UserQuota(BaseModel):
    tier: str
    scans_today: int
    max_scans_per_day: int
    next_reset: datetime
    can_scan: bool


class UserScan(BaseModel):
    id: str
    created_at: datetime
    overall_score: float
    thumbnail_url: Optional[str] = None


class UserScansResponse(BaseModel):
    scans: List[UserScan]
    total: int


class UserSettingsRequest(BaseModel):
    notifications_enabled: Optional[bool] = None
    email_updates: Optional[bool] = None
    public_profile: Optional[bool] = None


@router.get("/quota", response_model=UserQuota)
async def get_user_quota():
    """
    Get current user's scan quota.
    """
    now = datetime.utcnow()
    next_reset = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)

    return UserQuota(
        tier="FREE",
        scans_today=0,
        max_scans_per_day=1,
        next_reset=next_reset,
        can_scan=True,
    )


@router.get("/scans", response_model=UserScansResponse)
async def get_user_scans(limit: int = 10, offset: int = 0):
    """
    Get user's scan history.
    """
    # Demo data
    demo_scans = [
        UserScan(
            id="scan_1",
            created_at=datetime.utcnow() - timedelta(hours=2),
            overall_score=7.8,
            thumbnail_url=None,
        ),
        UserScan(
            id="scan_2",
            created_at=datetime.utcnow() - timedelta(days=1),
            overall_score=7.5,
            thumbnail_url=None,
        ),
        UserScan(
            id="scan_3",
            created_at=datetime.utcnow() - timedelta(days=3),
            overall_score=7.3,
            thumbnail_url=None,
        ),
    ]

    return UserScansResponse(
        scans=demo_scans[offset : offset + limit],
        total=len(demo_scans),
    )


@router.get("/settings")
async def get_user_settings():
    """
    Get user settings.
    """
    return {
        "notifications_enabled": True,
        "email_updates": False,
        "public_profile": False,
        "data_retention_days": 30,
    }


@router.put("/settings")
async def update_user_settings(settings: UserSettingsRequest):
    """
    Update user settings.
    """
    # In production, update database
    return {"status": "updated", "settings": settings.model_dump(exclude_none=True)}


@router.delete("/data")
async def request_data_deletion():
    """
    Request deletion of all user data (GDPR compliance).
    """
    return {
        "status": "scheduled",
        "message": "Your data will be deleted within 24 hours",
        "confirmation_email_sent": True,
    }


@router.get("/export")
async def export_user_data():
    """
    Export all user data (GDPR compliance).
    """
    return {
        "user": {
            "email": "demo@maxscore.app",
            "created_at": "2024-01-01T00:00:00Z",
            "tier": "FREE",
        },
        "scans": [
            {
                "id": "scan_1",
                "created_at": "2024-03-31T00:00:00Z",
                "overall_score": 7.8,
            }
        ],
        "chat_history": [],
    }
