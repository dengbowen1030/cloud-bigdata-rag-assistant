# Stage 1 Execution Order

This document defines who can start immediately, who depends on another member's output, and what must be updated in docs during the 2026-06-09 to 2026-06-13 stage.

## Stage 1 Goal

By 2026-06-13, the project should have a working skeleton for:

```text
Upload/API skeleton
  -> document parsing
  -> text chunking
  -> embedding prototype
  -> FAISS save/load prototype
  -> mock RAG answer
  -> frontend pages with contract-shaped data
```

The 2026-06-14 acceptance should then verify the first integration path.

## Work That Can Start Immediately

These tasks can start in parallel because they are based on `docs/module_contracts.md`.

| Owner | Can start now | Must follow |
| --- | --- | --- |
| A | Backend schemas, API route placeholders, service placeholders | `docs/backend_api_guidelines.md`, `docs/api_design.md` |
| B | Document parser, cleaning rules, chunk splitter | `docs/module_contracts.md`, `docs/data_processing.md` |
| C | Embedding wrapper, FAISS save/load prototype with sample chunks | `docs/module_contracts.md`, `docs/vector_db_test.md` |
| D | LLM adapter mock, prompt, no-source QA logic with mock retrieved chunks | `docs/module_contracts.md`, `docs/rag_design.md` |
| E | Frontend pages, API client wrapper, contract-shaped mock data | `docs/module_contracts.md`, `docs/api_design.md`, `docs/test_report.md` |

## Dependency Order

### 1. A locks the backend contract surface

A should finish first or provide placeholders early for:

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

Why this matters:

- E needs these paths for API wrapper naming.
- B/C/D need to know how their modules will be called by backend services.
- A must keep API responses aligned with `{ success, data, message, error_code }`.

E can still build mock pages before A finishes, but E must not invent API fields.

### 2. B produces real `Chunk[]`

B's output unlocks C's real test data.

Minimum output:

```text
Document
Chunk[]
uploads/processed/{document_id}.json
docs/data_processing.md test notes
```

C can use mock chunks before B finishes, but C cannot claim full pass until B's real `Chunk[]` can be embedded.

### 3. C builds and tests FAISS with `Chunk[]`

C's output unlocks D's real retrieval input.

Minimum output:

```text
RetrievedChunk[]
vector_store/faiss_index/
docs/vector_db_test.md retrieval table
```

D can use mock `RetrievedChunk[]` before C finishes, but D cannot claim full pass until C's retrieval output can be used by `qa_chain.py`.

### 4. D produces `ChatAnswer`

D's output unlocks E's real chat page integration and A's `/chat/query` service behavior.

Minimum output:

```text
ChatAnswer
no-source refusal result
docs/rag_design.md prompt and test notes
```

E can use mock `ChatAnswer` before D finishes, but E cannot claim full chat integration until D's output shape is verified.

### 5. E switches from mock data to API integration

E starts with contract-shaped mock data, then connects to A's API once A's route placeholders are ready.

Minimum output:

```text
Upload page
KnowledgeBase page
Chat page
API wrapper
docs/test_report.md screenshots
```

E should not wait for B/C/D to finish all logic. E only needs the contract shape and A's API paths to build the page skeleton.

## Practical Timeline

| Day | Priority | Expected result |
| --- | --- | --- |
| 6/9 | A + docs | Backend/API contract is visible; all owners know docs to follow |
| 6/10 | A + B + E | Upload route placeholder, parser start, frontend upload/knowledge pages |
| 6/11 | B + C + E | First `Chunk[]`, embedding prototype, frontend chat mock page |
| 6/12 | C + D | FAISS save/load, mock retrieval, QA chain with sources |
| 6/13 | All | Evidence cleanup, docs updated, screenshots/test outputs ready |
| 6/14 | A leads | First integration acceptance |

## Docs That Must Be Updated

Every owner must update their own evidence document:

| Owner | Must update |
| --- | --- |
| A | `docs/backend_api_guidelines.md` if backend rules change; `docs/api_design.md` if API fields/routes change |
| B | `docs/data_processing.md` |
| C | `docs/vector_db_test.md` |
| D | `docs/rag_design.md` |
| E | `docs/test_report.md` |

Everyone must update `docs/module_contracts.md` if they change:

```text
object fields
API response shape
error codes
cross-module data formats
```

## Blocker Rules

Use these rules to decide whether someone is blocked or can continue with mocks:

- E is not blocked by A/B/C/D. E can use contract-shaped mock data.
- C is not blocked by B. C can use sample `Chunk[]`, but final evidence must use B's real chunks.
- D is not blocked by C. D can use mock `RetrievedChunk[]`, but final evidence must use C's real retrieval output.
- A is not blocked by B/C/D/E. A can implement route and service placeholders first.
- Full integration is blocked until B -> C -> D outputs are compatible.

## Stage 1 Acceptance Dependency Chain

The final 6/14 chain is:

```text
A backend route exists
  -> B parses and chunks documents
  -> C embeds chunks and builds FAISS
  -> D answers from retrieved chunks
  -> E displays documents, answer, and sources
  -> A records acceptance result
```

