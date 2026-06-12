"""Top-K retrieval entrypoint owned by member C."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from rag.embedding import EmbeddingProvider, get_embedding_provider
from rag.vector_store import DEFAULT_INDEX_DIR, FaissVectorStore, build_index, load_index


class Retriever:
    def __init__(
        self,
        *,
        index_dir: str | Path = DEFAULT_INDEX_DIR,
        embedding_provider: EmbeddingProvider | None = None,
    ) -> None:
        self.index_dir = Path(index_dir)
        self.embedding_provider = embedding_provider or get_embedding_provider()
        self.vector_store: FaissVectorStore | None = None

    def set_store(self, store: FaissVectorStore) -> None:
        self.vector_store = store

    def build(self, chunks: list[dict[str, Any]]) -> FaissVectorStore:
        store = build_index(chunks, embedding_provider=self.embedding_provider)
        self.vector_store = store
        return store

    def load(self) -> FaissVectorStore:
        self.vector_store = load_index(
            self.index_dir,
            embedding_provider=self.embedding_provider,
        )
        return self.vector_store

    def retrieve(self, question: str, top_k: int = 5) -> list[dict[str, Any]]:
        if not isinstance(question, str) or not question.strip():
            raise ValueError("Question must be a non-empty string.")

        bounded_top_k = max(1, min(int(top_k), 10))
        store = self.vector_store
        if store is None:
            store = self.load()
        return store.search(question.strip(), top_k=bounded_top_k)


def retrieve(
    question: str,
    top_k: int = 5,
    *,
    index_dir: str | Path = DEFAULT_INDEX_DIR,
    embedding_provider: EmbeddingProvider | None = None,
) -> list[dict[str, Any]]:
    retriever = Retriever(
        index_dir=index_dir,
        embedding_provider=embedding_provider,
    )
    return retriever.retrieve(question, top_k=top_k)

