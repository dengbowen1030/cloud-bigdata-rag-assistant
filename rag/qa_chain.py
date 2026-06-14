"""RAG QA chain entrypoint owned by member D."""
# rag/qa_chain.py
"""
RAG QA Chain
Owner: D
Orchestrates retrieval results + LLM to generate ChatAnswer.
Follows docs/module_contracts.md for all data formats.
"""

import logging
from datetime import datetime
from typing import Optional

from llm_client import get_llm_client, BaseLLMClient, LLMProviderUnavailableError

logger = logging.getLogger(__name__)

# Stage 1 default threshold for source reliability
SOURCE_SCORE_THRESHOLD = 0.3
MAX_SOURCES_IN_ANSWER = 5


# ---------------------------------------------------------------------------
# Prompt Template
# ---------------------------------------------------------------------------
RAG_PROMPT_TEMPLATE = """你是一位云计算与大数据课程的教学助手。请根据以下提供的课程资料片段回答学生的问题。

【回答规则】
1. 仅根据提供的资料片段回答，不要编造未提供的信息。
2. 如果资料不足以回答问题，请明确说明"根据当前知识库，无法找到相关资料来回答该问题"。
3. 回答中引用资料来源时，请标注来源文件名和页码（如有）。
4. 保持回答简洁、准确，适合课程学习参考。

【提供的资料片段】
{context}

【学生问题】
{question}

请根据以上资料回答问题："""

NO_SOURCE_PROMPT_TEMPLATE = """你是一位云计算与大数据课程的教学助手。

【回答规则】
1. 如果未提供相关资料，请明确说明无法回答。
2. 不要编造任何信息。

【学生问题】
{question}

请回答："""


def build_prompt(question: str, retrieved_chunks: list[dict]) -> str:
    """
    Build the RAG prompt from retrieved chunks.

    Args:
        question: User question
        retrieved_chunks: List of RetrievedChunk dicts from module_contracts.md

    Returns:
        Formatted prompt string
    """
    if not retrieved_chunks:
        return NO_SOURCE_PROMPT_TEMPLATE.format(question=question)

    context_parts = []
    for i, chunk in enumerate(retrieved_chunks[:MAX_SOURCES_IN_ANSWER], 1):
        content = chunk.get("content", "").strip()
        source = chunk.get("source", {})
        filename = source.get("filename", "未知文件")
        page = source.get("page")
        chunk_index = source.get("chunk_index", "")
        score = chunk.get("score", 0)

        source_ref = f"[来源{i}: {filename}"
        if page is not None:
            source_ref += f", 第{page}页"
        if chunk_index:
            source_ref += f", 片段{chunk_index}"
        source_ref += f", 相关度{score:.2f}]"

        context_parts.append(f"{source_ref}\n{content}")

    context = "\n\n---\n\n".join(context_parts)

    return RAG_PROMPT_TEMPLATE.format(context=context, question=question)


def check_source_reliability(retrieved_chunks: list[dict]) -> tuple[bool, list[dict]]:
    """
    Check if retrieved chunks are reliable enough to answer.

    Stage 1 rule: score < 0.3 means unreliable.

    Args:
        retrieved_chunks: List of RetrievedChunk dicts

    Returns:
        (is_reliable, reliable_chunks)
    """
    if not retrieved_chunks:
        return False, []

    reliable_chunks = [
        chunk for chunk in retrieved_chunks
        if chunk.get("score", 0) >= SOURCE_SCORE_THRESHOLD and chunk.get("content", "").strip()
    ]

    if not reliable_chunks:
        return False, []

    return True, reliable_chunks


def generate_chat_answer(
    question: str,
    retrieved_chunks: list[dict],
    model: str = "deepseek",
    api_key: Optional[str] = None
) -> dict:
    """
    Generate ChatAnswer from question and retrieved chunks.

    This is the main entry point for D's module.

    Args:
        question: User question string
        retrieved_chunks: List of RetrievedChunk dicts from C
        model: LLM provider name ("deepseek" or "qwen")
        api_key: Optional API key override

    Returns:
        ChatAnswer dict following module_contracts.md
    """
    created_at = datetime.now().isoformat()

    # Step 1: Check source reliability
    is_reliable, reliable_chunks = check_source_reliability(retrieved_chunks)

    if not is_reliable:
        # No-source refusal
        logger.info(f"No reliable sources found for question: {question}")
        return {
            "question": question,
            "answer": "根据当前知识库，无法找到相关资料来回答该问题。请尝试上传更多课程资料或更换提问方式。",
            "sources": [],
            "model": model,
            "created_at": created_at
        }

    # Step 2: Build prompt
    prompt = build_prompt(question, reliable_chunks)

    # Step 3: Call LLM
    try:
        client = get_llm_client(provider=model, api_key=api_key)
        messages = [
            {"role": "system", "content": "你是一位专业的云计算与大数据课程教学助手，擅长基于课程资料准确回答学生问题。"},
            {"role": "user", "content": prompt}
        ]
        answer = client.chat(messages=messages, temperature=0.3, max_tokens=2048)
    except LLMProviderUnavailableError as e:
        logger.error(f"LLM provider unavailable: {e}")
        return {
            "question": question,
            "answer": "抱歉，当前大语言模型服务暂时不可用，请稍后重试。",
            "sources": [],
            "model": model,
            "created_at": created_at
        }
    except Exception as e:
        logger.error(f"QA chain failed: {e}")
        return {
            "question": question,
            "answer": "问答系统出现内部错误，请联系管理员。",
            "sources": [],
            "model": model,
            "created_at": created_at
        }

    # Step 4: Build sources list
    sources = []
    for chunk in reliable_chunks[:MAX_SOURCES_IN_ANSWER]:
        source_info = chunk.get("source", {})
        sources.append({
            "filename": source_info.get("filename", ""),
            "page": source_info.get("page"),
            "chunk_index": source_info.get("chunk_index", 1),
            "score": chunk.get("score", 0),
            "preview": chunk.get("content", "")[:200] + "..." if len(chunk.get("content", "")) > 200 else chunk.get("content", "")
        })

    # Step 5: Return ChatAnswer
    chat_answer = {
        "question": question,
        "answer": answer.strip(),
        "sources": sources,
        "model": model,
        "created_at": created_at
    }

    logger.info(f"Generated answer for question: {question[:50]}... | sources: {len(sources)}")
    return chat_answer


# ---------------------------------------------------------------------------
# Convenience function for backend integration (A calls this)
# ---------------------------------------------------------------------------
def answer_question(
    question: str,
    retrieved_chunks: list[dict],
    model: str = "deepseek"
) -> dict:
    """
    Convenience wrapper for backend API integration.

    Args:
        question: User question
        retrieved_chunks: RetrievedChunk[] from retriever
        model: "deepseek" or "qwen"

    Returns:
        ChatAnswer dict
    """
    return generate_chat_answer(
        question=question,
        retrieved_chunks=retrieved_chunks,
        model=model
    )
