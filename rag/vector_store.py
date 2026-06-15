"""FAISS vector store owned by member C."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, Sequence

import faiss
import numpy as np

from rag.embedding import EmbeddingProvider, EmbeddingRecord, get_embedding_provider


DEFAULT_INDEX_DIR = Path("vector_store/faiss_index")
DEFAULT_INDEX_FILE = "index.faiss"
DEFAULT_METADATA_FILE = "metadata.json"


@dataclass(slots=True)
class VectorStoreInfo:
    chunk_count: int
    vector_dimension: int
    model_name: str
    embedding_mode: str
    index_path: str
    metadata_path: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "chunk_count": self.chunk_count,
            "vector_dimension": self.vector_dimension,
            "model_name": self.model_name,
            "embedding_mode": self.embedding_mode,
            "index_path": self.index_path,
            "metadata_path": self.metadata_path,
        }


class FaissVectorStore:
    def __init__(self, embedding_provider: EmbeddingProvider | None = None) -> None:
        self.embedding_provider = embedding_provider or get_embedding_provider()
        self.index: faiss.Index | None = None
        self.records: list[dict[str, Any]] = []

    def build_index(self, chunks: Sequence[dict[str, Any]]) -> VectorStoreInfo:
        embedding_records = self.embedding_provider.embed_chunks(chunks)
        if not embedding_records:
            raise ValueError("Cannot build a vector index from an empty Chunk list.")

        vectors = np.asarray([record.vector for record in embedding_records], dtype=np.float32)
        if vectors.ndim != 2:
            raise ValueError("Embedding output must be a 2D matrix.")

        faiss.normalize_L2(vectors)
        index = faiss.IndexFlatIP(vectors.shape[1])
        index.add(vectors)

        self.index = index
        self.records = [self._record_to_metadata(record) for record in embedding_records]
        return self.get_info()

    def save(self, index_dir: str | Path = DEFAULT_INDEX_DIR) -> None:
        if self.index is None:
            raise RuntimeError("Cannot save FAISS index before build_index or load.")

        target_dir = Path(index_dir)
        target_dir.mkdir(parents=True, exist_ok=True)

        index_path = target_dir / DEFAULT_INDEX_FILE
        metadata_path = target_dir / DEFAULT_METADATA_FILE
        faiss.write_index(self.index, str(index_path))
        metadata_path.write_text(
            json.dumps(self._metadata_payload(), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def load(self, index_dir: str | Path = DEFAULT_INDEX_DIR) -> VectorStoreInfo:
        target_dir = Path(index_dir)
        index_path = target_dir / DEFAULT_INDEX_FILE
        metadata_path = target_dir / DEFAULT_METADATA_FILE

        if not index_path.exists():
            raise FileNotFoundError(f"FAISS index file not found: {index_path}")
        if not metadata_path.exists():
            raise FileNotFoundError(f"FAISS metadata file not found: {metadata_path}")

        payload = json.loads(metadata_path.read_text(encoding="utf-8"))
        self.index = faiss.read_index(str(index_path))
        self.records = list(payload.get("records") or [])
        return self.get_info(index_dir=index_dir)

    def search(self, question: str, top_k: int = 5) -> list[dict[str, Any]]:
        if self.index is None:
            raise RuntimeError("FAISS index is not ready. Build or load the index first.")

        if not self.records:
            return []

        bounded_top_k = max(1, min(int(top_k), 10))
        query_vector = np.asarray(
            [self.embedding_provider.embed_text(question)],
            dtype=np.float32,
        )
        faiss.normalize_L2(query_vector)
        similarities, positions = self.index.search(query_vector, bounded_top_k)

        results: list[dict[str, Any]] = []
        for similarity, position in zip(similarities[0], positions[0], strict=True):
            if position < 0:
                continue
            metadata = self.records[position]
            results.append(self._to_retrieved_chunk(metadata, float(similarity)))

        results.sort(key=lambda item: item["score"], reverse=True)
        return results

    def get_info(self, index_dir: str | Path = DEFAULT_INDEX_DIR) -> VectorStoreInfo:
        target_dir = Path(index_dir)
        return VectorStoreInfo(
            chunk_count=len(self.records),
            vector_dimension=int(self.index.d) if self.index is not None else self.embedding_provider.vector_dimension,
            model_name=self.embedding_provider.model_name,
            embedding_mode=self.embedding_provider.active_mode,
            index_path=str((target_dir / DEFAULT_INDEX_FILE).as_posix()),
            metadata_path=str((target_dir / DEFAULT_METADATA_FILE).as_posix()),
        )

    def _metadata_payload(self) -> dict[str, Any]:
        info = self.get_info()
        return {
            "model_name": info.model_name,
            "embedding_mode": info.embedding_mode,
            "vector_dimension": info.vector_dimension,
            "chunk_count": info.chunk_count,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "records": self.records,
        }

    def _record_to_metadata(self, record: EmbeddingRecord) -> dict[str, Any]:
        return {
            "chunk_id": record.chunk_id,
            "document_id": record.document_id,
            "filename": record.filename,
            "page": record.page,
            "chunk_index": record.chunk_index,
            "content": record.content,
            "metadata": {
                "source": record.metadata.get("source", record.filename),
                "section": record.metadata.get("section"),
            },
        }

    def _to_retrieved_chunk(self, metadata: dict[str, Any], similarity: float) -> dict[str, Any]:
        normalized_score = max(0.0, min(1.0, (similarity + 1.0) / 2.0))
        return {
            "chunk_id": metadata["chunk_id"],
            "document_id": metadata["document_id"],
            "content": metadata["content"],
            "score": round(normalized_score, 6),
            "source": {
                "filename": metadata["filename"],
                "page": metadata.get("page"),
                "chunk_index": metadata["chunk_index"],
            },
        }


def build_index(
    chunks: Sequence[dict[str, Any]],
    *,
    embedding_provider: EmbeddingProvider | None = None,
) -> FaissVectorStore:
    store = FaissVectorStore(embedding_provider=embedding_provider)
    store.build_index(chunks)
    return store


def save_index(store: FaissVectorStore, path: str | Path = DEFAULT_INDEX_DIR) -> None:
    store.save(path)


def load_index(
    path: str | Path = DEFAULT_INDEX_DIR,
    *,
    embedding_provider: EmbeddingProvider | None = None,
) -> FaissVectorStore:
    store = FaissVectorStore(embedding_provider=embedding_provider)
    store.load(path)
    return store

