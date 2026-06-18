# Vector DB Test Notes

Owner: C

This document is C's evidence document for embedding, FAISS build/save/load, and Top-K retrieval.

## Responsibility

C owns:

```text
rag/embedding.py
rag/vector_store.py
rag/retriever.py
scripts/test_vector_store.py
vector_store/faiss_index/
```

C does not own document parsing, LLM answers, backend routes, or frontend pages.

## Branch Alignment

Per `README.md` and the repository branch rules, C's standard feature branch is:

```text
feature/vector-db
```

If work was accidentally pushed to:

```text
feature/vector-db-implementation
```

then the missed collaboration steps are:

```text
1. Open or update a pull request from feature/vector-db-implementation into dev.
2. In the PR description, explicitly state that this is Owner C work for the standard feature/vector-db scope.
3. Include the required PR fields from docs/contribution_rules.md.
4. Attach this document as C's evidence document.
5. After review, either retarget/rename the branch to feature/vector-db or let A merge the PR into dev and delete the non-standard branch.
```

Recommended PR statement:

```text
Owner: C
Completed work: Embedding wrapper, FAISS build/save/load, Top-K retriever, vector DB evidence.
Changed files: rag/embedding.py, rag/vector_store.py, rag/retriever.py, scripts/test_vector_store.py, docs/vector_db_test.md, vector_store/faiss_index/
Contract changed: no
Docs updated: yes, docs/vector_db_test.md
Test evidence: python scripts/test_vector_store.py; retrieval tables and FAISS save/load evidence in docs/vector_db_test.md
Handoff target: D and A
Current blockers: real BGE model mode depends on local dependency alignment; final semantic evidence should rerun with B's real Chunk[]
```

Issue completion reply for C:

```text
完成内容：完成 embedding mock/real mode wrapper、FAISS 保存/加载、Top-K retrieval、RetrievedChunk[] 输出验证。
交付文件：rag/embedding.py, rag/vector_store.py, rag/retriever.py, scripts/test_vector_store.py, docs/vector_db_test.md, vector_store/faiss_index/
输出数据示例：RetrievedChunk Example 见本文件。
测试证据：python scripts/test_vector_store.py；Top-K Retrieval Tests 见本文件。
需要通知谁：D、A。
当前问题：Stage 1 默认使用 deterministic mock embedding；真实 bge-small-zh-v1.5 需等待本地依赖对齐，并在 B 的真实 Chunk[] 完成后重跑。
Mock data used: yes, sample Chunk[] in scripts/test_vector_store.py.
What real upstream output is still needed: B 的真实 Chunk[] 和 uploads/processed/{document_id}.json。
```

## Contract Status

This implementation does not change interface contracts.

```text
Contract changed: no
Changed contract: none
Affected owners: A, D
Docs updated: docs/vector_db_test.md
Migration or compatibility note: RetrievedChunk[] still follows docs/module_contracts.md
```

## Input And Output

Input:

```text
Chunk[]
```

Output:

```text
RetrievedChunk[]
vector_store/faiss_index/index.faiss
vector_store/faiss_index/metadata.json
```

`RetrievedChunk[]` follows `docs/module_contracts.md`.

## Embedding Plan

Target model:

```text
BAAI/bge-small-zh-v1.5
```

Current Stage 1 mode:

```text
mock
```

Current embedding implementation:

- `rag/embedding.py` provides `embed_text(text)` and `embed_chunks(chunks)`.
- Default mode is stable mock embedding so Stage 1 can run without external model download.
- Real model mode is reserved and can be enabled with `RAG_EMBEDDING_MODE=real` after local dependency alignment.

Mock reason:

```text
Current local sentence-transformers / torch dependency chain is not stable for direct Stage 1 execution.
Using deterministic mock embedding keeps Chunk[] -> FAISS -> RetrievedChunk[] fully testable.
```

Replacement plan:

```text
1. Align local numpy / torch / sentence-transformers versions.
2. Download or cache BAAI/bge-small-zh-v1.5 locally.
3. Set RAG_EMBEDDING_MODE=real and rerun scripts/test_vector_store.py.
4. Replace the mock evidence section with real embedding evidence.
```

Expected real model:

```text
BAAI/bge-small-zh-v1.5
```

## FAISS Design

Supported operations:

```text
build
save
load
query
```

Index path:

```text
vector_store/faiss_index/index.faiss
```

Metadata path:

```text
vector_store/faiss_index/metadata.json
```

Metadata fields preserved:

```text
chunk_id
document_id
filename
page
chunk_index
content
metadata.source
metadata.section
```

Implementation notes:

- FAISS index type: `IndexFlatIP`
- Similarity strategy: normalized inner product
- Returned `score`: normalized into `0 ~ 1`

## Retrieval Rules

- Entry: `rag/retriever.py -> retrieve(question, top_k=5)`
- Default `top_k`: `5`
- Allowed Stage 1 range: `1-10`
- Returned results are sorted from highest score to lowest score.
- Empty hit case returns `[]`.

## Test Command

```powershell
python scripts/test_vector_store.py
```

## Test Data

Stage 1 sample `Chunk[]` used in the script:

| chunk_id | filename | page | section |
| --- | --- | --- | --- |
| `chunk_doc_001_0001` | `lecture01.pdf` | 3 | 软件开发周期 |
| `chunk_doc_001_0002` | `lecture01.pdf` | 5 | 敏捷开发 |
| `chunk_doc_002_0001` | `lab03.docx` | 2 | 实验三提交要求 |
| `chunk_doc_003_0001` | `project_guide.txt` | null | 大作业材料 |
| `chunk_doc_004_0001` | `cloud_notes.txt` | null | 云计算特征 |

## Embedding Output Evidence

Embedding info:

```json
{
  "model_name": "BAAI/bge-small-zh-v1.5",
  "embedding_mode": "mock",
  "vector_dimension": 512
}
```

5 sample vector heads from the old Stage 1 mock sample. The full vector is not listed; mock and real BGE paths now use 512 dimensions.

| chunk_id | vector_dim | first 8 values |
| --- | --- | --- |
| `chunk_doc_001_0001` | 512 | `[0.163512, 0.0, 0.0, -0.021257, 0.0, -0.048399, 0.0, 0.0]` |
| `chunk_doc_001_0002` | 512 | `[-0.046562, 0.0, 0.0, 0.021618, 0.094454, -0.046562, 0.0, 0.0]` |
| `chunk_doc_002_0001` | 512 | `[0.055464, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.144749]` |
| `chunk_doc_003_0001` | 512 | `[0.020568, 0.0, 0.0, 0.133693, 0.0, 0.0, 0.0, 0.019661]` |
| `chunk_doc_004_0001` | 512 | `[0.046219, 0.0, 0.0, 0.089057, 0.021419, 0.0, 0.092439, 0.0]` |

## FAISS Save Evidence

Save result:

```json
{
  "chunk_count": 5,
  "vector_dimension": 512,
  "model_name": "BAAI/bge-small-zh-v1.5",
  "embedding_mode": "mock",
  "index_path": "vector_store/faiss_index/index.faiss",
  "metadata_path": "vector_store/faiss_index/metadata.json"
}
```

Index file check:

```json
{
  "exists": true,
  "size_bytes": 7725
}
```

## FAISS Load Evidence

Reload result:

```json
{
  "chunk_count": 5,
  "vector_dimension": 512,
  "model_name": "BAAI/bge-small-zh-v1.5",
  "embedding_mode": "mock",
  "index_path": "vector_store/faiss_index/index.faiss",
  "metadata_path": "vector_store/faiss_index/metadata.json"
}
```

Metadata snapshot:

```json
{
  "chunk_id": "chunk_doc_001_0001",
  "document_id": "doc_001",
  "filename": "lecture01.pdf",
  "page": 3,
  "chunk_index": 1,
  "content": "软件开发周期通常包括需求分析、设计、编码、测试和维护阶段。",
  "metadata": {
    "source": "lecture01.pdf",
    "section": "软件开发周期"
  }
}
```

## Top-K Retrieval Tests

### Question 1

```text
软件开发周期是什么？
```

Top-3 result summary:

| rank | chunk_id | filename | score |
| --- | --- | --- | --- |
| 1 | `chunk_doc_001_0001` | `lecture01.pdf` | `0.707115` |
| 2 | `chunk_doc_001_0002` | `lecture01.pdf` | `0.604228` |
| 3 | `chunk_doc_004_0001` | `cloud_notes.txt` | `0.599605` |

### Question 2

```text
实验三提交要求有哪些？
```

Top-3 result summary:

| rank | chunk_id | filename | score |
| --- | --- | --- | --- |
| 1 | `chunk_doc_002_0001` | `lab03.docx` | `0.699337` |
| 2 | `chunk_doc_003_0001` | `project_guide.txt` | `0.593659` |
| 3 | `chunk_doc_001_0002` | `lecture01.pdf` | `0.566434` |

### Question 3

```text
课程大作业需要包含哪些材料？
```

Top-3 result summary:

| rank | chunk_id | filename | score |
| --- | --- | --- | --- |
| 1 | `chunk_doc_003_0001` | `project_guide.txt` | `0.679742` |
| 2 | `chunk_doc_002_0001` | `lab03.docx` | `0.614387` |
| 3 | `chunk_doc_004_0001` | `cloud_notes.txt` | `0.578498` |

## RetrievedChunk Example

```json
{
  "chunk_id": "chunk_doc_002_0001",
  "document_id": "doc_002",
  "content": "实验三提交材料包括实验报告、源代码压缩包、运行截图和结果分析。",
  "score": 0.699337,
  "source": {
    "filename": "lab03.docx",
    "page": 2,
    "chunk_index": 1
  }
}
```

## Handoff To D And A

```text
FAISS index path: vector_store/faiss_index/index.faiss
metadata path: vector_store/faiss_index/metadata.json
RetrievedChunk[] example: see "RetrievedChunk Example"
Top-K questions:
1. 软件开发周期是什么？
2. 实验三提交要求有哪些？
3. 课程大作业需要包含哪些材料？
test evidence: python scripts/test_vector_store.py output + metadata.json + index.faiss
known limitations: current Stage 1 defaults to mock embedding
```

## Acceptance Status

Pass items:

- Embedding entry exists.
- FAISS build/save/load works.
- At least 3 retrieval tests return valid `RetrievedChunk[]`.
- Source information is preserved.
- This document is updated with test evidence.

Current status:

```text
Conditional pass
```

Reason:

```text
Mock embedding is used by default in Stage 1.
FAISS and RetrievedChunk[] format are complete and verifiable.
Real bge-small-zh-v1.5 integration path is reserved after dependency alignment.
```

## Known Limitations

- The default Stage 1 mode uses deterministic mock embedding instead of the real BGE model.
- Retrieval relevance is suitable for contract verification and pipeline testing, not final semantic quality benchmarking.
- Final acceptance evidence should be rerun with B's real `Chunk[]` after B finishes data processing output.
