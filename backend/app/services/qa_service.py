from datetime import datetime

from app.api.schemas import ChatAnswer, ChatQuery


def _utc_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat()


def answer_query(query: ChatQuery) -> ChatAnswer:
    return ChatAnswer(
        question=query.question,
        answer="当前知识库中没有足够依据回答该问题。",
        sources=[],
        model="deepseek",
        created_at=_utc_now(),
    )

