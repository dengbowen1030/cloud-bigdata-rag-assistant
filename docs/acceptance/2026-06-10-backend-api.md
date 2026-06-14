# Acceptance Record: Backend API Skeleton

Date: 2026-06-10

Owner: A

Branch: `feature/backend-api`

## Scope

This record verifies the first A task: backend API and project collaboration skeleton initialization.

This task only covers the FastAPI API skeleton, response envelope, schemas, route placeholders, and smoke tests. It does not implement B/C/D/E business logic.

## Delivered Code

- FastAPI app entry: `backend/app/main.py`
- API routes:
  - `GET /health`
  - `POST /upload`
  - `GET /documents`
  - `DELETE /documents/{document_id}`
  - `POST /documents/{document_id}/rebuild`
  - `POST /chat/query`
  - `GET /logs`
  - `GET /stats`
- Contract schemas under `backend/app/api/schemas/`
- Service placeholders under `backend/app/services/`
- Unified response helpers under `backend/app/utils/responses.py`
- Smoke tests under `backend/tests/test_api_smoke.py`

## Test Evidence

Local test commands:

```powershell
python -m unittest discover -s backend\tests -p "test_*.py"
```

Result:

```text
Ran 4 tests
OK
```

Local server command:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Result:

```text
Application startup complete.
Uvicorn running on http://127.0.0.1:8000
```

Swagger manual checks at `http://127.0.0.1:8000/docs`:

| Endpoint | Result |
| --- | --- |
| `GET /health` | 200 |
| `GET /documents` | 200 |
| `POST /chat/query` | 200 |
| `GET /logs` | 200 |
| `GET /stats` | 200 |

## Contract Check

- API responses use `{ success, data, message, error_code }`.
- `/chat/query` returns `ChatAnswer`.
- No-source answers return an empty `sources` list and do not invent citations.
- The current implementation is an A-owned skeleton only. Real parsing, embedding, FAISS retrieval, LLM calls, and frontend rendering remain owned by B/C/D/E.

## Handoff

- B can connect document parsing output to the document rebuild flow.
- C can connect FAISS retrieval output as `RetrievedChunk[]`.
- D can replace the placeholder chat answer with the real LangChain + DeepSeek/Qwen QA flow.
- E can call the API contract through the FastAPI endpoints and render only contract fields.

## Current Issues

- Data is stored in memory for the skeleton stage only.
- `POST /upload` validates file type and stores document metadata, but does not parse content.
- `POST /documents/{document_id}/rebuild` returns a placeholder rebuild result until B/C integration is ready.
- `POST /chat/query` returns a no-source placeholder answer until C/D integration is ready.
