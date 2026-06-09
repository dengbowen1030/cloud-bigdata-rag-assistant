# Test Report

Owner: E

This document is E's evidence document. It must be updated before E moves the issue to `Need Review`.

## Responsibility

E owns:

```text
frontend/
frontend/src/api/
frontend/src/pages/
frontend/src/components/
frontend/src/router/
frontend/src/layouts/
docs/screenshots/
docs/demo/
```

E does not own backend routes, document parsing, FAISS, or LLM logic.

## Required Input

E renders data from backend APIs and contract-shaped mock data.

Required contracts:

```text
Document
ChatAnswer
QaLog
Stats
```

Frontend code must not import or call files under `rag/`.

## Required Pages

Stage 1 minimum pages:

```text
Upload
KnowledgeBase
Chat
```

Stage 1 target pages:

```text
Upload
KnowledgeBase
Chat
Logs
Dashboard
```

## API Wrapper Rules

API calls must be centralized under:

```text
frontend/src/api/
```

Required wrapper functions:

```text
uploadDocument(file)
getDocuments()
queryChat({ question, top_k })
getLogs()
getStats()
```

Pages should not scatter raw `fetch` or `axios` calls.

## Mock Data Rules

Mock data is allowed in Stage 1, but it must follow `docs/module_contracts.md`.

If mock data is used, record:

```text
mock object:
page using it:
real API to replace it:
```

## Test Evidence

E must record at least:

```text
npm run dev startup evidence
Upload screenshot
KnowledgeBase screenshot
Chat screenshot
source card screenshot
known UI/API limitations
```

Mobile screenshot is optional for early Stage 1 but required before release candidate.

## Handoff To A

When done, E must notify A with:

```text
startup command:
completed pages:
screenshots:
API integration status:
mock data still used:
current blockers:
```

## Acceptance

Pass:

- `npm run dev` starts.
- At least 3 pages are reachable.
- Pages use contract-shaped data.
- Chat page renders answer and sources.
- Empty `sources` does not crash the page.
- This document is updated with screenshots or test evidence.

Conditional pass:

- Logs or Dashboard is placeholder only.
- Upload, KnowledgeBase, and Chat work.
- Missing pages are documented with next steps.

Fail:

- Frontend cannot start.
- Pages are blank or crash.
- Data fields conflict with `docs/module_contracts.md`.
- Frontend directly calls `rag/`.
- No screenshots or test evidence are provided.
- This document is not updated.
