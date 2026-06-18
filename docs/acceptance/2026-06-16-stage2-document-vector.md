# Stage 2 Document Ingestion And Vector Index Acceptance

Date: 2026-06-16

## Scope

This acceptance record covers Stage 2 Step 2: document ingestion, chunk persistence, processed JSON output, local embedding configuration, FAISS index generation, and Top-K retrieval format.

This step does not implement LLM answer generation, frontend integration, Docker, Nginx, OCR, or cloud database deployment.

## Runtime Paths

| Item | Path |
| --- | --- |
| SQLite database | `data/edurag.db` |
| Raw uploads | `uploads/raw/{document_id}/{original_filename}` |
| Processed chunk JSON | `uploads/processed/{document_id}.json` |
| FAISS index | `vector_store/faiss_index/index.faiss` |
| FAISS metadata | `vector_store/faiss_index/metadata.json` |
| Local embedding model | `models/bge-small-zh-v1.5` |

Runtime artifacts are ignored by Git:

```text
data/edurag.db
data/*.db
data/*.sqlite
data/*.sqlite3
/models/
uploads/raw/*
uploads/processed/*
uploads/temp/*
vector_store/faiss_index/*
```

## Supported File Types

`POST /upload` currently accepts only:

```text
.pdf
.docx
.txt
```

Rejected in this stage:

```text
.xlsx
.doc
OCR-only scanned PDF
images
PPT/PPTX
```

Unsupported uploads return:

```json
{
  "success": false,
  "data": null,
  "message": "Unsupported file type. Allowed types: PDF, DOCX, TXT.",
  "error_code": "UPLOAD_FILE_TYPE_UNSUPPORTED"
}
```

Empty uploads return `UPLOAD_FILE_EMPTY`.

## Database Tables

### `documents`

```text
document_id primary key
filename
file_type
file_size
status
chunk_count
created_at
```

### `qa_logs`

```text
log_id primary key
question
answer
source_count
model
created_at
```

### `chunks`

```text
chunk_id primary key
document_id
filename
page
chunk_index
content
metadata_json
created_at
```

`metadata_json` stores the contract `metadata` object, including `source` and `section`.

## API Behavior

| API | Database / Vector Behavior |
| --- | --- |
| `POST /upload` | Saves raw file and creates a `documents` row with `status=uploaded`, `chunk_count=0`. |
| `GET /documents` | Reads real `documents` rows from SQLite. |
| `DELETE /documents/{document_id}` | Deletes the document row, related chunks, raw upload directory, and processed JSON. |
| `POST /documents/{document_id}/rebuild` | Parses PDF/DOCX/TXT, creates `Chunk[]`, writes `chunks`, writes processed JSON, rebuilds FAISS. |
| `POST /chat/query` | Still returns the placeholder no-source answer, but persists a real `QaLog`. |
| `GET /logs` | Reads real `qa_logs` rows from SQLite. |
| `GET /stats` | Counts from SQLite: documents, chunk totals, questions, latest question time. |

## Embedding Rules

Formal runtime config:

```text
RAG_EMBEDDING_MODE=real
RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5
RAG_EMBEDDING_DOWNLOAD=0
VECTOR_STORE_DIR=vector_store/faiss_index
```

When `RAG_EMBEDDING_MODE=real` and the local model is missing, rebuild fails with `DOCUMENT_PROCESSING_FAILED`. It must not silently fall back to mock and pretend the FAISS index is production-ready.

Automated smoke tests use `RAG_EMBEDDING_MODE=mock` only to verify database, chunk, JSON, FAISS file generation, and retrieval contract without downloading large model files.

Expected real model info after the local model is installed:

```json
{
  "model_name": "models/bge-small-zh-v1.5",
  "embedding_mode": "real",
  "vector_dimension": 512
}
```

`BAAI/bge-small-zh-v1.5` was locally verified with 512-dimensional vectors in Stage 2. Mock tests use the same default dimension so test and real FAISS indexes stay aligned.

## Validation Commands

Run backend smoke tests:

```powershell
python -m unittest discover -s backend\tests -p "test_*.py"
```

Start the backend:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Manual API checks:

```text
GET /health
POST /upload
GET /documents
POST /documents/{document_id}/rebuild
GET /stats
POST /chat/query
GET /logs
```

## Acceptance Results

Automated test result:

```text
Ran 9 tests in 0.905s
OK
```

Covered by smoke tests:

- Unified response envelope is preserved.
- `.xlsx` and `.doc` uploads are rejected.
- Empty upload is rejected.
- TXT upload creates a real `Document` row and raw file.
- Minimal DOCX upload can be rebuilt into chunks.
- Minimal text-based PDF upload can be rebuilt into chunks.
- New `TestClient` can read persisted documents from SQLite.
- Rebuild creates valid chunks and stores them in SQLite.
- Rebuild writes `uploads/processed/{document_id}.json`.
- Rebuild writes `index.faiss` and `metadata.json`.
- Top-K retrieval returns `RetrievedChunk[]`-shaped data.
- Repeated rebuild does not duplicate chunks.
- Chat query saves a real `QaLog`.
- Stats counts documents, chunks, questions, and latest question time from SQLite.
- Real embedding mode fails when the configured local model path is missing.

Manual checks still recommended after installing the local BGE model:

- Rebuild a TXT document with `RAG_EMBEDDING_MODE=real`.
- Confirm `metadata.json` reports `embedding_mode=real` and `vector_dimension=512`.
- Rebuild a course-sized DOCX document.
- Rebuild a course-sized text-based PDF.
- Confirm scanned or no-text PDF returns `DOCUMENT_PROCESSING_FAILED`.

## Remaining Placeholders

- No OCR for scanned PDFs.
- No XLSX or legacy DOC parser.
- No LLM generation in `/chat/query`.
- No source-grounded RAG answer chain yet.
- No frontend API integration changes in this step.
- No Docker/Nginx changes in this step.

## Current Blocker

Formal real-embedding acceptance requires the local model directory:

```text
models/bge-small-zh-v1.5
```

Without that directory and with `RAG_EMBEDDING_DOWNLOAD=0`, rebuild intentionally fails instead of using mock embeddings.
