"""Text cleaning and chunking entrypoint owned by member B.

This module converts parsed document text into contract-compliant Chunk[] data.
It preserves filename, page, chunk_index and metadata.source so C/D/E can trace
retrieval results back to the original course material.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

DEFAULT_CHUNK_SIZE = 650
DEFAULT_CHUNK_OVERLAP = 100

# Keep Chinese/English/digits/common punctuation. This is intentionally broad
# enough for course terms such as RAG, FAISS, API, SQL, C++, 3.1, etc.
_ALLOWED_SYMBOL_PATTERN = re.compile(
    r"[^\u4e00-\u9fff\u3400-\u4dbfA-Za-z0-9\s"
    r"，。！？；：、（）()《》<>【】\[\]{}“”‘’'\".,!?;:\-—_+/\\|@#%&*=~`$^·…]"
)


def clean_text(text: str) -> str:
    """Clean text without destroying paragraph boundaries or course terms."""

    if not text:
        return ""

    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\u00a0", " ").replace("\u3000", " ")
    text = _ALLOWED_SYMBOL_PATTERN.sub(" ", text)

    cleaned_lines: List[str] = []
    blank_seen = False
    for raw_line in text.split("\n"):
        line = re.sub(r"[\t ]+", " ", raw_line).strip()
        if not line:
            if not blank_seen and cleaned_lines:
                cleaned_lines.append("")
                blank_seen = True
            continue
        cleaned_lines.append(line)
        blank_seen = False

    cleaned = "\n".join(cleaned_lines).strip()
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned


def _split_long_text(text: str, chunk_size: int, chunk_overlap: int) -> Iterable[str]:
    """Split one cleaned text block into overlapped chunks."""

    if len(text) <= chunk_size:
        yield text
        return

    separators = ["\n\n", "\n", "。", "！", "？", ";", "；", ",", "，", " "]
    start = 0
    text_len = len(text)

    while start < text_len:
        hard_end = min(start + chunk_size, text_len)
        end = hard_end

        if hard_end < text_len:
            window = text[start:hard_end]
            best_pos = -1
            for sep in separators:
                pos = window.rfind(sep)
                if pos > best_pos and pos >= int(chunk_size * 0.55):
                    best_pos = pos + len(sep)
            if best_pos > 0:
                end = start + best_pos

        chunk = text[start:end].strip()
        if chunk:
            yield chunk

        if end >= text_len:
            break
        start = max(end - chunk_overlap, start + 1)


def _normalize_segments(raw_text: str, segments: Optional[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    if segments:
        return segments
    return [{"text": raw_text, "page": None, "section": None, "segment_index": 1}]


def split_text(
    document: Dict[str, Any],
    raw_text: str,
    segments: Optional[List[Dict[str, Any]]] = None,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> List[Dict[str, Any]]:
    """Clean and split text into contract-compliant Chunk[].

    Args:
        document: Document dict from ``rag.document_loader.load_document``.
        raw_text: Full extracted text. Used when ``segments`` is not provided.
        segments: Optional parsed segments with text/page/section metadata.
        chunk_size: Target chunk length in Chinese characters / Unicode chars.
        chunk_overlap: Overlap length between adjacent chunks.

    Returns:
        Chunk[] matching ``docs/module_contracts.md``.
    """

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if chunk_overlap < 0:
        raise ValueError("chunk_overlap must not be negative")
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be smaller than chunk_size")

    document_id = document["document_id"]
    filename = document["filename"]
    chunks: List[Dict[str, Any]] = []

    for segment in _normalize_segments(raw_text, segments):
        cleaned = clean_text(str(segment.get("text") or ""))
        if not cleaned:
            continue
        page = segment.get("page")
        section = segment.get("section")

        for content in _split_long_text(cleaned, chunk_size=chunk_size, chunk_overlap=chunk_overlap):
            content = content.strip()
            if not content:
                continue
            chunk_index = len(chunks) + 1
            chunks.append(
                {
                    "chunk_id": f"chunk_{document_id}_{chunk_index:04d}",
                    "document_id": document_id,
                    "filename": filename,
                    "page": page,
                    "chunk_index": chunk_index,
                    "content": content,
                    "metadata": {
                        "source": filename,
                        "section": section,
                    },
                }
            )

    return chunks


def validate_chunks(chunks: List[Dict[str, Any]]) -> None:
    """Raise ValueError if chunks do not satisfy the B -> C contract."""

    required_fields = {"chunk_id", "document_id", "filename", "page", "chunk_index", "content", "metadata"}
    for idx, chunk in enumerate(chunks, start=1):
        missing = required_fields - set(chunk.keys())
        if missing:
            raise ValueError(f"Chunk #{idx} missing fields: {sorted(missing)}")
        if not str(chunk.get("content", "")).strip():
            raise ValueError(f"Chunk #{idx} content is empty")
        metadata = chunk.get("metadata") or {}
        if not metadata.get("source"):
            raise ValueError(f"Chunk #{idx} metadata.source is required")
        if chunk.get("chunk_index") != idx:
            raise ValueError(f"Chunk #{idx} chunk_index must start from 1 and be continuous")


def save_processed_document(
    document: Dict[str, Any],
    chunks: List[Dict[str, Any]],
    output_dir: str | Path = "uploads/processed",
) -> Path:
    """Save processed result to uploads/processed/{document_id}.json."""

    validate_chunks(chunks)
    document = dict(document)
    document["chunk_count"] = len(chunks)
    document["status"] = "processed"

    output_path = Path(output_dir) / f"{document['document_id']}.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"document": document, "chunks": chunks}
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return output_path


def process_document_text(
    document: Dict[str, Any],
    raw_text: str,
    segments: Optional[List[Dict[str, Any]]] = None,
    output_dir: str | Path = "uploads/processed",
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], Path]:
    """Split and save a parsed document. Convenient for backend A to call."""

    chunks = split_text(
        document=document,
        raw_text=raw_text,
        segments=segments,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    if not chunks:
        raise ValueError("No valid chunks generated after cleaning and splitting")
    output_path = save_processed_document(document, chunks, output_dir=output_dir)
    saved_document = dict(document)
    saved_document["chunk_count"] = len(chunks)
    saved_document["status"] = "processed"
    return saved_document, chunks, output_path


def process_file(
    file_path: str | Path,
    document_id: Optional[str] = None,
    output_dir: str | Path = "uploads/processed",
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], Path]:
    """One-call pipeline: load document, clean/split text, save JSON."""

    from rag.document_loader import load_document

    document, raw_text, segments = load_document(file_path, document_id=document_id)
    return process_document_text(
        document=document,
        raw_text=raw_text,
        segments=segments,
        output_dir=output_dir,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
