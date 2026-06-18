"""Embedding wrapper owned by member C."""

from __future__ import annotations

from dataclasses import asdict, dataclass
import hashlib
import importlib
import os
import re
from pathlib import Path
from typing import Any, Sequence

import numpy as np


DEFAULT_MODEL_NAME = "BAAI/bge-small-zh-v1.5"
DEFAULT_VECTOR_DIMENSION = 512
_TOKEN_PATTERN = re.compile(r"[A-Za-z0-9_]+", re.UNICODE)
PROJECT_ROOT = Path(__file__).resolve().parents[1]


@dataclass(slots=True)
class EmbeddingRecord:
    chunk_id: str
    document_id: str
    filename: str
    page: int | None
    chunk_index: int
    content: str
    metadata: dict[str, Any]
    vector: list[float]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class EmbeddingProvider:
    """Embedding wrapper with automatic fallback to deterministic mock vectors."""

    def __init__(
        self,
        model_name: str = DEFAULT_MODEL_NAME,
        *,
        mode: str | None = None,
        vector_dimension: int = DEFAULT_VECTOR_DIMENSION,
    ) -> None:
        raw_model_name = (
            os.getenv("RAG_EMBEDDING_MODEL_PATH", model_name)
            if model_name == DEFAULT_MODEL_NAME
            else model_name
        )
        self.model_name = self._resolve_model_name(raw_model_name)
        self.mode = (mode or os.getenv("RAG_EMBEDDING_MODE", "mock")).lower()
        self.vector_dimension = vector_dimension
        self._model = None
        self._active_mode = "mock"
        self._initialize_model()

    @property
    def active_mode(self) -> str:
        return self._active_mode

    def info(self) -> dict[str, Any]:
        return {
            "model_name": self.model_name,
            "embedding_mode": self.active_mode,
            "vector_dimension": self.vector_dimension,
        }

    def embed_text(self, text: str) -> list[float]:
        text = self._validate_text(text)
        vectors = self.embed_texts([text])
        return vectors[0].tolist()

    def embed_texts(self, texts: Sequence[str]) -> np.ndarray:
        validated = [self._validate_text(text) for text in texts]
        if not validated:
            return np.empty((0, self.vector_dimension), dtype=np.float32)

        if self.active_mode == "real":
            assert self._model is not None
            vectors = self._model.encode(
                list(validated),
                convert_to_numpy=True,
                normalize_embeddings=True,
            )
            vectors = np.asarray(vectors, dtype=np.float32)
            self.vector_dimension = int(vectors.shape[1])
            return vectors

        return np.vstack([self._mock_embed_text(text) for text in validated])

    def embed_chunks(self, chunks: Sequence[dict[str, Any]]) -> list[EmbeddingRecord]:
        if not chunks:
            return []

        vectors = self.embed_texts([self._extract_content(chunk) for chunk in chunks])
        records: list[EmbeddingRecord] = []
        for chunk, vector in zip(chunks, vectors, strict=True):
            metadata = dict(chunk.get("metadata") or {})
            records.append(
                EmbeddingRecord(
                    chunk_id=str(chunk["chunk_id"]),
                    document_id=str(chunk["document_id"]),
                    filename=str(chunk["filename"]),
                    page=chunk.get("page"),
                    chunk_index=int(chunk["chunk_index"]),
                    content=self._extract_content(chunk),
                    metadata=metadata,
                    vector=vector.astype(np.float32).tolist(),
                )
            )
        return records

    def _initialize_model(self) -> None:
        if self.mode == "mock":
            self._active_mode = "mock"
            return

        local_only = os.getenv("RAG_EMBEDDING_DOWNLOAD", "0") != "1"
        if local_only and not Path(self.model_name).exists():
            if self.mode == "real":
                raise FileNotFoundError(
                    f"Embedding model not found at {self.model_name}. "
                    "Set RAG_EMBEDDING_DOWNLOAD=1 to allow download, or place "
                    "BAAI/bge-small-zh-v1.5 under models/bge-small-zh-v1.5."
                )
            self._active_mode = "mock"
            return

        try:
            sentence_transformers = importlib.import_module("sentence_transformers")
            sentence_transformer_cls = getattr(sentence_transformers, "SentenceTransformer")
            self._model = sentence_transformer_cls(
                self.model_name,
                local_files_only=local_only,
            )
            self.vector_dimension = int(self._model.get_sentence_embedding_dimension())
            self._active_mode = "real"
        except Exception:
            if self.mode == "real":
                raise
            self._model = None
            self._active_mode = "mock"

    def _resolve_model_name(self, model_name: str) -> str:
        """Resolve local relative model paths from the repository root.

        Hugging Face repo ids such as BAAI/bge-small-zh-v1.5 are preserved so
        download-enabled runs can still use the normal hub identifier.
        """

        raw_value = str(model_name or DEFAULT_MODEL_NAME).strip()
        path = Path(raw_value)
        if path.is_absolute():
            return str(path)

        project_path = PROJECT_ROOT / path
        if raw_value.startswith((".", "models/", "models\\", "model/", "model\\")) or project_path.exists():
            return str(project_path)

        return raw_value

    def _mock_embed_text(self, text: str) -> np.ndarray:
        vector = np.zeros(self.vector_dimension, dtype=np.float32)
        tokens = self._tokenize(text)
        if not tokens:
            return vector

        for index, token in enumerate(tokens, start=1):
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            primary = int.from_bytes(digest[:4], "little") % self.vector_dimension
            secondary = int.from_bytes(digest[4:8], "little") % self.vector_dimension
            tertiary = int.from_bytes(digest[8:12], "little") % self.vector_dimension
            sign = 1.0 if digest[12] % 2 == 0 else -1.0
            weight = 1.0 + min(len(token), 12) / 12.0 + (index % 5) * 0.05
            vector[primary] += weight
            vector[secondary] += weight * 0.5 * sign
            vector[tertiary] += weight * 0.25

        norm = np.linalg.norm(vector)
        if norm == 0:
            return vector
        return vector / norm

    def _tokenize(self, text: str) -> list[str]:
        compact = "".join(text.lower().split())
        words = _TOKEN_PATTERN.findall(text.lower())
        chars = [char for char in compact if not char.isspace()]
        bigrams = [compact[i : i + 2] for i in range(max(len(compact) - 1, 0))]
        tokens = words + chars + bigrams
        return tokens[:2048]

    def _extract_content(self, chunk: dict[str, Any]) -> str:
        required_fields = ["chunk_id", "document_id", "filename", "chunk_index", "content"]
        missing_fields = [field for field in required_fields if field not in chunk]
        if missing_fields:
            raise ValueError(f"Chunk is missing required fields: {', '.join(missing_fields)}")
        return self._validate_text(chunk["content"])

    def _validate_text(self, text: Any) -> str:
        if not isinstance(text, str):
            raise TypeError("Embedding input text must be a string.")
        stripped = text.strip()
        if not stripped:
            raise ValueError("Embedding input text must not be empty.")
        return stripped


_DEFAULT_PROVIDER: EmbeddingProvider | None = None


def get_embedding_provider() -> EmbeddingProvider:
    global _DEFAULT_PROVIDER
    if _DEFAULT_PROVIDER is None:
        _DEFAULT_PROVIDER = EmbeddingProvider()
    return _DEFAULT_PROVIDER


def get_embedding_info() -> dict[str, Any]:
    return get_embedding_provider().info()


def embed_text(text: str) -> list[float]:
    return get_embedding_provider().embed_text(text)


def embed_chunks(chunks: Sequence[dict[str, Any]]) -> list[EmbeddingRecord]:
    return get_embedding_provider().embed_chunks(chunks)

