"""
Scans router - handles face analysis operations.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime
import uuid
import logging
import random

logger = logging.getLogger(__name__)
router = APIRouter()

# Lazy loading flag - set to True to use ML, False for demo mode
USE_ML = False


# Request/Response models
class ScanInitResponse(BaseModel):
    scan_id: str
    upload_url: str
    fields: Dict


class ScanStatusResponse(BaseModel):
    id: str
    status: str
    created_at: datetime
    overall_score: Optional[float] = None
    feature_scores: Optional[Dict] = None
    suggestions: Optional[List[Dict]] = None
    error_message: Optional[str] = None


class UploadCompleteRequest(BaseModel):
    etag: Optional[str] = None


# In-memory storage for demo (would use database in production)
_scans: Dict[str, Dict] = {}


@router.get("/")
async def get_scan_history(limit: int = 10, offset: int = 0):
    """
    Get user's scan history.
    Returns list of past scans for the dashboard.
    """
    # Demo: return sample scan history
    demo_scans = [
        {
            "id": "demo-scan-1",
            "status": "COMPLETED",
            "created_at": datetime.utcnow().isoformat(),
            "overall_score": 7.8,
            "percentile": 78,
        },
        {
            "id": "demo-scan-2",
            "status": "COMPLETED",
            "created_at": datetime.utcnow().isoformat(),
            "overall_score": 7.5,
            "percentile": 75,
        },
    ]
    return demo_scans[offset:offset + limit]


@router.post("/", response_model=ScanInitResponse)
async def initiate_scan():
    """
    Initiate a new face scan.
    Returns a pre-signed upload URL for the image.
    """
    scan_id = str(uuid.uuid4())

    # In production, generate R2 pre-signed URL here
    upload_url = f"https://upload.maxscore.app/{scan_id}"

    _scans[scan_id] = {
        "id": scan_id,
        "status": "PENDING",
        "created_at": datetime.utcnow(),
    }

    return ScanInitResponse(
        scan_id=scan_id,
        upload_url=upload_url,
        fields={"key": scan_id},
    )


@router.post("/analyze")
async def analyze_face(file: UploadFile = File(...)):
    """
    Direct face analysis endpoint.
    Returns demo data for now to verify infrastructure works.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read file to verify it's valid
    contents = await file.read()
    if len(contents) < 100:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Generate scan ID
    scan_id = str(uuid.uuid4())

    # Generate demo scores
    overall = round(random.uniform(6.5, 8.5), 1)

    # Demo response
    return {
        "id": scan_id,
        "status": "COMPLETED",
        "overall_score": overall,
        "percentile": int(overall * 10),
        "feature_scores": {
            "symmetry": {"name": "Facial Symmetry", "score": round(random.uniform(6, 9), 1), "percentile": 75, "description": "Good bilateral symmetry"},
            "jawline": {"name": "Jawline Definition", "score": round(random.uniform(6, 9), 1), "percentile": 70, "description": "Well-defined jaw structure"},
            "eyes": {"name": "Eye Area", "score": round(random.uniform(6, 9), 1), "percentile": 80, "description": "Positive canthal tilt"},
            "nose": {"name": "Nose Proportion", "score": round(random.uniform(6, 9), 1), "percentile": 72, "description": "Balanced proportions"},
            "skin": {"name": "Skin Quality", "score": round(random.uniform(6, 9), 1), "percentile": 78, "description": "Clear complexion"},
        },
        "strengths": ["Facial symmetry", "Eye area"],
        "areas_to_improve": ["Jawline definition", "Skin texture"],
        "suggestions": [
            {
                "feature": "jawline",
                "title": "Enhance Jawline Definition",
                "description": "Your jawline has good structure. Mewing and targeted exercises can enhance definition.",
                "tips": ["Practice proper tongue posture (mewing)", "Chew mastic gum 20 mins daily", "Reduce sodium to minimize water retention"],
                "priority": 1,
                "impact": "high",
            },
            {
                "feature": "skin",
                "title": "Optimize Skin Health",
                "description": "Maintain your clear complexion with a consistent skincare routine.",
                "tips": ["Use SPF 30+ sunscreen daily", "Incorporate retinol 2-3x weekly", "Stay hydrated - 8 glasses water daily"],
                "priority": 2,
                "impact": "medium",
            },
        ],
    }


@router.put("/{scan_id}/upload-complete")
async def mark_upload_complete(scan_id: str, request: UploadCompleteRequest):
    """
    Called after client completes image upload.
    Triggers background processing.
    """
    if scan_id not in _scans:
        raise HTTPException(status_code=404, detail="Scan not found")

    _scans[scan_id]["status"] = "PROCESSING"

    # In production, trigger Celery task here

    return {"status": "PROCESSING", "estimated_time": 10}


@router.get("/{scan_id}", response_model=ScanStatusResponse)
async def get_scan_status(scan_id: str):
    """
    Get status and results of a scan.
    Poll this endpoint until status is COMPLETED or FAILED.
    """
    if scan_id not in _scans:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan = _scans[scan_id]

    return ScanStatusResponse(
        id=scan["id"],
        status=scan["status"],
        created_at=scan["created_at"],
        overall_score=scan.get("overall_score"),
        feature_scores=scan.get("feature_scores"),
        suggestions=scan.get("suggestions"),
        error_message=scan.get("error_message"),
    )


@router.get("/{scan_id}/scores")
async def get_detailed_scores(scan_id: str):
    """
    Get detailed score breakdown for a completed scan.
    Pro tier only.
    """
    if scan_id not in _scans:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan = _scans[scan_id]

    if scan["status"] != "COMPLETED":
        raise HTTPException(status_code=400, detail="Scan not yet completed")

    return {
        "feature_scores": scan.get("feature_scores", {}),
        "detailed_metrics": scan.get("detailed_metrics", {}),
    }
