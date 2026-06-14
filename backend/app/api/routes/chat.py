from fastapi import APIRouter

from app.api.schemas import ApiResponse, ChatQuery
from app.services.qa_service import answer_query
from app.utils.responses import success_response

router = APIRouter(tags=["chat"])


@router.post("/chat/query", response_model=ApiResponse)
def query_chat(query: ChatQuery):
    return success_response(answer_query(query))

