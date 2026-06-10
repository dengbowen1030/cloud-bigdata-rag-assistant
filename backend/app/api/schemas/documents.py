from typing import Dict, Literal, Optional

from pydantic import BaseModel


class Document(BaseModel):
    document_id: str
    filename: str
    file_type: str
    file_size: int
    status: Literal["uploaded", "processing", "processed", "failed"]
    chunk_count: int
    created_at: str


class Chunk(BaseModel):
    chunk_id: str
    document_id: str
    filename: str
    page: Optional[int] = None
    chunk_index: int
    content: str
    metadata: Dict[str, Optional[str]]

