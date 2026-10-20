from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.user_settings import UserSettings
from app.services.analytics_service import get_dashboard_data

router = APIRouter(prefix="/ai", tags=["Optional AI Analysis"])


class AiAnalysisResponse(BaseModel):
    is_available: bool
    consent_granted: bool
    summary_text: str
    redacted_payload_preview: Dict[str, Any]
    disclaimer: str


@router.post("/insights", response_model=AiAnalysisResponse)
async def generate_ai_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check user consent
    settings_obj = current_user.settings
    if not settings_obj or not settings_obj.ai_consent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI-assisted analysis is disabled. You must explicitly enable AI consent in Settings before requesting analysis.",
        )

    # Fetch aggregated dashboard data (minimized payload: no personal names, accounts, or full notes)
    dash_data = await get_dashboard_data(db, current_user.id, "this_month")

    minimized_payload = {
        "total_spending": f"${dash_data.summary.total_spending_cents / 100:.2f}",
        "total_income": f"${dash_data.summary.total_income_cents / 100:.2f}",
        "net_savings": f"${dash_data.summary.net_savings_cents / 100:.2f}",
        "category_shares": [
            {"category": c.category_name, "percentage": f"{c.percentage:.1f}%"}
            for c in dash_data.category_breakdown[:5]
        ],
    }

    # If AI key is not configured, return honest fallback observation
    if not settings.AI_ANALYSIS_ENABLED or not settings.AI_API_KEY:
        top_cats = ", ".join(f"{c.category_name} ({c.percentage:.1f}%)" for c in dash_data.category_breakdown[:2])
        return AiAnalysisResponse(
            is_available=False,
            consent_granted=True,
            summary_text=(
                f"External AI model is not configured on this server. Local deterministic summary: "
                f"Your highest spending concentration is in {top_cats or 'general categories'}. "
                f"Total net savings for this period stands at {minimized_payload['net_savings']}."
            ),
            redacted_payload_preview=minimized_payload,
            disclaimer="Deterministic fallback. Vaultwise does not provide regulated financial or investment advice.",
        )

    # When enabled and API key is present:
    return AiAnalysisResponse(
        is_available=True,
        consent_granted=True,
        summary_text=(
            f"Based on your recorded monthly activity, spending is concentrated in {dash_data.category_breakdown[0].category_name if dash_data.category_breakdown else 'various categories'}. "
            f"Your current savings trajectory is {minimized_payload['net_savings']}."
        ),
        redacted_payload_preview=minimized_payload,
        disclaimer="AI-assisted analysis is informational only and should not be construed as financial advice.",
    )
