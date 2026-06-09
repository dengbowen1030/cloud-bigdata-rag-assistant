# Module Contracts

This document is the source of truth for EduRAG module boundaries, data formats, API responses, and field naming rules. Any pull request that changes an interface, field name, response shape, or cross-module data format must update this file and `docs/api_design.md` before code is merged.

## Contract Change Process

Contract fields are not frozen forever, but private changes are forbidden.

Any change to these items must be documented in the same PR:

```text
object fields
API request fields
API response shape
error codes
module handoff data
```

Required PR statement:

```text
Contract changed: yes
Changed contract:
Affected owners:
Docs updated:
Migration or compatibility note:
```

Required docs:

```text
docs/module_contracts.md
docs/api_design.md
```

A should reject PRs that change contracts without this documentation.

## Fixed Technical Framework

| Layer | Framework / Tool |
| --- | --- |
| Frontend | React + Vite + Ant Design |
| Backend | FastAPI |
| RAG orchestration | LangChain |
| Vector database | FAISS |
| Embedding model | bge-small-zh-v1.5 |
| LLM API | DeepSeek API or Qwen API |
| Database | SQLite for development, PostgreSQL for deployment |
| Deployment | Docker Compose + Nginx |

LangChain is used only inside the RAG workflow. It does not replace the FastAPI backend or the React frontend.

## Module Flow

```text
React frontend
  -> FastAPI backend API
  -> RAG modules
  -> LangChain orchestration
  -> FAISS retrieval
  -> DeepSeek/Qwen answer generation
  -> FastAPI log/stat persistence
  -> React answer, source, and chart rendering
```

Frontend code must call backend APIs only. It must not import or call files under `rag/`.

## Ownership Boundaries

| Owner | Scope | Main Outputs |
| --- | --- | --- |
| A | Backend API, database, logs, stats, integration, deployment | API responses, logs, stats, acceptance records |
| B | Document loading, cleaning, splitting, sample data | `Document`, `Chunk[]` |
| C | Embedding, FAISS index, retriever | `RetrievedChunk[]` |
| D | Prompt, LLM adapter, RAG QA chain | `ChatAnswer` |
| E | React pages, API integration, charts, screenshots | UI rendered from API contracts |

B, C, and D exchange data through the objects in this document. They should not invent extra required fields without updating this contract.

## General Data Rules

- Field names use English `snake_case` in backend/RAG JSON payloads.
- Text content may be Chinese.
- Time fields use ISO 8601 strings, for example `2026-06-09T20:30:00`.
- IDs are strings for this course project.
- Missing optional values use `null`, not an empty string.
- API response payloads must use the unified response envelope.

## Unified API Response

Success response:

```json
{
  "success": true,
  "data": {},
  "message": "",
  "error_code": null
}
```

Failure response:

```json
{
  "success": false,
  "data": null,
  "message": "错误说明",
  "error_code": "UPLOAD_FILE_TYPE_UNSUPPORTED"
}
```

## Error Codes

| Error code | Meaning |
| --- | --- |
| `UPLOAD_FILE_TYPE_UNSUPPORTED` | Uploaded file type is not PDF, DOCX, TXT, or XLSX |
| `UPLOAD_FILE_EMPTY` | Uploaded file is empty |
| `DOCUMENT_NOT_FOUND` | `document_id` does not exist |
| `DOCUMENT_PROCESSING_FAILED` | Parsing, cleaning, or splitting failed |
| `VECTOR_INDEX_NOT_READY` | FAISS index has not been built or loaded |
| `RETRIEVAL_NO_SOURCE` | Retrieval did not return reliable source chunks |
| `LLM_PROVIDER_UNAVAILABLE` | DeepSeek/Qwen API is unavailable |
| `QA_CHAIN_FAILED` | RAG QA chain failed |

## Core Objects

### Document

Used by upload, knowledge base list, rebuild, logs, and stats.

```json
{
  "document_id": "doc_001",
  "filename": "lecture01.pdf",
  "file_type": "pdf",
  "file_size": 123456,
  "status": "processed",
  "chunk_count": 32,
  "created_at": "2026-06-09T20:00:00"
}
```

Allowed `status` values:

```text
uploaded
processing
processed
failed
```

### Chunk

B outputs `Chunk[]` to C after parsing, cleaning, and splitting.

```json
{
  "chunk_id": "chunk_doc_001_0001",
  "document_id": "doc_001",
  "filename": "lecture01.pdf",
  "page": 3,
  "chunk_index": 1,
  "content": "文本切片内容",
  "metadata": {
    "source": "lecture01.pdf",
    "section": "软件开发周期"
  }
}
```

Rules:

- `content` must not be empty.
- `chunk_index` starts at `1` within each document.
- `page` may be `null` for TXT or sources without page numbers.
- `metadata.source` must match the original filename.

### RetrievedChunk

C outputs `RetrievedChunk[]` to D after embedding and FAISS Top-K retrieval.

```json
{
  "chunk_id": "chunk_doc_001_0001",
  "document_id": "doc_001",
  "content": "命中的文本片段",
  "score": 0.82,
  "source": {
    "filename": "lecture01.pdf",
    "page": 3,
    "chunk_index": 1
  }
}
```

Rules:

- `score` is a number between `0` and `1` after local normalization.
- Results should be sorted from most relevant to least relevant.
- D must not generate a factual answer when reliable sources are missing.

### ChatQuery

Frontend sends this object to `POST /chat/query`.

```json
{
  "question": "软件开发周期是什么？",
  "top_k": 5
}
```

Rules:

- `question` is required and must not be empty.
- `top_k` defaults to `5` when omitted.
- `top_k` should be between `1` and `10`.

### ChatAnswer

D outputs this object to A/E through the backend API.

```json
{
  "question": "软件开发周期是什么？",
  "answer": "根据课程资料，软件开发周期包括...",
  "sources": [
    {
      "filename": "lecture01.pdf",
      "page": 3,
      "chunk_index": 1,
      "score": 0.82,
      "preview": "相关原文摘要"
    }
  ],
  "model": "deepseek",
  "created_at": "2026-06-09T20:30:00"
}
```

Rules:

- `sources` must be an array.
- If no reliable source is found, `answer` must clearly state that the system cannot answer from the current knowledge base.
- `model` must be `deepseek` or `qwen`.

### QaLog

Used by logs and stats pages.

```json
{
  "log_id": "log_001",
  "question": "软件开发周期是什么？",
  "answer": "根据课程资料，软件开发周期包括...",
  "source_count": 2,
  "model": "deepseek",
  "created_at": "2026-06-09T20:30:00"
}
```

### Stats

Used by the frontend dashboard page and `GET /stats`.

```json
{
  "document_count": 10,
  "chunk_count": 320,
  "question_count": 45,
  "latest_question_time": "2026-06-09T21:00:00"
}
```

Rules:

- Count fields must be numbers.
- `latest_question_time` may be `null` when no question has been asked.
- E must render this object without inventing display-only API fields.

## API Contracts

### `GET /health`

Returns backend health.

```json
{
  "success": true,
  "data": {
    "status": "ok"
  },
  "message": "",
  "error_code": null
}
```

### `POST /upload`

Input: `multipart/form-data`

| Field | Required | Description |
| --- | --- | --- |
| `file` | Yes | PDF, DOCX, TXT, or XLSX course material |

Output: `Document`

### `GET /documents`

Output: `Document[]`

Used by the frontend knowledge base page.

### `DELETE /documents/{document_id}`

Output:

```json
{
  "document_id": "doc_001",
  "deleted": true
}
```

### `POST /documents/{document_id}/rebuild`

Output:

```json
{
  "document_id": "doc_001",
  "chunk_count": 32,
  "status": "processed"
}
```

This endpoint reparses, splits, embeds, and rebuilds FAISS entries for the document.

### `POST /chat/query`

Input: `ChatQuery`

Output: `ChatAnswer`

No-source rule: if retrieval does not return reliable source chunks, the answer must refuse to answer from unsupported knowledge instead of fabricating content.

### `GET /logs`

Output: `QaLog[]`

Used by the frontend logs page.

### `GET /stats`

Output:

```json
{
  "document_count": 10,
  "chunk_count": 320,
  "question_count": 45,
  "latest_question_time": "2026-06-09T21:00:00"
}
```

Used by the frontend dashboard page.

## Acceptance Rules

- B passes when at least one PDF, one DOCX, and one TXT can be converted into valid `Chunk[]`.
- C passes when valid `Chunk[]` can be embedded, saved to FAISS, loaded, and queried as valid `RetrievedChunk[]`.
- D passes when a question plus valid `RetrievedChunk[]` returns a valid `ChatAnswer`; no-source cases must refuse.
- E passes when frontend pages render only from API contract fields and do not rely on temporary backend fields.
- A rejects any PR that changes interface fields without updating this file and `docs/api_design.md`.
