# Backend API Guidelines

Owner: A

This document explains how A should implement and review the backend work. It is the practical backend guide that connects the module contract, API design, deployment notes, and acceptance records.

## Required References

Before changing backend code, read these files in order:

1. `docs/module_contracts.md`
   - Source of truth for data objects, API response envelope, error codes, and cross-module boundaries.
   - Use it when defining Pydantic schemas and backend response shapes.

2. `docs/api_design.md`
   - Source of truth for endpoint paths, HTTP methods, owners, and expected request/response behavior.
   - Update it in the same PR if any endpoint path, request field, response field, or status behavior changes.

3. `docs/deployment_guide.md`
   - Source of truth for Docker Compose, Nginx, cloud deployment, and public access notes.
   - Use it when changing `docker-compose.yml`, `nginx/default.conf`, environment variables, or runtime startup steps.

4. `docs/acceptance/2026-06-14.md`
   - First integration acceptance record.
   - Use it to check whether the backend skeleton is ready for stage 1.

5. `.github/pull_request_template.md`
   - Required PR evidence and checklist.
   - A should reject backend PRs that change interfaces without updating contract docs.

## Backend Ownership

A owns:

```text
backend/
docker-compose.yml
nginx/
.env.example
docs/api_design.md
docs/deployment_guide.md
docs/acceptance/
README.md backend-related sections
```

A reviews but does not directly own:

```text
rag/document_loader.py
rag/text_splitter.py
rag/embedding.py
rag/vector_store.py
rag/retriever.py
rag/llm_client.py
rag/qa_chain.py
frontend/
```

Backend code should call RAG modules through service-layer functions. Frontend code must call backend APIs only.

## Backend Directory Rules

Use this backend layout:

```text
backend/app/main.py                 FastAPI app creation and router registration
backend/app/api/routes/             API route files
backend/app/api/schemas/            Pydantic request/response schemas
backend/app/core/                   settings and shared config
backend/app/database/               database session and connection setup
backend/app/models/                 SQLAlchemy models
backend/app/services/               business logic and RAG orchestration calls
backend/app/utils/                  small shared helpers
backend/tests/                      backend smoke tests
```

Do not put database logic, file parsing, vector retrieval, or LLM calls directly inside route functions. Route functions should validate input, call a service, and return the unified API response.

## Required Backend Schemas

Create Pydantic schemas that mirror `docs/module_contracts.md`:

```text
ApiResponse
Document
Chunk
RetrievedChunk
ChatQuery
ChatAnswer
QaLog
Stats
```

Rules:

- Schema field names must use English `snake_case`.
- API responses must use `{ success, data, message, error_code }`.
- Time fields must be ISO 8601 strings.
- Missing optional values must be `null`.
- If schema fields change, update `docs/module_contracts.md` and `docs/api_design.md`.

## Required Backend Routes

Stage 1 should create route placeholders for:

```text
GET    /health
POST   /upload
GET    /documents
DELETE /documents/{document_id}
POST   /documents/{document_id}/rebuild
POST   /chat/query
GET    /logs
GET    /stats
```

Stage 1 does not need full business logic for every endpoint, but every placeholder must return the unified response shape and must not contradict the contract.

## Service Boundaries

Backend services should be split by responsibility:

```text
document_service     upload, document list, document status, rebuild trigger
qa_service           chat query, retrieval call, QA chain call, no-source handling
log_service          QA log creation and query
stats_service        document count, chunk count, question count
```

Backend should not let routes directly call frontend code or write UI-specific fields. Frontend display fields must come from the contract objects.

## Error Handling Rules

Use error codes from `docs/module_contracts.md`.

Common backend cases:

| Situation | Error code |
| --- | --- |
| Unsupported upload type | `UPLOAD_FILE_TYPE_UNSUPPORTED` |
| Empty uploaded file | `UPLOAD_FILE_EMPTY` |
| Missing document | `DOCUMENT_NOT_FOUND` |
| Parser or splitter failure | `DOCUMENT_PROCESSING_FAILED` |
| FAISS index missing | `VECTOR_INDEX_NOT_READY` |
| No reliable retrieval source | `RETRIEVAL_NO_SOURCE` |
| DeepSeek/Qwen unavailable | `LLM_PROVIDER_UNAVAILABLE` |
| QA chain failure | `QA_CHAIN_FAILED` |

## Stage 1 Acceptance for A

A passes the first backend task when:

- FastAPI starts successfully.
- `/health` returns the unified response shape.
- Pydantic schema placeholders exist for contract objects.
- Route placeholders exist for the planned endpoints.
- Backend directory structure follows this document.
- `docs/api_design.md` still matches `docs/module_contracts.md`.
- PR evidence includes command output or screenshot for `/health`.

