"""
Chat router - AI-powered conversations using Claude.
Lightweight version that does not import the heavy scoring/ML modules.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging
import anthropic

from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


SYSTEM_PROMPT = """You are MaxScore AI, a friendly and knowledgeable beauty and self-improvement advisor.
Your role is to provide personalized, actionable advice based on facial analysis results.

COMMUNICATION STYLE:
- Be encouraging and positive - focus on potential, not flaws
- Use empowering language: "enhance", "optimize", "maximize" instead of "fix", "correct"
- Be specific and actionable - give concrete steps
- Acknowledge what's already working well before suggesting improvements
- Frame improvements as opportunities, not necessities
- Use inclusive language that works for all genders
- Back up advice with brief explanations of why it works

PSYCHOLOGICAL PRINCIPLES:
- Start responses with validation of strengths
- Frame suggestions as "quick wins" when possible
- Provide options rather than demands
- End on an encouraging, forward-looking note

AVOID:
- Negative language about appearance
- Unrealistic promises or timelines
- Pushing expensive procedures as first options
- Body shaming or comparison to others
- Medical advice - suggest consulting professionals for medical concerns"""


class ChatMessage(BaseModel):
    role: str
    content: str
    created_at: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    scan_id: Optional[str] = None
    history: Optional[List[dict]] = None


class ChatResponse(BaseModel):
    reply: str
    remaining_messages: int
    tokens_used: int = 0


_chat_sessions: dict = {}
_message_limit = 3

_client: Optional[anthropic.Anthropic] = None


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        if not settings.ANTHROPIC_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="ANTHROPIC_API_KEY is not configured on the server",
            )
        _client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


@router.post("/", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Send a message to the AI advisor and get a response."""
    session_id = request.scan_id or "default"

    if session_id not in _chat_sessions:
        _chat_sessions[session_id] = {"messages": [], "message_count": 0}

    session = _chat_sessions[session_id]

    if session["message_count"] >= _message_limit:
        raise HTTPException(
            status_code=403,
            detail="Message limit reached. Upgrade to Pro for unlimited chat.",
        )

    history_messages = [
        {"role": m["role"], "content": m["content"]}
        for m in session["messages"]
    ]
    history_messages.append({"role": "user", "content": request.message})

    try:
        client = get_client()
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=history_messages,
        )

        reply = response.content[0].text
        tokens = response.usage.input_tokens + response.usage.output_tokens

        session["messages"].append({"role": "user", "content": request.message})
        session["messages"].append({"role": "assistant", "content": reply})
        session["message_count"] += 1

        return ChatResponse(
            reply=reply,
            remaining_messages=_message_limit - session["message_count"],
            tokens_used=tokens,
        )

    except anthropic.APIError as e:
        logger.error(f"Anthropic API error: {e}")
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response")


@router.get("/history")
async def get_chat_history(scan_id: Optional[str] = None):
    """Get chat history for a scan."""
    session_id = scan_id or "default"

    if session_id not in _chat_sessions:
        return {"messages": [], "remaining_messages": _message_limit}

    session = _chat_sessions[session_id]
    return {
        "messages": session["messages"],
        "remaining_messages": _message_limit - session["message_count"],
    }


@router.delete("/history")
async def clear_chat_history(scan_id: Optional[str] = None):
    """Clear chat history."""
    session_id = scan_id or "default"
    if session_id in _chat_sessions:
        del _chat_sessions[session_id]
    return {"status": "cleared"}
