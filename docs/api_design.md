# API Design Draft

## Backend Owner

A owns backend API design and interface changes. Any field change must be recorded here before frontend integration.

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

## Response Shape

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

