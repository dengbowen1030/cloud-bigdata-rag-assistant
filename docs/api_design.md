# API Design Draft

本文档记录后端 API 路径、请求字段、响应字段和错误码。前端可以调整 UI，但不能私自修改本文档列出的 API 路径和字段。

## Backend Owner

A owns backend API design and interface changes. Any field change must be recorded here before frontend integration.

`docs/module_contracts.md` is the source of truth for cross-module objects, API response envelopes, and error codes. If this file changes any field or response shape, `docs/module_contracts.md` must be updated in the same pull request.

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

## Planned Endpoints

| Method | Path | Owner | Purpose | Stage |
| --- | --- | --- | --- | --- |
| GET | `/health` | A | Health check | 6/9 |
| POST | `/upload` | A+B | Upload course materials | 6/10 |
| GET | `/documents` | A+E | List uploaded documents | 6/16 |
| DELETE | `/documents/{document_id}` | A+E | Delete document | 6/16 |
| POST | `/documents/{document_id}/rebuild` | A+C | Rebuild chunks and vector index | 6/18 |
| POST | `/chat/query` | D+A | Ask a RAG question | 6/17 |
| GET | `/logs` | A+E | Query QA logs | 6/17 |
| GET | `/stats` | A+E | Dashboard statistics | 6/18 |

## Frontend API Usage Rules

前端必须通过 `frontend/src/api/` 下的封装调用后端接口。当前真实联调模式为：

```text
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

前端 UI 可以改版，但以下内容不能私自改：

- API 路径。
- API 请求字段。
- API 响应 envelope。
- `Document`、`ChatAnswer`、`RetrievedChunk`、`QaLog`、`Stats` 字段名。
- 上传文件类型限制：只允许 PDF、DOCX、TXT。

当前前端封装必须保持：

| Function | Endpoint |
| --- | --- |
| `uploadDocument(file)` | `POST /upload` |
| `getDocuments()` | `GET /documents` |
| `deleteDocument(document_id)` | `DELETE /documents/{document_id}` |
| `rebuildDocument(document_id)` | `POST /documents/{document_id}/rebuild` |
| `queryChat({ question, top_k })` | `POST /chat/query` |
| `getLogs()` | `GET /logs` |
| `getStats()` | `GET /stats` |

如果后端返回 `success=false`，前端必须展示 `message` 或明确的友好提示，不能只显示 `Network Error`。

## Response Shape

Success:

```json
{
  "success": true,
  "data": {},
  "message": "",
  "error_code": null
}
```

Failure:

```json
{
  "success": false,
  "data": null,
  "message": "错误说明",
  "error_code": "UPLOAD_FILE_TYPE_UNSUPPORTED"
}
```

## Endpoint Contracts

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

- Input: `multipart/form-data`
- Required field: `file`
- Allowed file types: PDF, DOCX, TXT
- Not supported in Stage 2: XLSX, DOC, OCR-only scanned PDF, images, PPT/PPTX
- Output: `Document`

### `GET /documents`

- Output: `Document[]`
- Used by the frontend knowledge base page.

### `DELETE /documents/{document_id}`

- Output: `{ "document_id": "doc_001", "deleted": true }`

### `POST /documents/{document_id}/rebuild`

- Output fields: `document_id`, `chunk_count`, `status`
- Purpose: reparse, split, embed, and rebuild FAISS entries for one document.

### `POST /chat/query`

Input:

```json
{
  "question": "软件开发周期是什么？",
  "top_k": 5
}
```

- Output: `ChatAnswer`
- No-source rule: if retrieval does not return reliable source chunks, the answer must refuse instead of fabricating content.

### `GET /logs`

- Output: `QaLog[]`
- Used by the frontend logs page.

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

