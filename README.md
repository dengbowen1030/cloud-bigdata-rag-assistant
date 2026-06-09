# Cloud BigData RAG Assistant

EduRAG is a course-material question answering system for cloud computing and big data coursework. The project builds a complete RAG workflow: document upload, parsing, chunking, embedding, FAISS retrieval, LLM answering, source citation, logs, charts, Docker deployment, and public cloud access.

## Tech Stack

- Frontend framework: React + Vite + Ant Design
- Backend framework: FastAPI
- RAG orchestration: LangChain
- Vector database: FAISS
- Embedding model: bge-small-zh-v1.5
- LLM API: DeepSeek API or Qwen API
- Database: SQLite for development, PostgreSQL for deployment
- Deployment: Docker Compose + Nginx

LangChain is used inside the RAG workflow only. The full application framework is React frontend + FastAPI backend + LangChain RAG orchestration + FAISS retrieval + DeepSeek/Qwen answer generation.

## Module Interaction Contract

All members must follow `docs/module_contracts.md` for data formats, API response shape, error codes, and cross-module boundaries.

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

Contract rules:

- Frontend code calls backend APIs only and must not import files under `rag/`.
- B outputs `Chunk[]` to C.
- C outputs `RetrievedChunk[]` to D.
- D outputs `ChatAnswer` to A/E through backend APIs.
- API responses must use `{ success, data, message, error_code }`.
- Any PR that changes interface fields must update both `docs/module_contracts.md` and `docs/api_design.md`.

## Owner Reference Docs

| Owner | Start here |
| --- | --- |
| A | `docs/backend_api_guidelines.md` |
| B | `docs/data_processing.md` |
| C | `docs/vector_db_test.md` |
| D | `docs/rag_design.md` |
| E | `docs/test_report.md` |

All owners must also follow `docs/module_contracts.md`.

Stage 1 execution order and dependency rules are documented in `docs/stage1_execution_order.md`.

Collaboration rules and handoff requirements are documented in:

```text
docs/contribution_rules.md
docs/handoff_protocol.md
```

## Team Responsibilities

| Member | Main Role | Code Area | Non-code Deliverables |
| --- | --- | --- | --- |
| A | Leader, backend architecture, integration, deployment | `backend/`, `nginx/`, `docker-compose.yml` | README, deployment guide, acceptance records, report/PPT integration |
| B | Data processing | `rag/document_loader.py`, `rag/text_splitter.py`, `data/`, `uploads/` | `docs/data_processing.md`, sample data list |
| C | Embedding, FAISS, retrieval | `rag/embedding.py`, `rag/vector_store.py`, `rag/retriever.py`, `vector_store/` | `docs/vector_db_test.md`, retrieval test table |
| D | RAG QA and LLM adapter | `rag/llm_client.py`, `rag/qa_chain.py` | `docs/rag_design.md`, QA case library |
| E | Frontend GUI, visualization, testing | `frontend/` | `docs/test_report.md`, screenshots, demo video |

## Directory Map

```text
backend/          FastAPI backend, database models, API routes, logs, stats
frontend/         React GUI, upload page, knowledge base page, chat page, charts
rag/              Document loading, chunking, embedding, FAISS, retriever, QA chain
data/             Raw samples, FAQ, manually curated course materials
uploads/          Runtime upload directories: raw, processed, temp
vector_store/     FAISS index and vector database artifacts
scripts/          Index build, demo data seed, release export scripts
nginx/            Nginx reverse proxy configuration
docs/             API design, reports, test docs, acceptance records, screenshots
.github/          Issue and pull request templates
```

## Branch Rules

- `main`: stable submission branch.
- `dev`: daily integration branch.
- `feature/backend-api`: A, backend API and database.
- `feature/data-processing`: B, parsing, cleaning, chunking.
- `feature/vector-db`: C, embedding, FAISS, retrieval.
- `feature/rag-qa`: D, prompt, LLM adapter, QA chain.
- `feature/frontend-ui`: E, frontend pages and visualization.
- `deploy/docker-nginx`: A, Docker, Nginx, cloud deployment.
- `docs/report-ppt`: A leads, all members contribute report/PPT/screenshots.

All feature branches should open pull requests into `dev`. A performs final acceptance before merging to `main`.

## Stage Acceptance Plan

| Date | Acceptance | Core Standard |
| --- | --- | --- |
| 2026-06-14 | First integration | Upload -> parse -> chunk works; backend docs and frontend skeleton exist |
| 2026-06-19 | Second integration | Upload -> parse -> chunk -> embedding -> FAISS -> RAG -> frontend -> logs works |
| 2026-06-22 | Release candidate | Cloud URL, Docker release, final screenshots, report/PPT, demo video are frozen |

## Local Development

Backend placeholder:

```powershell
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend placeholder:

```powershell
cd frontend
npm install
npm run dev
```

Docker placeholder:

```powershell
docker compose up -d
```
