"""
Facial feature scoring algorithm.
Calculates attractiveness scores based on facial metrics.
"""

from dataclasses import dataclass
from typing import Dict, List, Tuple
import numpy as np
from app.services.face_detector import FaceMetrics


@dataclass
class FeatureScore:
    """Score for a single facial feature."""
    name: str
    score: float  # 0-10
    percentile: int  # 0-100
    description: str
    improvement_potential: str


@dataclass
class OverallScore:
    """Complete scoring result."""
    overall: float  # 0-10
    percentile: int  # 0-100
    features: Dict[str, FeatureScore]
    strengths: List[str]
    areas_to_improve: List[str]


class FaceScorer:
    """
    Calculate attractiveness scores from facial metrics.
    Uses evidence-based aesthetic principles and population statistics.
    """

    # Ideal values based on aesthetic research
    IDEALS = {
        'symmetry': 1.0,  # Perfect symmetry ratio
        'thirds_ratio': (0.33, 0.33, 0.34),  # Equal thirds
        'eye_spacing': 0.46,  # IPD / face width
        'canthal_tilt': 4.0,  # Slight positive tilt (degrees)
        'nose_ratio': 1.0,  # Nose width / intercanthal
        'face_ratio': 0.618,  # Golden ratio (width/height)
    }

    # Score weights for overall calculation
    WEIGHTS = {
        'symmetry': 0.20,
        'jawline': 0.18,
        'eye_area': 0.18,
        'nose': 0.12,
        'facial_thirds': 0.15,
        'skin': 0.10,
        'overall_harmony': 0.07,
    }

    def calculate_scores(self, metrics: FaceMetrics, skin_score: float = 7.0) -> OverallScore:
        """
        Calculate all scores from facial metrics.

        Args:
            metrics: FaceMetrics from face detection
            skin_score: Pre-calculated skin quality score (0-10)

        Returns:
            OverallScore with all feature scores
        """
        features = {}

        # === Symmetry Score ===
        symmetry_score = self._score_symmetry(metrics)
        features['symmetry'] = FeatureScore(
            name='Symmetry',
            score=symmetry_score,
            percentile=self._score_to_percentile(symmetry_score),
            description=self._get_symmetry_description(symmetry_score),
            improvement_potential='Low' if symmetry_score > 7.5 else 'Medium',
        )

        # === Jawline Score ===
        jawline_score = self._score_jawline(metrics)
        features['jawline'] = FeatureScore(
            name='Jawline',
            score=jawline_score,
            percentile=self._score_to_percentile(jawline_score),
            description=self._get_jawline_description(jawline_score),
            improvement_potential='High' if jawline_score < 7 else 'Low',
        )

        # === Eye Area Score ===
        eye_score = self._score_eyes(metrics)
        features['eye_area'] = FeatureScore(
            name='Eye Area',
            score=eye_score,
            percentile=self._score_to_percentile(eye_score),
            description=self._get_eye_description(eye_score, metrics.canthal_tilt),
            improvement_potential='Medium',
        )

        # === Nose Score ===
        nose_score = self._score_nose(metrics)
        features['nose'] = FeatureScore(
            name='Nose',
            score=nose_score,
            percentile=self._score_to_percentile(nose_score),
            description=self._get_nose_description(nose_score),
            improvement_potential='Medium' if nose_score < 7 else 'Low',
        )

        # === Facial Thirds Score ===
        thirds_score = self._score_facial_thirds(metrics)
        features['facial_thirds'] = FeatureScore(
            name='Facial Thirds',
            score=thirds_score,
            percentile=self._score_to_percentile(thirds_score),
            description=self._get_thirds_description(thirds_score, metrics.thirds_ratio),
            improvement_potential='Low',
        )

        # === Skin Score (passed in) ===
        features['skin'] = FeatureScore(
            name='Skin Quality',
            score=skin_score,
            percentile=self._score_to_percentile(skin_score),
            description=self._get_skin_description(skin_score),
            improvement_potential='High' if skin_score < 7.5 else 'Medium',
        )

        # === Calculate Overall Score ===
        overall = sum(
            features[key].score * self.WEIGHTS.get(key, 0.1)
            for key in features
        ) / sum(self.WEIGHTS.values())

        # Add harmony bonus (0-0.5)
        harmony_bonus = self._calculate_harmony_bonus(features)
        overall = min(10, overall + harmony_bonus)

        # Identify strengths and areas to improve
        sorted_features = sorted(features.items(), key=lambda x: x[1].score, reverse=True)
        strengths = [f[0] for f in sorted_features[:2] if f[1].score >= 7.0]
        areas_to_improve = [f[0] for f in sorted_features[-2:] if f[1].score < 7.5]

        return OverallScore(
            overall=round(overall, 1),
            percentile=self._score_to_percentile(overall),
            features=features,
            strengths=strengths,
            areas_to_improve=areas_to_improve,
        )

    def _score_symmetry(self, metrics: FaceMetrics) -> float:
        """Score facial symmetry (0-10)."""
        # Use the pre-calculated symmetry score from metrics
        return max(0, min(10, metrics.symmetry_score))

    def _score_jawline(self, metrics: FaceMetrics) -> float:
        """Score jawline definition (0-10)."""
        # Ideal jaw angle is around 120-130 degrees
        ideal_angle = 125
        angle_deviation = abs(metrics.jaw_angle - ideal_angle)
        angle_score = max(0, 10 - (angle_deviation / 5))

        # Jaw width relative to face
        width_score = 7.0  # Placeholder

        return (angle_score * 0.6 + width_score * 0.4)

    def _score_eyes(self, metrics: FaceMetrics) -> float:
        """Score eye area (0-10)."""
        # Eye spacing score (ideal ~0.46)
        spacing_deviation = abs(metrics.eye_spacing - self.IDEALS['eye_spacing'])
        spacing_score = max(0, 10 - (spacing_deviation * 50))

        # Canthal tilt score (slight positive is ideal)
        tilt_ideal = self.IDEALS['canthal_tilt']
        tilt_deviation = abs(metrics.canthal_tilt - tilt_ideal)
        tilt_score = max(0, 10 - (tilt_deviation / 2))

        return (spacing_score * 0.5 + tilt_score * 0.5)

    def _score_nose(self, metrics: FaceMetrics) -> float:
        """Score nose proportions (0-10)."""
        # Nose width ratio (ideal ~1.0)
        width_deviation = abs(metrics.nose_width_ratio - self.IDEALS['nose_ratio'])
        width_score = max(0, 10 - (width_deviation * 10))

        # Nose length ratio
        length_score = 7.5  # Placeholder

        return (width_score * 0.6 + length_score * 0.4)

    def _score_facial_thirds(self, metrics: FaceMetrics) -> float:
        """Score facial thirds balance (0-10)."""
        ideal = self.IDEALS['thirds_ratio']
        actual = metrics.thirds_ratio

        # Calculate deviation from ideal
        deviation = sum(abs(a - i) for a, i in zip(actual, ideal))
        score = max(0, 10 - (deviation * 15))

        return score

    def _calculate_harmony_bonus(self, features: Dict[str, FeatureScore]) -> float:
        """Calculate bonus for overall facial harmony."""
        scores = [f.score for f in features.values()]
        variance = np.var(scores)

        # Lower variance = more harmonious = higher bonus
        harmony = max(0, 0.5 - (variance * 0.1))
        return harmony

    def _score_to_percentile(self, score: float) -> int:
        """Convert score (0-10) to percentile (0-100)."""
        # Approximation based on normal distribution
        percentiles = {
            10.0: 99, 9.5: 98, 9.0: 95, 8.5: 90,
            8.0: 85, 7.5: 75, 7.0: 60, 6.5: 50,
            6.0: 40, 5.5: 30, 5.0: 20, 4.5: 10,
            4.0: 5, 3.0: 2, 2.0: 1, 0.0: 0,
        }

        for threshold, percentile in sorted(percentiles.items(), reverse=True):
            if score >= threshold:
                return percentile
        return 0

    # Description generators
    def _get_symmetry_description(self, score: float) -> str:
        if score >= 8.5:
            return "Excellent bilateral symmetry, one of your strongest features"
        if score >= 7.0:
            return "Good facial symmetry with minor variations"
        if score >= 5.5:
            return "Average symmetry with noticeable but normal variations"
        return "Below average symmetry, common and can be balanced with styling"

    def _get_jawline_description(self, score: float) -> str:
        if score >= 8.5:
            return "Well-defined jawline with excellent angularity"
        if score >= 7.0:
            return "Good jaw definition with room for enhancement"
        if score >= 5.5:
            return "Average jaw definition, exercises may help"
        return "Soft jawline, significant improvement potential with lifestyle changes"

    def _get_eye_description(self, score: float, tilt: float) -> str:
        tilt_desc = "positive" if tilt > 2 else "neutral" if tilt > -2 else "negative"
        if score >= 8.5:
            return f"Excellent eye proportions with {tilt_desc} canthal tilt"
        if score >= 7.0:
            return f"Good eye area with {tilt_desc} canthal tilt"
        return f"Average eye proportions with {tilt_desc} canthal tilt"

    def _get_nose_description(self, score: float) -> str:
        if score >= 8.0:
            return "Well-proportioned nose that complements other features"
        if score >= 6.5:
            return "Good nose proportions with minor variations"
        return "Nose proportions differ from classical ideals"

    def _get_thirds_description(self, score: float, ratio: Tuple) -> str:
        upper, middle, lower = [r * 100 for r in ratio]
        if score >= 8.0:
            return f"Excellent facial balance ({upper:.0f}% / {middle:.0f}% / {lower:.0f}%)"
        if score >= 6.5:
            return f"Good facial proportions ({upper:.0f}% / {middle:.0f}% / {lower:.0f}%)"
        return f"Uneven facial thirds ({upper:.0f}% / {middle:.0f}% / {lower:.0f}%)"

    def _get_skin_description(self, score: float) -> str:
        if score >= 8.5:
            return "Excellent skin clarity and texture"
        if score >= 7.0:
            return "Good skin quality with minor imperfections"
        if score >= 5.5:
            return "Average skin, would benefit from skincare routine"
        return "Skin quality needs attention, significant improvement possible"


# Singleton instance
_scorer: FaceScorer = FaceScorer()


def get_scorer() -> FaceScorer:
    """Get singleton FaceScorer instance."""
    return _scorer
