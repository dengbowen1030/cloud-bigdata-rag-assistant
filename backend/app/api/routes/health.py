from fastapi import APIRouter

from app.api.schemas import ApiResponse
from app.utils.responses import success_response

router = APIRouter(tags=["health"])


@router.get("/health", response_model=ApiResponse)
def health_check():
    return success_response({"status": "ok"})

