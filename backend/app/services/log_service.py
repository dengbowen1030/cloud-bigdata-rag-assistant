from datetime import datetime
from typing import List

from app.api.schemas import QaLog


def _utc_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat()


def list_logs() -> List[QaLog]:
    return [
        QaLog(
            log_id="log_001",
            question="软件开发周期是什么？",
            answer="当前为后端占位数据，真实问答结果由 D 的 RAG QA 模块接入后返回。",
            source_count=0,
            model="deepseek",
            created_at=_utc_now(),
        )
    ]

