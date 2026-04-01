"""
Scans router - handles face analysis operations.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime
import uuid
import cv2
import numpy as np
import logging

from app.services.face_detector import get_detector, FaceLandmarks
from app.services.scorer import get_scorer, OverallScore
from app.services.llm_client import get_llm_client, Suggestion

logger = logging.getLogger(__name__)
router = APIRouter()


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
    Direct face analysis endpoint for testing.
    Accepts image upload and returns analysis.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    # Detect face
    detector = get_detector()
    landmarks = detector.detect_face(image)

    if landmarks is None:
        raise HTTPException(status_code=400, detail="No face detected in image")

    # Extract metrics and calculate scores
    metrics = detector.extract_metrics(landmarks)
    scorer = get_scorer()
    scores = scorer.calculate_scores(metrics)

    # Generate suggestions
    llm_client = get_llm_client()
    try:
        suggestions = await llm_client.generate_suggestions(scores)
    except Exception as e:
        logger.error(f"Error generating suggestions: {e}")
        suggestions = []

    # Build response
    return {
        "status": "COMPLETED",
        "overall_score": scores.overall,
        "percentile": scores.percentile,
        "feature_scores": {
            key: {
                "name": feature.name,
                "score": feature.score,
                "percentile": feature.percentile,
                "description": feature.description,
            }
            for key, feature in scores.features.items()
        },
        "strengths": scores.strengths,
        "areas_to_improve": scores.areas_to_improve,
        "suggestions": [
            {
                "feature": s.feature,
                "title": s.title,
                "description": s.description,
                "tips": s.tips,
                "priority": s.priority,
                "impact": s.impact,
            }
            for s in suggestions
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
