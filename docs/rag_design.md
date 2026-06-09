# RAG Design Notes

Owner: D

This document is D's evidence document. It must be updated before D moves the issue to `Need Review`.

## Responsibility

D owns:

```text
rag/llm_client.py
rag/qa_chain.py
prompt design
no-source refusal behavior
```

D does not own document parsing, FAISS index construction, backend routes, or frontend pages.

## Required Input

D receives:

```text
question
RetrievedChunk[]
model
```

`RetrievedChunk[]` must follow `docs/module_contracts.md`.

D may use mock `RetrievedChunk[]` before C finishes, but final Stage 1 evidence must use C's retrieval output.

## Required Output

D must output:

```text
ChatAnswer
```

`ChatAnswer` must follow `docs/module_contracts.md`.

## Prompt Template

Record the final prompt here when implemented.

Minimum prompt requirements:

```text
answer only from provided context
refuse when context is insufficient
do not fabricate sources
preserve source references
```

## LLM Provider Rules

Supported or reserved providers:

```text
deepseek
qwen
```

API keys must be read from environment variables. API keys must not be committed.

If no API key is available, D may use mock LLM only if this document records:

```text
mock reason:
replacement plan:
expected provider:
```

## No-source Rule

D must refuse when:

```text
retrieved_chunks is empty
all retrieved chunks have low score
retrieved content is empty
```

Stage 1 default threshold:

```text
score < 0.3 means unreliable
```

No-source output must use:

```text
sources: []
```

## Test Evidence

D must record at least:

```text
3 QA results with mock or real RetrievedChunk[]
1 no-source refusal result
model provider used
ChatAnswer examples
known limitations
```

## Handoff To A/E

When done, D must notify A and E with:

```text
ChatAnswer example:
sources example:
no-source example:
model provider:
mock or real LLM:
test evidence:
known limitations:
```

## Acceptance

Pass:

- LLM adapter entry exists.
- QA chain entry exists.
- `ChatAnswer` format is valid.
- Sources are preserved.
- No-source refusal works.
- This document is updated with test evidence.

Conditional pass:

- Mock LLM is used.
- `ChatAnswer` and no-source behavior are valid.
- Real LLM replacement plan is documented.

Fail:

- Output is not `ChatAnswer`.
- Sources are missing or `null`.
- No-source case fabricates an answer.
- API keys are hardcoded.
- This document is not updated.
