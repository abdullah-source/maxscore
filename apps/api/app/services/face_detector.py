"""
Face detection and landmark extraction using MediaPipe.
"""

import cv2
import numpy as np
import mediapipe as mp
from dataclasses import dataclass
from typing import List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


@dataclass
class FaceLandmarks:
    """Container for face landmark data."""
    landmarks: List[Tuple[float, float, float]]
    face_bbox: Tuple[int, int, int, int]  # x, y, w, h
    confidence: float


@dataclass
class FaceMetrics:
    """Extracted facial measurements."""
    # Symmetry
    symmetry_score: float
    left_right_ratio: float

    # Facial thirds
    upper_third: float  # Hairline to brow
    middle_third: float  # Brow to nose base
    lower_third: float  # Nose base to chin
    thirds_ratio: Tuple[float, float, float]

    # Eye measurements
    eye_spacing: float  # Interpupillary distance ratio
    eye_width_ratio: float
    canthal_tilt: float  # Angle of eye corners

    # Nose measurements
    nose_width_ratio: float  # Nose width / intercanthal distance
    nose_length_ratio: float

    # Jawline
    jaw_width: float
    jaw_angle: float
    gonial_angle: float

    # Overall proportions
    face_width_height_ratio: float
    golden_ratio_score: float


class FaceDetector:
    """MediaPipe-based face detection and analysis."""

    # Key landmark indices for facial analysis
    LANDMARKS = {
        # Eyes
        'left_eye_outer': 33,
        'left_eye_inner': 133,
        'right_eye_outer': 362,
        'right_eye_inner': 263,
        'left_pupil': 468,
        'right_pupil': 473,

        # Nose
        'nose_tip': 1,
        'nose_bridge': 6,
        'nose_left': 129,
        'nose_right': 358,

        # Mouth
        'mouth_left': 61,
        'mouth_right': 291,
        'upper_lip': 0,
        'lower_lip': 17,

        # Face contour
        'chin': 152,
        'left_cheek': 234,
        'right_cheek': 454,
        'forehead': 10,

        # Jaw
        'left_jaw': 172,
        'right_jaw': 397,
        'left_gonion': 136,
        'right_gonion': 365,
    }

    def __init__(self):
        """Initialize MediaPipe Face Mesh."""
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7,
        )
        logger.info("FaceDetector initialized with MediaPipe")

    def detect_face(self, image: np.ndarray) -> Optional[FaceLandmarks]:
        """
        Detect face and extract landmarks from an image.

        Args:
            image: BGR image as numpy array

        Returns:
            FaceLandmarks object or None if no face detected
        """
        # Convert to RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        h, w = image.shape[:2]

        # Process with MediaPipe
        results = self.face_mesh.process(rgb_image)

        if not results.multi_face_landmarks:
            logger.warning("No face detected in image")
            return None

        # Get first face
        face_landmarks = results.multi_face_landmarks[0]

        # Convert to list of (x, y, z) tuples
        landmarks = [
            (lm.x * w, lm.y * h, lm.z * w)
            for lm in face_landmarks.landmark
        ]

        # Calculate bounding box
        x_coords = [lm[0] for lm in landmarks]
        y_coords = [lm[1] for lm in landmarks]
        x_min, x_max = int(min(x_coords)), int(max(x_coords))
        y_min, y_max = int(min(y_coords)), int(max(y_coords))

        return FaceLandmarks(
            landmarks=landmarks,
            face_bbox=(x_min, y_min, x_max - x_min, y_max - y_min),
            confidence=0.95,  # MediaPipe doesn't provide direct confidence
        )

    def extract_metrics(self, landmarks: FaceLandmarks) -> FaceMetrics:
        """
        Extract facial measurements from landmarks.

        Args:
            landmarks: FaceLandmarks object

        Returns:
            FaceMetrics with all measurements
        """
        lm = landmarks.landmarks

        # Helper function to get landmark by name
        def get_lm(name: str) -> Tuple[float, float, float]:
            return lm[self.LANDMARKS[name]]

        # Helper function to calculate distance
        def distance(p1: Tuple, p2: Tuple) -> float:
            return np.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

        # === Symmetry Analysis ===
        # Compare left and right side distances
        left_eye_to_nose = distance(get_lm('left_eye_inner'), get_lm('nose_tip'))
        right_eye_to_nose = distance(get_lm('right_eye_inner'), get_lm('nose_tip'))
        left_right_ratio = min(left_eye_to_nose, right_eye_to_nose) / max(left_eye_to_nose, right_eye_to_nose)

        # Calculate symmetry score (0-10)
        symmetry_deviation = abs(1 - left_right_ratio)
        symmetry_score = max(0, 10 - (symmetry_deviation * 50))

        # === Facial Thirds ===
        forehead = get_lm('forehead')
        nose_bridge = get_lm('nose_bridge')
        nose_tip = get_lm('nose_tip')
        chin = get_lm('chin')

        upper_third = distance(forehead, nose_bridge)
        middle_third = distance(nose_bridge, nose_tip)
        lower_third = distance(nose_tip, chin)
        total_height = upper_third + middle_third + lower_third

        thirds_ratio = (
            upper_third / total_height,
            middle_third / total_height,
            lower_third / total_height,
        )

        # === Eye Measurements ===
        left_pupil = get_lm('left_pupil')
        right_pupil = get_lm('right_pupil')
        ipd = distance(left_pupil, right_pupil)  # Interpupillary distance
        face_width = landmarks.face_bbox[2]
        eye_spacing = ipd / face_width if face_width > 0 else 0.46

        # Eye width ratio
        left_eye_width = distance(get_lm('left_eye_outer'), get_lm('left_eye_inner'))
        eye_width_ratio = left_eye_width / ipd if ipd > 0 else 0.5

        # Canthal tilt (positive = hunter eyes)
        left_outer = get_lm('left_eye_outer')
        left_inner = get_lm('left_eye_inner')
        canthal_tilt = np.degrees(np.arctan2(
            left_inner[1] - left_outer[1],
            left_inner[0] - left_outer[0]
        ))

        # === Nose Measurements ===
        nose_width = distance(get_lm('nose_left'), get_lm('nose_right'))
        intercanthal = distance(get_lm('left_eye_inner'), get_lm('right_eye_inner'))
        nose_width_ratio = nose_width / intercanthal if intercanthal > 0 else 1.0
        nose_length_ratio = distance(nose_bridge, nose_tip) / total_height if total_height > 0 else 0.33

        # === Jawline ===
        jaw_width = distance(get_lm('left_jaw'), get_lm('right_jaw'))
        jaw_angle = np.degrees(np.arctan2(
            get_lm('chin')[1] - get_lm('left_gonion')[1],
            get_lm('chin')[0] - get_lm('left_gonion')[0]
        ))

        # Gonial angle (angle at jaw corner)
        gonial_angle = 128  # Placeholder - would need more precise calculation

        # === Overall Proportions ===
        face_height = landmarks.face_bbox[3]
        face_width_height_ratio = face_width / face_height if face_height > 0 else 1.0

        # Golden ratio analysis
        phi = 1.618
        golden_ratio_score = 10 - abs(face_width_height_ratio - (1/phi)) * 10
        golden_ratio_score = max(0, min(10, golden_ratio_score))

        return FaceMetrics(
            symmetry_score=symmetry_score,
            left_right_ratio=left_right_ratio,
            upper_third=upper_third,
            middle_third=middle_third,
            lower_third=lower_third,
            thirds_ratio=thirds_ratio,
            eye_spacing=eye_spacing,
            eye_width_ratio=eye_width_ratio,
            canthal_tilt=canthal_tilt,
            nose_width_ratio=nose_width_ratio,
            nose_length_ratio=nose_length_ratio,
            jaw_width=jaw_width,
            jaw_angle=jaw_angle,
            gonial_angle=gonial_angle,
            face_width_height_ratio=face_width_height_ratio,
            golden_ratio_score=golden_ratio_score,
        )

    def close(self):
        """Clean up resources."""
        self.face_mesh.close()


# Singleton instance
_detector: Optional[FaceDetector] = None


def get_detector() -> FaceDetector:
    """Get or create singleton FaceDetector instance."""
    global _detector
    if _detector is None:
        _detector = FaceDetector()
    return _detector
