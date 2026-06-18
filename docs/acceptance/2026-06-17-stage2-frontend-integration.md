# Stage 2 Frontend Integration Acceptance

Date: 2026-06-17

## Scope

This record covers Step 4: React frontend integration with the real FastAPI backend.

No Docker, Nginx, frontend redesign, or backend contract field changes were included.

## Runtime Configuration

Backend start command:

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend check URLs:

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
```

Frontend start command:

```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend environment:

```text
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

`frontend/.env` is local only and must not be committed.

## Frontend Changes Verified

- Upload page only allows PDF, DOCX, and TXT.
- Upload page `accept` is `.pdf,.docx,.txt`.
- Mock document data no longer recommends or demonstrates XLSX.
- `frontend/src/api/documents.js` provides:
  - `rebuildDocument(document_id)`
  - `deleteDocument(document_id)`
- Knowledge Base page has a `重建索引` action column.
- Chat page handles `VECTOR_INDEX_NOT_READY` with: `请先上传文档并重建索引。`
- Sources display:
  - `filename`
  - `page`
  - `chunk_index`
  - `score`
  - `preview`
- Page `null` is displayed as `-`.

## Real Acceptance Data

Test files:

```text
data/raw/cloud_course_test_files/test_course.txt
data/raw/cloud_course_test_files/test_course.docx
data/raw/cloud_course_test_files/test_course.pdf
```

Upload results:

```text
doc_004 test_course.txt  uploaded
doc_005 test_course.docx uploaded
doc_006 test_course.pdf  uploaded
```

Rebuild results:

```text
doc_004 processed chunk_count=8
doc_005 processed chunk_count=20
doc_006 processed chunk_count=3
```

Runtime artifact checks:

```text
uploads/raw/doc_004/test_course.txt      exists
uploads/raw/doc_005/test_course.docx     exists
uploads/raw/doc_006/test_course.pdf      exists
uploads/processed/doc_004.json           exists
uploads/processed/doc_005.json           exists
uploads/processed/doc_006.json           exists
vector_store/faiss_index/index.faiss     exists
vector_store/faiss_index/metadata.json   exists
```

## Chat Query Result

Request:

```json
{
  "question": "云计算的五个基本特征是什么？",
  "top_k": 5
}
```

Response summary:

```text
success=true
model=deepseek
source_count=5
answer=根据课程资料，云计算的五个基本特征包括：按需自助服务、广泛网络访问、资源池化、快速弹性、可计量服务。
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

## Logs And Stats

Logs:

```text
latest question=云计算的五个基本特征是什么？
latest source_count=5
latest model=deepseek
```

Stats:

```text
document_count=6
chunk_count=62
question_count=3
latest_question_time=2026-06-17T05:02:07+00:00
```

## Browser Check

Opened:

```text
http://127.0.0.1:5173/upload
http://127.0.0.1:5173/chat
```

Observed:

- Frontend loads successfully.
- Header shows `真实接口`.
- Chat page shows the real API mode, input area, send button, and source card area.

The Browser automation click did not trigger React state update during this run, while backend stats confirmed no request was sent. The real backend flow was therefore verified through TestClient against the same FastAPI app and local runtime files. Manual browser click should still be checked by the project owner in Chrome.

## Test Results

Backend:

```powershell
python -m unittest discover -s backend\tests -p "test_*.py"
```

Result:

```text
Ran 11 tests in 0.879s
OK
```

Frontend:

```powershell
cd frontend
npm run build
```

Result:

```text
vite build succeeded
```

## Current Blockers

- No code blocker for frontend build or backend API contract.
- Browser automation click did not submit the Chat form in this environment; manual UI click should be checked locally.
- Ant Design v6 emits deprecation warnings for some existing components (`Space.direction`, `Steps.direction`, `Modal.destroyOnClose`). These are not Step 4 blockers.

## Step 4.8 Fix: Embedding Path And Chat Error Envelope

Issue:

```text
When backend was started from backend/, RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5
was resolved against backend/ instead of the repository root.
The missing model raised FileNotFoundError and /chat/query could return a bare 500,
which appeared as Network Error in the frontend.
```

Fix:

- `rag/embedding.py` now resolves local relative model paths from the repository root.
- Absolute model paths are still supported.
- Hugging Face repo ids are preserved for download-enabled runs.
- `/chat/query` now wraps model path, LLM provider, FAISS readiness, and unexpected errors in the unified response envelope.
- Chat page displays backend `message` for `success=false`, including model path errors.

Verification with repository-root `.env`:

```text
RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5
```

Backend current directory:

```text
backend/
```

Positive `/chat/query` result:

```text
status=200
success=true
error_code=null
answer non-empty
source_count=5
```

Missing model path result:

```text
status=200
success=false
error_code=QA_CHAIN_FAILED
message=本地 embedding 模型不可用，请检查 models/bge-small-zh-v1.5 或 RAG_EMBEDDING_MODEL_PATH。
data=null
```

Regression tests:

```text
Ran 13 tests in 1.241s
OK
```

Frontend build:

```text
npm.cmd run build
vite build succeeded
```
