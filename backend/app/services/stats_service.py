from app.api.schemas import Stats
from app.services.document_service import list_documents
from app.services.log_service import list_logs


def get_stats() -> Stats:
    documents = list_documents()
    logs = list_logs()
    return Stats(
        document_count=len(documents),
        chunk_count=sum(document.chunk_count for document in documents),
        question_count=len(logs),
        latest_question_time=logs[-1].created_at if logs else None,
    )

