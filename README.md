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

## Frontend Premium UI Redesign and System Settings

The frontend has been upgraded into a premium Apple macOS / Apple Intelligence inspired interface while keeping the existing React + Vite + Ant Design architecture and the original API contract-driven workflow.

### Frontend UI Upgrade Goals

The redesigned interface focuses on:

- A modern Apple-style visual language with clean spacing, rounded cards, and soft hierarchy.
- Glassmorphism panels using translucent backgrounds, high blur, subtle borders, and low-opacity shadows.
- A premium AI product aesthetic based on soft mesh gradients, acrylic materials, and restrained visual accents.
- A contract-safe frontend design that can run with mock data first and switch to real backend APIs later without changing page logic.
- A professional SaaS-level presentation quality suitable for course project demos, integration acceptance, and final reporting.

### Redesigned Frontend Pages

| Page | Route | Upgrade Summary |
| --- | --- | --- |
| Upload Center | `/upload` | Premium drag-and-drop upload area, file type badges, upload status preview, and document object display. |
| Knowledge Base Overview | `/knowledge-base` | Borderless glass table, document status tags, search/filter toolbar, and knowledge asset metric cards. |
| Smart Chat Workspace | `/chat` | Split workspace for question input, answer rendering, source cards, local session memory, and no-source fallback state. |
| QA Logs | `/logs` | Refined audit timeline showing questions, answers, model information, source count, and search/filter controls. |
| Dashboard | `/dashboard` | Metric cards, quality gate panel, frontend integration timeline, and chart visualization. |

### System Settings and Theme Selector Matrix

The system settings button in the top header now opens a premium Apple-style settings modal. It provides a visual theme selector matrix and multiple personalization controls.

Core files:

```text
frontend/src/components/SystemSettings.jsx
frontend/src/settings/themeConfig.js
frontend/src/layouts/MainLayout.jsx
frontend/src/assets/styles.css
```

The settings panel supports:

- Theme switching with a visual preview matrix.
- Local persistence through `localStorage`.
- Appearance mode selection: Auto, Light, and Dark.
- Adjustable glass blur intensity.
- Elegant motion toggle.
- Compact layout toggle.
- Search shortcut hint toggle.
- Rounded corner style selection.
- Reset to default settings.

### Built-in Theme Matrix

| Theme | Visual Direction | Best Use Case |
| --- | --- | --- |
| Aurora Intelligence | Deep aurora purple, cyber magenta, and muted pink gradients inspired by Apple Intelligence. | Daily AI RAG interaction and general product demonstration. |
| Cupertino Classic | Clean Apple system white, restrained blue accents, and low-distraction layout. | Long document reading and contract field checking. |
| Pro Space Gray | Dark acrylic panels, graphite background, and titanium-like highlights. | Night work, QA log review, and API integration debugging. |
| Starlight Luxury | Warm starlight white, champagne gold, and soft premium shadows. | Dashboard presentation and final project showcase. |
| Alpine Sage | Morandi green, sage accents, and calm knowledge-management styling. | Knowledge base management and chunk review. |

### Frontend Contract-Safe Design

The UI is intentionally separated from backend implementation details. Frontend pages only depend on stable API response fields and runtime validation.

Important frontend behaviors:

- Mock API mode can be used for frontend demonstration before backend integration is complete.
- UI labels are localized into Chinese for end users.
- Backend field names such as `document_count`, `chunk_count`, `question_count`, `processed`, and `uploaded` are rendered as readable Chinese labels.
- Empty source responses are handled gracefully without page crashes.
- Settings changes do not affect API contracts or data flow.

### Screenshot Assets

Recommended screenshot location:

```text
docs/screenshots/frontend/
```

Suggested screenshot mapping:

```text
docs/screenshots/frontend/1.png  Upload Center
docs/screenshots/frontend/2.png  Knowledge Base Overview
docs/screenshots/frontend/3.png  Smart Chat Workspace
docs/screenshots/frontend/4.png  QA Logs
docs/screenshots/frontend/5.png  Dashboard
docs/screenshots/frontend/6.png  System Settings Theme Matrix
```

These screenshots can be used in the final report, PPT, and acceptance record to demonstrate the frontend redesign.

### Frontend Verification

Run the frontend locally:

```powershell
cd frontend
npm install
npm run dev
```

Build verification:

```powershell
cd frontend
npm run build
```

Acceptance checklist:

- All five frontend pages are reachable from the sidebar.
- The system settings button opens the settings modal.
- Theme switching works immediately and persists after page refresh.
- Mock API mode still renders upload, knowledge base, chat, logs, and dashboard data.
- The layout remains responsive on common laptop and browser widths.
- No frontend page depends on internal RAG module files.

### Frontend Contribution Summary

This frontend update improves EduRAG Pro from a basic admin-style interface into a polished AI knowledge assistant dashboard. It adds Apple-inspired visual quality, a complete theme personalization system, improved page hierarchy, refined mock-data presentation, and stronger demonstration value for integration and final project acceptance.
