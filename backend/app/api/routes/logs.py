from fastapi import APIRouter

from app.api.schemas import ApiResponse
from app.services.log_service import list_logs
from app.utils.responses import success_response

router = APIRouter(tags=["logs"])


@router.get("/logs", response_model=ApiResponse)
def get_logs():
    return success_response(list_logs())

