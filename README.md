# Cloud BigData RAG Assistant

EduRAG is a course-material question answering system for cloud computing and big data coursework. The project builds a complete RAG workflow: document upload, parsing, chunking, embedding, FAISS retrieval, LLM answering, source citation, logs, charts, Docker deployment, and public cloud access.

## Tech Stack

- Frontend: React, Vite, Ant Design, ECharts, Axios, React Router
- Backend: FastAPI, Uvicorn, Pydantic, SQLAlchemy, Alembic
- Database: SQLite for development, PostgreSQL for deployment
- RAG: LangChain, FAISS, bge-small-zh-v1.5 embedding
- LLM: DeepSeek API or Qwen API
- Deployment: Docker, Docker Compose, Nginx, cloud server

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

