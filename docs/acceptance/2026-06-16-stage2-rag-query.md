# Stage 2 RAG Query Acceptance

Date: 2026-06-16

## Scope

This record covers Stage 2 Step 3: wiring `/chat/query` to FAISS retrieval, QA chain, DeepSeek/Qwen client selection, QaLog persistence, and stats updates.

This step does not include frontend, Docker, Nginx, OCR, XLSX parsing, or committing runtime artifacts.

## Configuration Check

Project `.env` status:

```text
ENV_EXISTS=True
LLM_PROVIDER=deepseek
DEEPSEEK_KEY_CONFIGURED=True
QWEN_KEY_CONFIGURED=False
RAG_EMBEDDING_MODE=real
RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5
MODEL_EXISTS=True
DATABASE_URL=sqlite:///<PROJECT_ROOT>/data/edurag_stage2_real.db
```

API keys were only checked as configured/not configured. Full keys were not printed or recorded.

## Test Material

Expected task path used with actual workspace spelling:

```text
data/raw/cloud_course_test_files
```

Files found:

```text
test_course.docx
test_course.pdf
test_course.txt
```

Note: the task text used `cloud_course_test_file`, but the repository contains `cloud_course_test_files`.

## Implemented Runtime Flow

`POST /chat/query` now follows this flow:

```text
ChatQuery
-> validate non-empty question
-> check vector_store/faiss_index/index.faiss and metadata.json
-> retrieve RetrievedChunk[] from FAISS
-> reject if no reliable source
-> call qa_chain
-> call DeepSeek/Qwen client selected by LLM_PROVIDER
-> return ChatAnswer
-> save QaLog
-> update logs/stats through SQLite-backed services
```

If FAISS files are missing:

```json
{
  "success": false,
  "data": null,
  "message": "FAISS index is not ready. Please upload documents and rebuild the vector index first.",
  "error_code": "VECTOR_INDEX_NOT_READY"
}
```

## Automated Test Result

Command:

```powershell
python -m unittest discover -s backend\tests -p "test_*.py"
```

Result:

```text
Ran 11 tests in 0.655s
OK
```

Covered by automated tests:

- No FAISS index returns `VECTOR_INDEX_NOT_READY`.
- TXT upload + rebuild creates FAISS and supports `/chat/query`.
- `/chat/query` returns `ChatAnswer` with non-empty answer and source fields.
- Source objects contain `filename`, `page`, `chunk_index`, `score`, and `preview`.
- `/chat/query` saves `QaLog`.
- `/stats.question_count` increases and `latest_question_time` is non-null.
- QA chain refuses when retrieved chunks are below reliability threshold.
- Tests force mock LLM to avoid leaking or consuming real API credentials.

## Step 3.5 Environment Unlock

SQLite blocker status:

```text
resolved=True
old database=data/edurag.db
new acceptance database=data/edurag_stage2_real.db
```

The local `.env` now points to a new ignored SQLite database file using a stable absolute SQLite URL. The exact local path is not required for documentation; it maps to:

```text
<PROJECT_ROOT>/data/edurag_stage2_real.db
```

BGE model status:

```text
downloaded=True
model_path=models/bge-small-zh-v1.5
embedding_mode=real
vector_dimension=512
```

Note: `BAAI/bge-small-zh-v1.5` reports a 512-dimensional embedding vector in this environment. Project docs and mock embedding defaults are aligned to 512.

## Real Acceptance Result

Real acceptance was attempted with:

```text
RAG_EMBEDDING_MODE=real
RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5
LLM_PROVIDER=deepseek
```

Real embedding info:

```text
model_name=models/bge-small-zh-v1.5
embedding_mode=real
vector_dimension=512
```

Uploaded and rebuilt real files:

```text
test_course.docx -> doc_001 -> chunks=20 -> rebuild_success=True
test_course.pdf  -> doc_002 -> chunks=3  -> rebuild_success=True
test_course.txt  -> doc_003 -> chunks=8  -> rebuild_success=True
```

Runtime artifacts verified:

```text
uploads/raw/{document_id}/{filename}=exists
uploads/processed/{document_id}.json=exists
SQLite chunks rows=31
vector_store/faiss_index/index.faiss=exists
vector_store/faiss_index/metadata.json=exists
```

Real `/chat/query` request:

```json
{
  "question": "云计算的五个基本特征是什么？",
  "top_k": 5
}
```

Real `/chat/query` response summary:

```text
success=True
model=deepseek
answer_non_empty=True
source_count=5
```

Answer preview:

```text
根据课程资料，云计算的五个基本特征包括：按需自助服务、广泛网络访问、资源池化、快速弹性、可计量服务。
```

Source example:

```json
{
  "filename": "test_course.docx",
  "page": null,
  "chunk_index": 13,
  "score": 0.953553,
  "preview": "统一测试问题 | 云计算的五个基本特征是什么？"
}
```

Logs and stats:

```text
logs_count=1
stats_before={document_count: 0, chunk_count: 0, question_count: 0, latest_question_time: null}
stats_after={document_count: 3, chunk_count: 31, question_count: 1, latest_question_time: 2026-06-16T09:39:42+00:00}
```

## LLM Status

Configured provider:

```text
LLM_PROVIDER=deepseek
```

DeepSeek API key:

```text
configured=True
```

Real LLM call succeeded after real embedding rebuild completed. No full API key was recorded.

## Current Blockers

No active blocker prevents the Stage 2 Step 3 real RAG query flow from running locally.

No active blocker remains for the real RAG query path.

## Not Submitted

The following runtime artifacts remain untracked/ignored and must not be committed:

```text
.env
data/edurag.db
data/edurag_stage2_real.db
uploads/raw/*
uploads/processed/*
vector_store/faiss_index/*
models/
```
