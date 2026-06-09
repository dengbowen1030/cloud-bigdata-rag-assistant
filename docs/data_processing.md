# Data Processing Notes

Owner: B

This document is B's evidence document. It must be updated before B moves the issue to `Need Review`.

## Responsibility

B owns:

```text
rag/document_loader.py
rag/text_splitter.py
data/
uploads/raw/
uploads/processed/
```

B does not own embedding, FAISS, LLM, backend routes, or frontend pages.

## Required Input

B reads source files from:

```text
uploads/raw/
data/raw/
```

Supported file types for Stage 1:

```text
PDF
DOCX
TXT
```

XLSX is optional for Stage 1.

## Required Output

B must output:

```text
Document
Chunk[]
uploads/processed/{document_id}.json
```

The JSON file should contain:

```json
{
  "document": {},
  "chunks": []
}
```

`document` must follow `Document` in `docs/module_contracts.md`. `chunks` must follow `Chunk[]`.

## Chunk Contract

Every chunk must include:

```text
chunk_id
document_id
filename
page
chunk_index
content
metadata
```

Rules:

- `content` must not be empty.
- `chunk_index` starts at `1` per document.
- `page` may be `null` for files without page numbers.
- `metadata.source` must match the original filename.
- B must not remove source information needed by D for citations.

## Cleaning Rules

Record actual cleaning rules here when implemented:

```text
extra blank lines:
continuous spaces:
headers/footers:
special symbols:
Chinese punctuation:
known limitations:
```

## Chunking Parameters

Record actual parameters here when implemented:

```text
chunk_size:
chunk_overlap:
split strategy:
```

Recommended Stage 1 defaults:

```text
chunk_size: 500-800 Chinese characters
chunk_overlap: 80-120 Chinese characters
```

## Test Evidence

B must record at least:

```text
1 PDF parse/chunk result
1 DOCX parse/chunk result
1 TXT parse/chunk result
total generated chunks
processed JSON path
```

## Handoff To C

When done, B must notify C and A with:

```text
processed file path:
Document example:
Chunk[] example:
supported file types:
test evidence:
known limitations:
```

## Acceptance

Pass:

- PDF, DOCX, and TXT can be parsed.
- At least 20 valid chunks are generated.
- Output is valid `Chunk[]`.
- Source information is preserved.
- This document is updated with test evidence.

Conditional pass:

- Two of three file types work.
- `Chunk[]` format is valid.
- Missing parser limitations are documented.

Fail:

- Output is plain strings instead of `Chunk[]`.
- Source fields are missing.
- No test evidence is provided.
- This document is not updated.
