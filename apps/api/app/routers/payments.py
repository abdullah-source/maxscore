"""
Payments router - Stripe integration.
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class CheckoutRequest(BaseModel):
    price_id: str
    success_url: Optional[str] = "https://maxscore.app/dashboard?success=true"
    cancel_url: Optional[str] = "https://maxscore.app/pricing"


class CheckoutResponse(BaseModel):
    url: str
    session_id: str


class PortalResponse(BaseModel):
    url: str


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(request: CheckoutRequest):
    """
    Create a Stripe Checkout session for subscription.
    """
    # In production, use Stripe SDK:
    # session = stripe.checkout.Session.create(...)

    return CheckoutResponse(
        url="https://checkout.stripe.com/demo-session",
        session_id="cs_demo_session_id",
    )


@router.get("/portal", response_model=PortalResponse)
async def get_billing_portal():
    """
    Get Stripe Customer Portal URL for subscription management.
    """
    # In production, use Stripe SDK:
    # portal = stripe.billing_portal.Session.create(...)

    return PortalResponse(
        url="https://billing.stripe.com/demo-portal",
    )


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    # In production, verify webhook signature and process events
    logger.info(f"Received Stripe webhook")

    return {"status": "received"}


@router.get("/subscription")
async def get_subscription_status():
    """
    Get current subscription status.
    """
    return {
        "tier": "FREE",
        "status": "active",
        "scans_today": 0,
        "scans_limit": 1,
        "features": {
            "unlimited_scans": False,
            "detailed_metrics": False,
            "unlimited_chat": False,
            "progress_tracking": False,
            "export_pdf": False,
        },
        "upgrade_url": "/pricing",
    }
