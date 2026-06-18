from pydantic import BaseModel


class QaLog(BaseModel):
    log_id: str
    question: str
    answer: str
    source_count: int
    model: str
    created_at: str

