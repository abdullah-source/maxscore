"""
Scores router - detailed scoring endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional

router = APIRouter()


class FeatureScoreDetail(BaseModel):
    name: str
    score: float
    percentile: int
    description: str
    metrics: Optional[Dict] = None


class ScoreComparisonResponse(BaseModel):
    current: Dict[str, float]
    previous: Optional[Dict[str, float]] = None
    change: Optional[Dict[str, float]] = None


@router.get("/features/{feature_name}")
async def get_feature_details(feature_name: str):
    """
    Get detailed information about a specific feature score.
    """
    # Demo data
    feature_details = {
        "symmetry": {
            "name": "Facial Symmetry",
            "score": 8.4,
            "percentile": 88,
            "description": "Excellent bilateral symmetry, one of your strongest features",
            "metrics": {
                "left_right_ratio": 0.97,
                "vertical_alignment": 0.95,
                "horizontal_alignment": 0.96,
            },
            "tips": [
                "Sleep on your back to avoid asymmetric pressure",
                "Chew evenly on both sides",
                "Consider facial exercises for muscle balance",
            ],
        },
        "jawline": {
            "name": "Jawline Definition",
            "score": 6.9,
            "percentile": 72,
            "description": "Good jaw definition with room for enhancement",
            "metrics": {
                "mandibular_angle": 118,
                "gonial_angle": 128,
                "jaw_width_ratio": 0.72,
            },
            "tips": [
                "Practice mewing technique",
                "Reduce sodium intake to minimize bloating",
                "Try jawline exercises daily",
            ],
        },
    }

    if feature_name not in feature_details:
        raise HTTPException(status_code=404, detail="Feature not found")

    return feature_details[feature_name]


@router.get("/compare")
async def compare_scores(scan_id_1: str, scan_id_2: str) -> ScoreComparisonResponse:
    """
    Compare scores between two scans.
    Pro tier only.
    """
    # Demo comparison
    return ScoreComparisonResponse(
        current={
            "overall": 7.8,
            "symmetry": 8.4,
            "jawline": 6.9,
            "eye_area": 8.1,
            "nose": 7.2,
            "facial_thirds": 7.8,
            "skin": 8.0,
        },
        previous={
            "overall": 7.5,
            "symmetry": 8.2,
            "jawline": 6.5,
            "eye_area": 8.0,
            "nose": 7.1,
            "facial_thirds": 7.6,
            "skin": 7.5,
        },
        change={
            "overall": 0.3,
            "symmetry": 0.2,
            "jawline": 0.4,
            "eye_area": 0.1,
            "nose": 0.1,
            "facial_thirds": 0.2,
            "skin": 0.5,
        },
    )


@router.get("/percentiles")
async def get_percentile_info():
    """
    Get information about how percentiles are calculated.
    """
    return {
        "methodology": "Percentiles are calculated against our database of analyzed faces",
        "sample_size": "Based on 100,000+ analyses",
        "distribution": {
            "top_1_percent": "Score >= 9.5",
            "top_5_percent": "Score >= 9.0",
            "top_10_percent": "Score >= 8.5",
            "top_25_percent": "Score >= 7.5",
            "average": "Score 6.0-7.0",
        },
        "note": "Scores are normalized across demographics for fairness",
    }
