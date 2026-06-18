import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, List, Optional

from sqlalchemy import select

from app.api.schemas import Document
from app.core.settings import settings
from app.database import SessionLocal
from app.models import ChunkModel, DocumentModel
from rag.document_loader import DocumentProcessingError, load_document
from rag.embedding import EmbeddingProvider
from rag.text_splitter import DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE, split_text, validate_chunks
from rag.vector_store import FaissVectorStore


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _safe_filename(filename: str) -> str:
    name = Path(filename or "unknown").name.strip()
    name = re.sub(r"[\\/:*?\"<>|]+", "_", name)
    return name or "unknown"


def _to_schema(document: DocumentModel) -> Document:
    return Document(
        document_id=document.document_id,
        filename=document.filename,
        file_type=document.file_type,
        file_size=document.file_size,
        status=document.status,
        chunk_count=document.chunk_count,
        created_at=document.created_at,
    )


def _chunk_to_dict(chunk: ChunkModel) -> dict[str, Any]:
    return {
        "chunk_id": chunk.chunk_id,
        "document_id": chunk.document_id,
        "filename": chunk.filename,
        "page": chunk.page,
        "chunk_index": chunk.chunk_index,
        "content": chunk.content,
        "metadata": json.loads(chunk.metadata_json),
    }


def _next_id(prefix: str, existing_ids: list[str]) -> str:
    max_number = 0
    marker = f"{prefix}_"
    for item_id in existing_ids:
        if item_id.startswith(marker):
            suffix = item_id.removeprefix(marker)
            if suffix.isdigit():
                max_number = max(max_number, int(suffix))
    return f"{prefix}_{max_number + 1:03d}"


def _next_document_id() -> str:
    with SessionLocal() as db:
        document_ids = db.scalars(select(DocumentModel.document_id)).all()
    return _next_id("doc", list(document_ids))


def _raw_document_dir(document_id: str) -> Path:
    return Path(settings.upload_dir) / document_id


def _raw_document_path(document_id: str, filename: str) -> Path:
    return _raw_document_dir(document_id) / _safe_filename(filename)


def _processed_json_path(document_id: str) -> Path:
    return Path(settings.processed_dir) / f"{document_id}.json"


def _find_raw_file(document: DocumentModel) -> Path:
    path = _raw_document_path(document.document_id, document.filename)
    if not path.exists():
        raise DocumentProcessingError(f"Raw file not found for document {document.document_id}: {path}")
    return path


def _load_all_chunk_dicts_except(document_id: str) -> list[dict[str, Any]]:
    with SessionLocal() as db:
        chunks = db.scalars(
            select(ChunkModel)
            .where(ChunkModel.document_id != document_id)
            .order_by(ChunkModel.document_id, ChunkModel.chunk_index)
        ).all()
        return [_chunk_to_dict(chunk) for chunk in chunks]


def _save_processed_json(document: DocumentModel, chunks: list[dict[str, Any]]) -> None:
    output_path = _processed_json_path(document.document_id)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"document": _to_schema(document).model_dump(), "chunks": chunks}
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def create_uploaded_document(filename: str, file_size: int, file_type: str, content: bytes | None = None) -> Document:
    safe_filename = _safe_filename(filename)
    document_id = _next_document_id()

    if content is not None:
        target_path = _raw_document_path(document_id, safe_filename)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_bytes(content)

    document = DocumentModel(
        document_id=document_id,
        filename=safe_filename,
        file_type=file_type,
        file_size=file_size,
        status="uploaded",
        chunk_count=0,
        created_at=_utc_now(),
    )
    with SessionLocal() as db:
        db.add(document)
        db.commit()
        db.refresh(document)
        return _to_schema(document)


def list_documents() -> List[Document]:
    with SessionLocal() as db:
        documents = db.scalars(select(DocumentModel).order_by(DocumentModel.created_at.desc())).all()
        return [_to_schema(document) for document in documents]


def delete_document(document_id: str) -> bool:
    with SessionLocal() as db:
        document = db.get(DocumentModel, document_id)
        if document is None:
            return False
        db.query(ChunkModel).filter(ChunkModel.document_id == document_id).delete()
        db.delete(document)
        db.commit()

    shutil.rmtree(_raw_document_dir(document_id), ignore_errors=True)
    _processed_json_path(document_id).unlink(missing_ok=True)
    return True


def rebuild_document(document_id: str) -> Optional[dict]:
    with SessionLocal() as db:
        document = db.get(DocumentModel, document_id)
        if document is None:
            return None

    try:
        raw_path = _find_raw_file(document)
        loaded_document, raw_text, segments = load_document(raw_path, document_id=document_id)
        loaded_document["filename"] = document.filename
        chunks = split_text(
            document=loaded_document,
            raw_text=raw_text,
            segments=segments,
            chunk_size=DEFAULT_CHUNK_SIZE,
            chunk_overlap=DEFAULT_CHUNK_OVERLAP,
        )
        validate_chunks(chunks)

        all_chunks = _load_all_chunk_dicts_except(document_id) + chunks
        provider = EmbeddingProvider(
            model_name=settings.rag_embedding_model_path,
            mode=settings.rag_embedding_mode,
        )
        store = FaissVectorStore(embedding_provider=provider)
        store.build_index(all_chunks)
        store.save(settings.vector_store_dir)

        with SessionLocal() as db:
            document = db.get(DocumentModel, document_id)
            if document is None:
                return None
            db.query(ChunkModel).filter(ChunkModel.document_id == document_id).delete()
            now = _utc_now()
            for chunk in chunks:
                db.add(
                    ChunkModel(
                        chunk_id=chunk["chunk_id"],
                        document_id=chunk["document_id"],
                        filename=chunk["filename"],
                        page=chunk.get("page"),
                        chunk_index=chunk["chunk_index"],
                        content=chunk["content"],
                        metadata_json=json.dumps(chunk.get("metadata") or {}, ensure_ascii=False),
                        created_at=now,
                    )
                )
            document.status = "processed"
            document.chunk_count = len(chunks)
            db.commit()
            db.refresh(document)
            _save_processed_json(document, chunks)
            return {
                "document_id": document.document_id,
                "chunk_count": document.chunk_count,
                "status": document.status,
            }
    except Exception:
        with SessionLocal() as db:
            document = db.get(DocumentModel, document_id)
            if document is not None:
                document.status = "failed"
                db.commit()
        raise
