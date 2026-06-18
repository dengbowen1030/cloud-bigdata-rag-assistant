from pathlib import Path

from app.api.schemas import ChatAnswer, ChatQuery
from app.core.settings import settings
from app.services.log_service import create_qa_log
from rag.qa_chain import answer_question, refusal_answer
from rag.retriever import retrieve


class VectorIndexNotReadyError(RuntimeError):
    """Raised when FAISS index files are missing."""


def _ensure_vector_index_ready() -> None:
    vector_dir = Path(settings.vector_store_dir)
    index_path = vector_dir / "index.faiss"
    metadata_path = vector_dir / "metadata.json"
    if not index_path.exists() or not metadata_path.exists():
        raise VectorIndexNotReadyError(
            "FAISS index is not ready. Please upload documents and rebuild the vector index first."
        )


def _save_chat_log(answer: ChatAnswer) -> None:
    create_qa_log(
        question=answer.question,
        answer=answer.answer,
        source_count=len(answer.sources),
        model=answer.model,
        created_at=answer.created_at,
    )


def answer_query(query: ChatQuery) -> ChatAnswer:
    question = query.question.strip()
    if not question:
        answer = ChatAnswer(**refusal_answer(query.question, model=settings.llm_provider))
        _save_chat_log(answer)
        return answer

    _ensure_vector_index_ready()

    retrieved_chunks = retrieve(
        question,
        top_k=query.top_k,
        index_dir=settings.vector_store_dir,
    )
    if not retrieved_chunks:
        answer = ChatAnswer(**refusal_answer(question, model=settings.llm_provider))
    else:
        answer = ChatAnswer(
            **answer_question(
                question=question,
                retrieved_chunks=retrieved_chunks,
                model=settings.llm_provider,
            )
        )

    _save_chat_log(answer)
    return answer
