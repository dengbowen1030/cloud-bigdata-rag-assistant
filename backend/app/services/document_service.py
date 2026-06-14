from datetime import datetime
from typing import Dict, List, Optional

from app.api.schemas import Document

_documents: Dict[str, Document] = {}


def _utc_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat()


def create_uploaded_document(filename: str, file_size: int, file_type: str) -> Document:
    document_id = f"doc_{len(_documents) + 1:03d}"
    document = Document(
        document_id=document_id,
        filename=filename,
        file_type=file_type,
        file_size=file_size,
        status="uploaded",
        chunk_count=0,
        created_at=_utc_now(),
    )
    _documents[document_id] = document
    return document


def list_documents() -> List[Document]:
    return list(_documents.values())


def delete_document(document_id: str) -> bool:
    return _documents.pop(document_id, None) is not None


def rebuild_document(document_id: str) -> Optional[dict]:
    document = _documents.get(document_id)
    if document is None:
        return None
    updated = document.copy(update={"status": "processed", "chunk_count": document.chunk_count})
    _documents[document_id] = updated
    return {
        "document_id": document_id,
        "chunk_count": updated.chunk_count,
        "status": updated.status,
    }

