# Project Board

## 6/9 Initialization Acceptance

- [ ] Repository is visible on GitHub.
- [ ] `main` and `dev` branches exist.
- [ ] Feature branches are created.
- [x] Base directory structure exists.
- [x] README draft exists.
- [x] API design draft exists.
- [x] Acceptance record templates exist.
- [x] GitHub Issue and PR templates exist.

## Branch Ownership

| Branch | Owner | Scope |
| --- | --- | --- |
| `feature/backend-api` | A | Backend API, database, logs, stats |
| `feature/data-processing` | B | Parse, clean, chunk, sample data |
| `feature/vector-db` | C | Embedding, FAISS, retriever |
| `feature/rag-qa` | D | Prompt, LLM adapter, QA chain |
| `feature/frontend-ui` | E | Frontend pages, charts, mobile UI |
| `deploy/docker-nginx` | A | Docker, Nginx, cloud deployment |
| `docs/report-ppt` | A + all | Report, PPT, screenshots, acceptance records |

## Owner Reference Docs

| Owner | Required docs |
| --- | --- |
| A | `docs/backend_api_guidelines.md`, `docs/module_contracts.md`, `docs/api_design.md`, `docs/deployment_guide.md`, `docs/acceptance/` |
| B | `docs/module_contracts.md`, `docs/data_processing.md` |
| C | `docs/module_contracts.md`, `docs/vector_db_test.md` |
| D | `docs/module_contracts.md`, `docs/rag_design.md` |
| E | `docs/module_contracts.md`, `docs/test_report.md`, `docs/api_design.md` |

## Execution Order

Stage 1 task dependency order is documented in `docs/stage1_execution_order.md`.

All pull requests and handoffs must also follow:

```text
docs/contribution_rules.md
docs/handoff_protocol.md
```

Short version:

```text
A locks backend/API placeholders
  -> B produces Chunk[]
  -> C produces RetrievedChunk[]
  -> D produces ChatAnswer
  -> E displays API/contract data
  -> A records 6/14 acceptance
```
