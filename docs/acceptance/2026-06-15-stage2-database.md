# Stage 2 Database Acceptance Record

Date: 2026-06-15

Branch: `dev`

## Scope

Stage 2 first step: local SQLite persistence foundation.

This acceptance only covers backend database basics, `Document` persistence, `QaLog` persistence, and real `Stats` counting. It does not implement full document parsing, chunk generation, FAISS rebuild, real RAG answers, Docker, Nginx, or frontend changes.

## Database Configuration

Default database:

```text
data/edurag.db
```

Runtime URL:

```text
sqlite:///D:/Agent_project/CodeX/temporary_job/cloud_data/big_project/cloud-bigdata-rag-assistant/data/edurag.db
```

Override variable:

```text
DATABASE_URL
```

Upload directory variable:

```text
UPLOAD_DIR
```

The database file is ignored by Git through:

```text
data/edurag.db
data/*.db
data/*.sqlite
data/*.sqlite3
```

## Table Summary

`documents`:

```text
document_id string primary key
filename string
file_type string
file_size integer
status string
chunk_count integer
created_at string
```

`qa_logs`:

```text
log_id string primary key
question text
answer text
source_count integer
model string
created_at string
```

These fields map directly to `Document` and `QaLog` in `docs/module_contracts.md`.

## Startup

Backend startup command:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

On startup, `init_db()` creates missing tables with SQLAlchemy `Base.metadata.create_all()`.

Alembic is intentionally not used in this stage.

## Automated Test Evidence

Command:

```powershell
python -m unittest discover -s backend\tests -p "test_*.py"
```

Result:

```text
Ran 6 tests
OK
```

Covered behavior:

- API envelope remains `{ success, data, message, error_code }`.
- Upload creates a persistent `Document`.
- A new TestClient can still read the uploaded `Document`.
- Rebuild updates document status to `processed`.
- Chat query creates a persistent `QaLog`.
- Stats counts documents and questions from SQLite.

## Manual API Evidence

Manual validation used the default `data/edurag.db` path.

Startup created the database:

```text
DB_EXISTS_AFTER_START True
```

API sequence:

```text
GET /stats
POST /upload
GET /documents
GET /stats
POST /documents/{document_id}/rebuild
POST /chat/query
GET /logs
GET /stats
```

Observed result:

```text
BEFORE doc=0 q=0
UPLOAD success=True doc_id=doc_001
DOCS count=1
AFTER_UPLOAD doc=1
REBUILD status=processed
CHAT success=True
LOGS count=1
AFTER_CHAT q=1 latest=2026-06-15T13:36:39+00:00
```

Restart persistence check:

```text
RESTART_DOCS count=1
RESTART_LOGS count=1
RESTART_STATS doc=1 q=1 latest=2026-06-15T13:36:39+00:00
```

## Database-Backed Interfaces

These now use SQLite:

```text
POST /upload
GET /documents
DELETE /documents/{document_id}
POST /documents/{document_id}/rebuild
POST /chat/query   logs the placeholder answer
GET /logs
GET /stats
```

`GET /health` remains stateless.

## Still Placeholder

These are intentionally not implemented in this stage:

```text
real file storage
document parsing
Chunk[] generation
FAISS rebuild
real retrieval
real DeepSeek/Qwen RAG answer
PostgreSQL deployment
Alembic migrations
Docker/Nginx
frontend API mode changes
```

## Current Blockers

- `POST /documents/{document_id}/rebuild` only updates document status and keeps `chunk_count` unchanged.
- `POST /chat/query` still returns a no-source placeholder answer, but now persists the log.
- There is no migration workflow yet; schema changes before deployment require deleting the local SQLite file or adding Alembic later.
