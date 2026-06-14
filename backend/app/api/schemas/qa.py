from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class RetrievedSource(BaseModel):
    filename: str
    page: Optional[int] = None
    chunk_index: int


class RetrievedChunk(BaseModel):
    chunk_id: str
    document_id: str
    content: str
    score: float
    source: RetrievedSource


class ChatQuery(BaseModel):
    question: str
    top_k: int = Field(default=5, ge=1, le=10)


class ChatSource(BaseModel):
    filename: str
    page: Optional[int] = None
    chunk_index: int
    score: float
    preview: str


class ChatAnswer(BaseModel):
    question: str
    answer: str
    sources: List[ChatSource]
    model: Literal["deepseek", "qwen"]
    created_at: str

