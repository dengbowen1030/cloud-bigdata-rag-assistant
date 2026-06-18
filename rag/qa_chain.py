"""RAG QA chain built on RetrievedChunk[] and DeepSeek/Qwen."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
import logging

from rag.llm_client import LLMProviderUnavailableError, get_llm_client

logger = logging.getLogger(__name__)

SOURCE_SCORE_THRESHOLD = 0.3
MAX_SOURCES_IN_ANSWER = 5
PREVIEW_LENGTH = 100

SYSTEM_PROMPT = (
    "你是云计算与大数据课程的教学问答助手。"
    "你只能根据用户提供的资料片段回答问题。"
    "如果资料不足，请明确说明当前知识库没有足够依据，不要编造课程资料外的内容。"
)


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _normalize_provider(provider: str) -> str:
    provider = (provider or "deepseek").lower()
    return provider if provider in {"deepseek", "qwen"} else "deepseek"


def _client_provider(provider: str) -> str:
    provider = (provider or "deepseek").lower()
    return provider if provider in {"deepseek", "qwen", "mock"} else "deepseek"


def _preview(content: str) -> str:
    content = " ".join(str(content or "").split())
    if len(content) <= PREVIEW_LENGTH:
        return content
    return f"{content[:PREVIEW_LENGTH]}..."


def check_source_reliability(retrieved_chunks: list[dict[str, Any]]) -> tuple[bool, list[dict[str, Any]]]:
    reliable_chunks = [
        chunk
        for chunk in retrieved_chunks
        if str(chunk.get("content") or "").strip()
        and float(chunk.get("score") or 0) >= SOURCE_SCORE_THRESHOLD
        and isinstance(chunk.get("source"), dict)
    ]
    return bool(reliable_chunks), reliable_chunks


def build_prompt(question: str, retrieved_chunks: list[dict[str, Any]]) -> str:
    if not retrieved_chunks:
        return f"NO_RELIABLE_SOURCE\n问题：{question}"

    context_blocks: list[str] = []
    for index, chunk in enumerate(retrieved_chunks[:MAX_SOURCES_IN_ANSWER], start=1):
        source = chunk.get("source") or {}
        page = source.get("page")
        page_text = f"，页码：{page}" if page is not None else ""
        context_blocks.append(
            "\n".join(
                [
                    f"[资料{index}] 文件：{source.get('filename', '')}{page_text}，片段：{source.get('chunk_index')}",
                    f"相关度：{float(chunk.get('score') or 0):.4f}",
                    f"内容：{str(chunk.get('content') or '').strip()}",
                ]
            )
        )

    return "\n\n".join(
        [
            "请只根据以下课程资料回答问题。",
            "回答要求：",
            "1. 不要使用资料外的事实。",
            "2. 如果资料不足，直接说明无法根据当前知识库回答。",
            "3. 回答应使用中文，简洁准确。",
            "",
            "课程资料：",
            "\n\n---\n\n".join(context_blocks),
            "",
            f"问题：{question}",
        ]
    )


def build_sources(retrieved_chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    sources: list[dict[str, Any]] = []
    for chunk in retrieved_chunks[:MAX_SOURCES_IN_ANSWER]:
        source = chunk.get("source") or {}
        sources.append(
            {
                "filename": str(source.get("filename") or ""),
                "page": source.get("page"),
                "chunk_index": int(source.get("chunk_index") or 1),
                "score": float(chunk.get("score") or 0),
                "preview": _preview(str(chunk.get("content") or "")),
            }
        )
    return sources


def refusal_answer(question: str, model: str = "deepseek") -> dict[str, Any]:
    return {
        "question": question,
        "answer": "根据当前知识库，无法找到足够可靠的资料来回答该问题。请先上传并重建相关课程资料。",
        "sources": [],
        "model": _normalize_provider(model),
        "created_at": _utc_now(),
    }


def generate_chat_answer(
    question: str,
    retrieved_chunks: list[dict[str, Any]],
    model: str = "deepseek",
    api_key: str | None = None,
) -> dict[str, Any]:
    client_provider = _client_provider(model)
    response_provider = _normalize_provider(model)
    is_reliable, reliable_chunks = check_source_reliability(retrieved_chunks)
    if not is_reliable:
        return refusal_answer(question, model=response_provider)

    prompt = build_prompt(question, reliable_chunks)
    sources = build_sources(reliable_chunks)
    try:
        client = get_llm_client(provider=client_provider, api_key=api_key)
        answer = client.chat(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=2048,
        )
    except LLMProviderUnavailableError as exc:
        logger.error("LLM provider unavailable: %s", exc)
        answer = "已找到相关课程资料，但当前大模型服务不可用，无法生成完整回答。请稍后重试。"

    return {
        "question": question,
        "answer": str(answer).strip(),
        "sources": sources,
        "model": response_provider,
        "created_at": _utc_now(),
    }


def answer_question(question: str, retrieved_chunks: list[dict[str, Any]], model: str = "deepseek") -> dict[str, Any]:
    return generate_chat_answer(question=question, retrieved_chunks=retrieved_chunks, model=model)
