from typing import Optional

from pydantic import BaseModel


class Stats(BaseModel):
    document_count: int
    chunk_count: int
    question_count: int
    latest_question_time: Optional[str] = None

