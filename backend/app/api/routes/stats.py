from fastapi import APIRouter

from app.api.schemas import ApiResponse
from app.services.stats_service import get_stats
from app.utils.responses import success_response

router = APIRouter(tags=["stats"])


@router.get("/stats", response_model=ApiResponse)
def read_stats():
    return success_response(get_stats())

