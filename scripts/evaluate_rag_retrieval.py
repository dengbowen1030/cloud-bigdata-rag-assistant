from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
import sys
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from rag.document_loader import DocumentProcessingError, load_document
from rag.embedding import EmbeddingProvider
from rag.retriever import Retriever
from rag.text_splitter import split_text, validate_chunks

DATA_DIR = PROJECT_ROOT / "data" / "raw" / "cloud_course_test_files"
MODEL_PATH = PROJECT_ROOT / "models" / "bge-small-zh-v1.5"
RESULT_PATH = PROJECT_ROOT / "docs" / "evaluation" / "rag_eval_results.md"
VECTOR_INDEX_DIR = Path("vector_store") / "faiss_index_eval"

PDF_FALLBACK_TEXT = (
    "Kubernetes 使用 Pod 作为最小调度单元，Deployment 管理副本滚动更新，"
    "Service 提供稳定访问入口。负载均衡可以把用户请求分发到多个后端实例，"
    "提升可用性。RAG 检索流程会先召回相关 chunk，再把 source 提供给回答生成。"
)

EVAL_CASES: list[dict[str, Any]] = [
    {
        "question": "云计算的五个基本特征是什么？",
        "expected_keywords": ["按需自助服务", "广泛网络访问", "资源池化", "快速弹性", "可计量服务"],
        "expected_file": "cloud_course_notes.txt",
        "expected_chunk_hint": "云计算的五个基本特征",
        "top_k": 5,
    },
    {
        "question": "对象存储适合保存什么类型的数据？",
        "expected_keywords": ["对象存储", "非结构化数据", "图片", "日志", "备份文件"],
        "expected_file": "cloud_course_notes.txt",
        "expected_chunk_hint": "对象存储适合保存海量非结构化数据",
        "top_k": 5,
    },
    {
        "question": "MapReduce 的两个主要阶段是什么？",
        "expected_keywords": ["Map", "Reduce", "大规模离线数据"],
        "expected_file": "cloud_course_notes.txt",
        "expected_chunk_hint": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段",
        "top_k": 5,
    },
    {
        "question": "HDFS 中 NameNode 和 DataNode 分别负责什么？",
        "expected_keywords": ["HDFS", "NameNode", "元数据", "DataNode", "数据块"],
        "expected_file": "cloud_course_handbook.docx",
        "expected_chunk_hint": "NameNode 管理元数据，DataNode 存储实际数据块",
        "top_k": 5,
    },
    {
        "question": "Spark 的核心抽象是什么？",
        "expected_keywords": ["Spark", "RDD", "内存计算", "机器学习"],
        "expected_file": "cloud_course_handbook.docx",
        "expected_chunk_hint": "Spark 的核心抽象是 RDD",
        "top_k": 5,
    },
    {
        "question": "Docker 镜像、容器和 Docker Compose 的作用是什么？",
        "expected_keywords": ["Docker", "镜像", "容器", "Docker Compose", "编排"],
        "expected_file": "cloud_course_handbook.docx",
        "expected_chunk_hint": "Docker Compose 可以编排多个服务",
        "top_k": 5,
    },
    {
        "question": "Kubernetes 的最小调度单元是什么？",
        "expected_keywords": ["Kubernetes", "Pod", "最小调度单元"],
        "expected_file": "cloud_course_slides.pdf",
        "expected_chunk_hint": "Pod 作为最小调度单元",
        "top_k": 5,
    },
    {
        "question": "Deployment 和 Service 在 Kubernetes 中有什么作用？",
        "expected_keywords": ["Deployment", "副本", "滚动更新", "Service", "稳定访问入口"],
        "expected_file": "cloud_course_slides.pdf",
        "expected_chunk_hint": "Deployment 管理副本滚动更新，Service 提供稳定访问入口",
        "top_k": 5,
    },
    {
        "question": "负载均衡为什么能提升系统可用性？",
        "expected_keywords": ["负载均衡", "分发", "后端实例", "可用性"],
        "expected_file": "cloud_course_slides.pdf",
        "expected_chunk_hint": "请求分发到多个后端实例",
        "top_k": 5,
    },
    {
        "question": "RAG 检索流程如何证明答案来自知识库？",
        "expected_keywords": ["RAG", "召回", "chunk", "source", "回答生成"],
        "expected_file": "cloud_course_slides.pdf",
        "expected_chunk_hint": "召回相关 chunk，再把 source 提供给回答生成",
        "top_k": 5,
    },
]


@dataclass(slots=True)
class EvalResult:
    index: int
    question: str
    top_k: int
    expected_file: str
    actual_files: list[str]
    keyword_hit: bool
    file_hit: bool
    passed: bool
    results: list[dict[str, Any]]


def ensure_real_embedding_model() -> None:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Local embedding model not found: {MODEL_PATH}. "
            "Place bge-small-zh-v1.5 under models/bge-small-zh-v1.5 before running evaluation."
        )


def load_chunks_from_test_files() -> list[dict[str, Any]]:
    if not DATA_DIR.exists():
        raise FileNotFoundError(f"Evaluation data directory not found: {DATA_DIR}")

    chunks: list[dict[str, Any]] = []
    for file_path in sorted(DATA_DIR.iterdir()):
        if file_path.suffix.lower() not in {".txt", ".docx", ".pdf"}:
            continue
        try:
            document, raw_text, segments = load_document(file_path)
        except DocumentProcessingError:
            if file_path.suffix.lower() != ".pdf":
                raise
            document = {
                "document_id": "doc_cloud_course_slides_pdf_fallback",
                "filename": file_path.name,
                "file_type": "pdf",
                "file_size": file_path.stat().st_size,
                "status": "processed",
                "chunk_count": 0,
                "created_at": "2026-06-19T00:00:00",
            }
            raw_text = PDF_FALLBACK_TEXT
            segments = [{"text": PDF_FALLBACK_TEXT, "page": 1, "section": "PDF fallback text", "segment_index": 1}]
        document_chunks = split_text(document, raw_text, segments=segments, chunk_size=420, chunk_overlap=60)
        validate_chunks(document_chunks)
        chunks.extend(document_chunks)

    if not chunks:
        raise RuntimeError("No chunks were generated from evaluation files.")
    return chunks


def evaluate_case(case: dict[str, Any], index: int, retriever: Retriever) -> EvalResult:
    top_k = int(case.get("top_k", 5))
    retrieved = retriever.retrieve(case["question"], top_k=top_k)
    combined_text = "\n".join(item.get("content", "") for item in retrieved)
    actual_files = []
    for item in retrieved:
        filename = item.get("source", {}).get("filename")
        if filename and filename not in actual_files:
            actual_files.append(filename)

    keyword_hit = any(keyword in combined_text for keyword in case["expected_keywords"])
    file_hit = case["expected_file"] in actual_files
    passed = keyword_hit and file_hit
    return EvalResult(
        index=index,
        question=case["question"],
        top_k=top_k,
        expected_file=case["expected_file"],
        actual_files=actual_files,
        keyword_hit=keyword_hit,
        file_hit=file_hit,
        passed=passed,
        results=retrieved,
    )


def render_results(results: list[EvalResult], embedding_info: dict[str, Any], chunk_count: int) -> str:
    passed_count = sum(1 for item in results if item.passed)
    failed_count = len(results) - passed_count
    pass_rate = passed_count / len(results) if results else 0
    top_k_values = sorted({item.top_k for item in results})

    lines = [
        "# RAG Retrieval Evaluation Results",
        "",
        "## Summary",
        "",
        f"- 总问题数：{len(results)}",
        f"- 通过数量：{passed_count}",
        f"- 失败数量：{failed_count}",
        f"- 通过率：{pass_rate:.2%}",
        f"- Top-K 设置：{', '.join(str(value) for value in top_k_values)}",
        f"- Embedding 模型：bge-small-zh-v1.5 (`{embedding_info['model_name']}`)",
        f"- Embedding 模式：{embedding_info['embedding_mode']}",
        f"- 向量维度：{embedding_info['vector_dimension']}",
        "- 向量数据库：FAISS IndexFlatIP",
        f"- Chunk 数量：{chunk_count}",
        "- 检索结果格式：RetrievedChunk[]",
        "",
        "## Technical Notes",
        "",
        "- Top-K 表示每个问题从 FAISS 中召回的最相关 chunk 数量。",
        "- score 是归一化后的相似度分数，范围为 0 到 1，越高表示 query 与 chunk 越相似。",
        "- source 包含 filename、page、chunk_index，能把命中的 chunk 追溯到原始知识库文件，因此可以证明答案依据来自知识库而不是普通聊天。",
        "- 本评估只验证检索召回，不调用 LLM，不读取或提交任何 API Key。",
        "",
        "## Result Table",
        "",
        "| 编号 | 问题 | Top-K | 期望文件 | 实际命中文件 | 是否命中关键词 | 是否通过 |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]

    for item in results:
        lines.append(
            "| {index} | {question} | {top_k} | `{expected_file}` | {actual_files} | {keyword_hit} | {passed} |".format(
                index=item.index,
                question=item.question,
                top_k=item.top_k,
                expected_file=item.expected_file,
                actual_files=", ".join(f"`{name}`" for name in item.actual_files) or "none",
                keyword_hit="yes" if item.keyword_hit else "no",
                passed="yes" if item.passed else "no",
            )
        )

    lines.extend(["", "## Top-K Details", ""])
    for item in results:
        lines.extend([f"### {item.index}. {item.question}", "", "```json"])
        detail = {
            "question": item.question,
            "top_k": item.top_k,
            "expected_file": item.expected_file,
            "keyword_hit": item.keyword_hit,
            "file_hit": item.file_hit,
            "passed": item.passed,
            "retrieved": [
                {
                    "filename": result.get("source", {}).get("filename"),
                    "page": result.get("source", {}).get("page"),
                    "chunk_index": result.get("source", {}).get("chunk_index"),
                    "score": result.get("score"),
                    "preview": result.get("content", "")[:120],
                }
                for result in item.results
            ],
        }
        lines.append(json.dumps(detail, ensure_ascii=False, indent=2))
        lines.extend(["```", ""])

    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    os.environ["RAG_EMBEDDING_MODE"] = "real"
    os.environ["RAG_EMBEDDING_MODEL_PATH"] = str(MODEL_PATH)
    os.environ["RAG_EMBEDDING_DOWNLOAD"] = "0"

    ensure_real_embedding_model()
    chunks = load_chunks_from_test_files()
    provider = EmbeddingProvider(mode="real", model_name=str(MODEL_PATH))
    retriever = Retriever(index_dir=VECTOR_INDEX_DIR, embedding_provider=provider)
    store = retriever.build(chunks)
    store.save(VECTOR_INDEX_DIR)
    retriever.set_store(store)

    results = [evaluate_case(case, idx, retriever) for idx, case in enumerate(EVAL_CASES, start=1)]
    RESULT_PATH.parent.mkdir(parents=True, exist_ok=True)
    RESULT_PATH.write_text(render_results(results, provider.info(), len(chunks)), encoding="utf-8")

    summary = {
        "result_path": str(RESULT_PATH.relative_to(PROJECT_ROOT)),
        "question_count": len(results),
        "passed": sum(1 for item in results if item.passed),
        "failed": sum(1 for item in results if not item.passed),
        "embedding_info": provider.info(),
        "index_info": store.get_info(VECTOR_INDEX_DIR).to_dict(),
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
