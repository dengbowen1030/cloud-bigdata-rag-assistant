from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import select

from app.api.schemas import QaLog
from app.database import SessionLocal
from app.models import QaLogModel


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _to_schema(log: QaLogModel) -> QaLog:
    return QaLog(
        log_id=log.log_id,
        question=log.question,
        answer=log.answer,
        source_count=log.source_count,
        model=log.model,
        created_at=log.created_at,
    )


def _next_log_id() -> str:
    with SessionLocal() as db:
        log_ids = db.scalars(select(QaLogModel.log_id)).all()

    max_number = 0
    for log_id in log_ids:
        if log_id.startswith("log_"):
            suffix = log_id.removeprefix("log_")
            if suffix.isdigit():
                max_number = max(max_number, int(suffix))
    return f"log_{max_number + 1:03d}"


def create_qa_log(
    question: str,
    answer: str,
    source_count: int,
    model: str,
    created_at: Optional[str] = None,
) -> QaLog:
    log = QaLogModel(
        log_id=_next_log_id(),
        question=question,
        answer=answer,
        source_count=source_count,
        model=model,
        created_at=created_at or _utc_now(),
    )
    with SessionLocal() as db:
        db.add(log)
        db.commit()
        db.refresh(log)
        return _to_schema(log)


def list_logs() -> List[QaLog]:
    with SessionLocal() as db:
        logs = db.scalars(select(QaLogModel).order_by(QaLogModel.created_at.desc())).all()
        return [_to_schema(log) for log in logs]
