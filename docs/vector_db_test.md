# Vector DB Test Notes

Owner: C

This document is C's evidence document. It must be updated before C moves the issue to `Need Review`.

## Responsibility

C owns:

```text
rag/embedding.py
rag/vector_store.py
rag/retriever.py
vector_store/faiss_index/
```

C does not own document parsing, LLM answers, backend routes, or frontend pages.

## Required Input

C receives:

```text
Chunk[]
```

Input must follow `Chunk` in `docs/module_contracts.md`.

C may use mock `Chunk[]` before B finishes, but final Stage 1 evidence must use B's real chunks.

## Required Output

C must output:

```text
RetrievedChunk[]
vector_store/faiss_index/index.faiss
vector_store/faiss_index/metadata.json
```

`RetrievedChunk[]` must follow `docs/module_contracts.md`.

## Embedding Rules

Target model:

```text
bge-small-zh-v1.5
```

If the real model cannot be used in Stage 1, C may use mock embedding only if this document records:

```text
mock reason:
replacement plan:
expected real model:
```

## FAISS Rules

FAISS must support:

```text
build
save
load
query
```

Metadata must preserve:

```text
chunk_id
document_id
filename
page
chunk_index
content
```

## Retrieval Rules

`retrieve(question, top_k)` must return results sorted from most relevant to least relevant.

`top_k` default:

```text
5
```

Allowed Stage 1 range:

```text
1-10
```

## Test Evidence

C must record at least:

```text
5 sample Chunk inputs
embedding output evidence
FAISS save evidence
FAISS load evidence
3 Top-K retrieval tests
RetrievedChunk[] examples
```

## Handoff To D

When done, C must notify D and A with:

```text
FAISS index path:
metadata path:
RetrievedChunk[] example:
Top-K questions:
test evidence:
known limitations:
```

## Acceptance

Pass:

- Embedding entry exists.
- FAISS build/save/load works.
- At least 3 retrieval tests return `RetrievedChunk[]`.
- Source information from B is preserved.
- This document is updated with test evidence.

Conditional pass:

- Mock embedding is used.
- FAISS and `RetrievedChunk[]` format work.
- Replacement plan for real embedding is documented.

Fail:

- Output is not `RetrievedChunk[]`.
- Metadata/source fields are lost.
- No FAISS save/load evidence is provided.
- This document is not updated.
