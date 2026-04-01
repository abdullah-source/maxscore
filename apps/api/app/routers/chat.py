"""
Chat router - AI-powered conversations about facial analysis.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import logging

from app.services.llm_client import get_llm_client
from app.services.scorer import OverallScore, FeatureScore

logger = logging.getLogger(__name__)
router = APIRouter()


# Request/Response models
class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    created_at: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    scan_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    remaining_messages: int
    suggestions: List[str]


class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessage]
    remaining_messages: int


# In-memory storage for demo
_chat_sessions: dict = {}
_message_limit = 3  # Free tier limit


def _get_demo_scores() -> OverallScore:
    """Get demo scores for testing."""
    return OverallScore(
        overall=7.8,
        percentile=82,
        features={
            'symmetry': FeatureScore(
                name='Symmetry',
                score=8.4,
                percentile=88,
                description='Excellent bilateral symmetry',
                improvement_potential='Low',
            ),
            'jawline': FeatureScore(
                name='Jawline',
                score=6.9,
                percentile=72,
                description='Good jaw definition with room for enhancement',
                improvement_potential='High',
            ),
            'eye_area': FeatureScore(
                name='Eye Area',
                score=8.1,
                percentile=85,
                description='Excellent eye proportions',
                improvement_potential='Low',
            ),
            'nose': FeatureScore(
                name='Nose',
                score=7.2,
                percentile=75,
                description='Good nose proportions',
                improvement_potential='Medium',
            ),
            'facial_thirds': FeatureScore(
                name='Facial Thirds',
                score=7.8,
                percentile=80,
                description='Good facial balance',
                improvement_potential='Low',
            ),
            'skin': FeatureScore(
                name='Skin Quality',
                score=8.0,
                percentile=83,
                description='Good skin quality',
                improvement_potential='Medium',
            ),
        },
        strengths=['symmetry', 'eye_area'],
        areas_to_improve=['jawline', 'nose'],
    )


@router.post("/", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message to the AI advisor and get a response.
    Limited to 3 messages for free tier.
    """
    session_id = request.scan_id or "default"

    # Initialize session if needed
    if session_id not in _chat_sessions:
        _chat_sessions[session_id] = {
            "messages": [],
            "message_count": 0,
        }

    session = _chat_sessions[session_id]

    # Check message limit
    if session["message_count"] >= _message_limit:
        raise HTTPException(
            status_code=403,
            detail="Message limit reached. Upgrade to Pro for unlimited chat.",
        )

    # Add user message to history
    user_message = ChatMessage(
        role="user",
        content=request.message,
        created_at=datetime.utcnow(),
    )
    session["messages"].append(user_message.model_dump())

    # Get AI response
    llm_client = get_llm_client()
    scores = _get_demo_scores()  # In production, fetch from database

    # Format history for LLM
    history = [
        {"role": m["role"], "content": m["content"]}
        for m in session["messages"]
    ]

    try:
        response = await llm_client.chat(
            message=request.message,
            scores=scores,
            history=history[:-1],  # Exclude current message (already in prompt)
        )

        # Add assistant response to history
        assistant_message = ChatMessage(
            role="assistant",
            content=response.content,
            created_at=datetime.utcnow(),
        )
        session["messages"].append(assistant_message.model_dump())
        session["message_count"] += 1

        return ChatResponse(
            reply=response.content,
            remaining_messages=_message_limit - session["message_count"],
            suggestions=response.suggestions,
        )

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response")


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(scan_id: Optional[str] = None):
    """
    Get chat history for a scan.
    """
    session_id = scan_id or "default"

    if session_id not in _chat_sessions:
        return ChatHistoryResponse(
            messages=[],
            remaining_messages=_message_limit,
        )

    session = _chat_sessions[session_id]

    return ChatHistoryResponse(
        messages=[ChatMessage(**m) for m in session["messages"]],
        remaining_messages=_message_limit - session["message_count"],
    )


@router.delete("/history")
async def clear_chat_history(scan_id: Optional[str] = None):
    """
    Clear chat history for a scan.
    """
    session_id = scan_id or "default"

    if session_id in _chat_sessions:
        del _chat_sessions[session_id]

    return {"status": "cleared"}
