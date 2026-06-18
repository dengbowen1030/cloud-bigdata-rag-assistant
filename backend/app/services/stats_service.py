from sqlalchemy import func, select

from app.api.schemas import Stats
from app.database import SessionLocal
from app.models import DocumentModel, QaLogModel


def get_stats() -> Stats:
    with SessionLocal() as db:
        document_count = db.scalar(select(func.count()).select_from(DocumentModel)) or 0
        chunk_count = db.scalar(select(func.coalesce(func.sum(DocumentModel.chunk_count), 0))) or 0
        question_count = db.scalar(select(func.count()).select_from(QaLogModel)) or 0
        latest_question_time = db.scalar(select(func.max(QaLogModel.created_at)))

    return Stats(
        document_count=int(document_count),
        chunk_count=int(chunk_count),
        question_count=int(question_count),
        latest_question_time=latest_question_time,
    )
