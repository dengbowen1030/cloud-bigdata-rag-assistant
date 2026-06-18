# Dev Integration Acceptance Report

Date: 2026-06-15

Branch: `dev`

Base commit checked: `ddc983c`

## Scope

This report records the first integration acceptance pass after A/B/C/D/E stage-one work was merged into `dev`.

The goal was to verify whether the merged application can run, whether API contracts still match the docs, and whether the B/C/D data chain can connect without changing contract fields.

## Repository State

- Current branch: `dev`
- Tracked remote: `origin/dev`
- Required directories exist:
  - `backend/`
  - `frontend/`
  - `rag/`
  - `scripts/`
  - `docs/`
  - `uploads/`
  - `vector_store/`
- Dependency files exist:
  - `backend/requirements.txt`
  - `frontend/package.json`
  - `frontend/package-lock.json`
  - `docker-compose.yml`

## Backend Result

Backend minimal runtime dependencies were installed for validation:

```powershell
python -m pip install fastapi uvicorn pydantic python-multipart httpx requests
```

The full backend dependency install was attempted:

```powershell
python -m pip install -r backend\requirements.txt
```

Result: timed out during full dependency installation. The likely cause is the heavier RAG dependency set and network/runtime restrictions. FastAPI validation continued with the minimal API dependency set.

Backend tests passed:

```powershell
python -m unittest discover -s backend\tests -p "test_*.py"
```

Result:

```text
Ran 4 tests
OK
```

Backend startup was verified with:

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The following API checks returned the unified envelope shape:

| API | Result |
| --- | --- |
| `GET /health` | `success=true` |
| `GET /documents` | `success=true` |
| `POST /upload` | `success=true` |
| `POST /documents/{document_id}/rebuild` | `success=true` |
| `POST /chat/query` | `success=true` |
| `GET /logs` | `success=true` |
| `GET /stats` | `success=true` |

Required response envelope:

```json
{
  "success": true,
  "data": {},
  "message": "",
  "error_code": null
}
```

## Frontend Result

Frontend dependencies were installed with:

```powershell
cd frontend
npm.cmd install
```

Frontend production build passed:

```powershell
npm.cmd run build
```

Result:

```text
vite build
2139 modules transformed
built successfully
```

Vite dev server was verified on a local port:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5174
```

Result:

```text
GET http://127.0.0.1:5174 -> 200
```

Frontend API paths checked:

| Frontend call | Backend endpoint |
| --- | --- |
| upload | `POST /upload` |
| documents | `GET /documents` |
| chat | `POST /chat/query` |
| logs | `GET /logs` |
| stats | `GET /stats` |

Mock data still exists in `frontend/src/api/mockData.js`.

`VITE_USE_MOCK` currently controls whether frontend uses mock data or backend APIs. Real backend integration requires:

```text
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## B/C/D Chain Result

A sample integration chain was verified:

```text
B process_document_text
  -> Chunk[]
  -> C Retriever + FAISS mock embedding
  -> RetrievedChunk[]
  -> D answer_question
  -> ChatAnswer
```

Observed contract fields:

`Chunk[]`:

```text
chunk_id
document_id
filename
page
chunk_index
content
metadata
```

`RetrievedChunk[]`:

```text
chunk_id
document_id
content
score
source.filename
source.page
source.chunk_index
```

`ChatAnswer`:

```text
question
answer
sources
model
created_at
```

The D module now imports correctly as `rag.qa_chain`, and `ChatAnswer.model` can remain `deepseek` while the LLM client falls back to mock when no API key is configured.

## Fixes Applied

Minimal fixes made during this acceptance pass:

- Added local development CORS support to FastAPI for Vite:
  - `http://127.0.0.1:5173`
  - `http://localhost:5173`
- Added `requests` to `backend/requirements.txt` because `rag/llm_client.py` imports it.
- Fixed D module import path:
  - from top-level `llm_client`
  - to package import `rag.llm_client`
- Fixed `MockLLMClient.chat()` to return a string instead of `None`.
- Fixed frontend `Stats` contract guard to allow `latest_question_time = null`, matching `docs/module_contracts.md`.
- Replaced backend placeholder no-source/log text with readable Chinese.
- Replaced deprecated Pydantic `.copy()` usage with `.model_copy()`.
- Replaced `datetime.utcnow()` with timezone-aware UTC timestamps in backend service placeholders.

No contract fields were changed.

## Unfixed Blockers / Risks

1. Full backend dependency install was not completed in this environment.
   - Minimal FastAPI dependencies installed and backend API validation passed.
   - Full `backend/requirements.txt` may still need to be installed on a normal developer machine or CI runner.

2. `vector_store/faiss_index` is not writable in this local environment.
   - Direct write test failed with access denied.
   - `scripts/test_vector_store.py` fails when saving to the default FAISS path.
   - C's FAISS code works when saving to a writable temporary directory.

3. Several docs/frontend mock strings still appear to contain encoding corruption.
   - Field names and JSON shapes are still checkable.
   - Human-readable Chinese documentation and mock UI copy should be cleaned in a separate docs/UI text pass.

4. Frontend defaults to mock mode unless configured otherwise.
   - This is useful for E's independent UI work.
   - Real integration testing must explicitly set `VITE_USE_MOCK=false`.

## Recommended Next Fix Order

1. Fix local/CI write permissions for `vector_store/faiss_index`, or make vector index output path configurable for tests.
2. Add an integration test that runs B -> C -> D with a temporary FAISS directory.
3. Clean encoding-corrupted Chinese strings in docs and frontend mock data.
4. Add a documented `.env` example for real frontend/backend integration.
5. After B/C/D outputs stabilize, connect backend services to real RAG modules.
6. Only after the RAG data path stabilizes, start SQLite persistence work.
