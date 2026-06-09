# Handoff Protocol

This document defines how owners hand work to the next owner. It prevents silent completion where a task looks finished but cannot be used by the next module.

## Handoff Chain

```text
A -> B/C/D/E: API contract and backend route placeholders
B -> C: Document + Chunk[]
C -> D: RetrievedChunk[]
D -> A/E: ChatAnswer
E -> A: frontend screenshots and integration issues
A -> all: acceptance result and blockers
```

## A Handoff

A notifies B, C, D, and E after backend placeholders are ready.

Must provide:

```text
API paths
request formats
response envelope
schema files
mock response examples
known missing backend logic
```

Minimum API paths:

```text
POST /upload
GET /documents
POST /documents/{document_id}/rebuild
POST /chat/query
GET /logs
GET /stats
```

## B -> C Handoff

B notifies C and A after document processing is ready.

Must provide:

```text
processed file path
Document example
Chunk[] example
supported file types
cleaning rules
chunking parameters
test evidence
known parser limitations
```

Output must be usable by C without field guessing.

## C -> D Handoff

C notifies D and A after vector retrieval is ready.

Must provide:

```text
FAISS index path
metadata path
RetrievedChunk[] example
Top-K test questions
retrieval scores
test evidence
known retrieval limitations
```

Output must preserve source fields from B.

## D -> A/E Handoff

D notifies A and E after RAG QA is ready.

Must provide:

```text
ChatAnswer example
sources example
no-source refusal example
model provider used
mock or real LLM status
test evidence
known QA limitations
```

Output must be renderable by E and returnable by A's `/chat/query`.

## E -> A Handoff

E notifies A after frontend pages or integration are ready.

Must provide:

```text
startup command
completed page list
screenshots
API integration status
mock data still used
current UI or API blockers
```

Screenshots must include at least Upload, KnowledgeBase, and Chat during Stage 1.

## A Acceptance Handoff

A posts the final stage result to the acceptance doc and relevant issues.

Must include:

```text
accepted items
conditional items
failed items
blockers
owner for each blocker
deadline for recheck
```

Stage 1 acceptance doc:

```text
docs/acceptance/2026-06-14.md
```

