from __future__ import annotations

import json
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from rag.embedding import embed_chunks, get_embedding_info
from rag.retriever import Retriever


def sample_chunks() -> list[dict]:
    return [
        {
            "chunk_id": "chunk_doc_001_0001",
            "document_id": "doc_001",
            "filename": "lecture01.pdf",
            "page": 3,
            "chunk_index": 1,
            "content": "软件开发周期通常包括需求分析、设计、编码、测试和维护阶段。",
            "metadata": {"source": "lecture01.pdf", "section": "软件开发周期"},
        },
        {
            "chunk_id": "chunk_doc_001_0002",
            "document_id": "doc_001",
            "filename": "lecture01.pdf",
            "page": 5,
            "chunk_index": 2,
            "content": "敏捷开发强调迭代交付、持续反馈，以及团队与用户之间的快速沟通。",
            "metadata": {"source": "lecture01.pdf", "section": "敏捷开发"},
        },
        {
            "chunk_id": "chunk_doc_002_0001",
            "document_id": "doc_002",
            "filename": "lab03.docx",
            "page": 2,
            "chunk_index": 1,
            "content": "实验三提交材料包括实验报告、源代码压缩包、运行截图和结果分析。",
            "metadata": {"source": "lab03.docx", "section": "实验三提交要求"},
        },
        {
            "chunk_id": "chunk_doc_003_0001",
            "document_id": "doc_003",
            "filename": "project_guide.txt",
            "page": None,
            "chunk_index": 1,
            "content": "课程大作业需要提交需求说明、系统设计、部署说明、测试报告和演示视频。",
            "metadata": {"source": "project_guide.txt", "section": "大作业材料"},
        },
        {
            "chunk_id": "chunk_doc_004_0001",
            "document_id": "doc_004",
            "filename": "cloud_notes.txt",
            "page": None,
            "chunk_index": 1,
            "content": "云计算的核心特征包括按需自助服务、广泛网络访问、资源池化、快速弹性和可计量服务。",
            "metadata": {"source": "cloud_notes.txt", "section": "云计算特征"},
        },
    ]


def main() -> None:
    chunks = sample_chunks()
    embedding_records = embed_chunks(chunks)
    print("Embedding info:")
    print(json.dumps(get_embedding_info(), ensure_ascii=False, indent=2))
    print("\nVector samples (first 8 dims):")
    for record in embedding_records:
        print(
            json.dumps(
                {
                    "chunk_id": record.chunk_id,
                    "vector_dim": len(record.vector),
                    "vector_head": [round(value, 6) for value in record.vector[:8]],
                },
                ensure_ascii=False,
            )
        )

    retriever = Retriever()
    store = retriever.build(chunks)
    store.save()
    print("\nBuild info:")
    print(json.dumps(store.get_info().to_dict(), ensure_ascii=False, indent=2))

    reloaded_store = retriever.load()
    print("\nReload info:")
    print(json.dumps(reloaded_store.get_info().to_dict(), ensure_ascii=False, indent=2))

    questions = [
        "软件开发周期是什么？",
        "实验三提交要求有哪些？",
        "课程大作业需要包含哪些材料？",
    ]
    print("\nRetrieval results:")
    for question in questions:
        results = retriever.retrieve(question, top_k=3)
        print(json.dumps({"question": question, "results": results}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
