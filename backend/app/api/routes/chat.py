import logging

from fastapi import APIRouter

from app.api.schemas import ApiResponse, ChatQuery
from app.services.qa_service import VectorIndexNotReadyError, answer_query
from app.utils.responses import failure_response, success_response
from rag.llm_client import LLMProviderUnavailableError

router = APIRouter(tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/chat/query", response_model=ApiResponse)
def query_chat(query: ChatQuery):
    try:
        return success_response(answer_query(query))
    except VectorIndexNotReadyError as exc:
        return failure_response(str(exc), "VECTOR_INDEX_NOT_READY")
    except FileNotFoundError as exc:
        message = str(exc)
        if "FAISS index" in message or "FAISS metadata" in message:
            return failure_response(
                "FAISS index is not ready. Please upload documents and rebuild the vector index first.",
                "VECTOR_INDEX_NOT_READY",
            )
        logger.error("Chat query failed because a local file is missing: %s", message)
        return failure_response(
            "本地 embedding 模型不可用，请检查 models/bge-small-zh-v1.5 或 RAG_EMBEDDING_MODEL_PATH。",
            "QA_CHAIN_FAILED",
        )
    except LLMProviderUnavailableError as exc:
        logger.error("Chat query failed because LLM provider is unavailable: %s", exc)
        return failure_response("大模型服务暂不可用，请检查 LLM_PROVIDER 和对应 API Key。", "LLM_PROVIDER_UNAVAILABLE")
    except Exception as exc:  # pragma: no cover - defensive API envelope guard
        logger.exception("Chat query failed with an unexpected error.")
        return failure_response(f"问答链路执行失败：{exc.__class__.__name__}", "QA_CHAIN_FAILED")
