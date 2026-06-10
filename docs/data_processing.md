# Data Processing Notes

Owner: B

This document records the implementation and test evidence for the document parsing, cleaning and chunking module. B's output is consumed by C as `Chunk[]`; B does not create embeddings, build FAISS indexes, call LLMs, or render frontend pages.

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

XLSX is not enabled in this submission. If XLSX is required later, it can be added with `openpyxl` and converted into paragraph/table text before chunking.

## Parser Implementation

| File type | Parser | Location strategy | Notes |
| --- | --- | --- | --- |
| PDF | `pypdf.PdfReader`, with `PyPDF2` fallback | page number starts from 1 | Extracts text page by page. Scanned image-only PDFs may return no text and will be reported as processing failure. |
| DOCX | `python-docx` | paragraph/table order; page is `null` | Heading styles or Chinese chapter titles are stored in `metadata.section` when detected. |
| TXT | built-in text reader | paragraph order; page is `null` | Tries `utf-8`, `utf-8-sig`, `gb18030`, `gbk`, and `big5` encodings. |

The main parsing entrypoint is:

```python
load_document(file_path, document_id=None) -> (document, raw_text, segments)
```

`document` follows the `Document` contract. `segments` preserve page and section metadata for chunk generation.

## Required Output

B outputs:

```text
Document
Chunk[]
uploads/processed/{document_id}.json
```

The JSON file contains:

```json
{
  "document": {},
  "chunks": []
}
```

`document` follows `Document` in `docs/module_contracts.md`. `chunks` follows `Chunk[]` in `docs/module_contracts.md`.

## Chunk Contract

Every chunk includes:

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
- `chunk_index` starts at `1` per document and is continuous.
- `page` may be `null` for TXT/DOCX or sources without page numbers.
- `metadata.source` matches the original filename.
- `metadata.section` is a heading/chapter title when it can be detected, otherwise `null`.
- B does not remove source information needed by D for citations.

## Cleaning Rules

Actual cleaning rules implemented in `rag/text_splitter.py`:

```text
extra blank lines: collapse three or more blank lines into one blank line; keep paragraph boundaries.
continuous spaces: collapse tabs and repeated spaces inside each line into one space.
headers/footers: not removed automatically in Stage 1, because course PDFs differ greatly and false deletion may remove valid content.
special symbols: keep Chinese, English, numbers, whitespace and common punctuation/operators used in course materials.
Chinese punctuation: preserved, including ，。！？；：、（）《》【】“”‘’ etc.
known limitations: OCR is not included; image-only PDF pages may produce no extractable text.
```

The cleaner intentionally does not compress the whole document into one line, and does not remove technical terms such as RAG, FAISS, API, SQL, C++, JSON or model names.

## Chunking Parameters

Actual parameters:

```text
chunk_size: 650 characters
chunk_overlap: 100 characters
split strategy: segment-level splitting with soft break preference at paragraph, newline, Chinese/English punctuation, comma and space.
```

For long segments, the splitter searches for a natural separator near the end of the chunk. If no good separator exists, it falls back to fixed-length slicing. Adjacent chunks keep a small overlap to reduce semantic breakage.

## Entrypoints

### Parse only

```python
from rag.document_loader import load_document

document, raw_text, segments = load_document("data/raw/sample_pdf.pdf")
```

### Parse, clean, split and save

```python
from rag.text_splitter import process_file

document, chunks, output_path = process_file("data/raw/sample_pdf.pdf")
```

### Manual test script

```bash
python scripts/test_document_processing.py data/raw/sample_pdf.pdf data/raw/sample_docx.docx data/raw/sample_txt.txt
```

or:

```bash
python scripts/test_document_processing.py uploads/raw --output uploads/processed
```

## Output JSON Example

```json
{
  "document": {
    "document_id": "doc_lecture01_7e43c2a9b1",
    "filename": "lecture01.pdf",
    "file_type": "pdf",
    "file_size": 123456,
    "status": "processed",
    "chunk_count": 32,
    "created_at": "2026-06-10T12:00:00"
  },
  "chunks": [
    {
      "chunk_id": "chunk_doc_lecture01_7e43c2a9b1_0001",
      "document_id": "doc_lecture01_7e43c2a9b1",
      "filename": "lecture01.pdf",
      "page": 3,
      "chunk_index": 1,
      "content": "软件开发周期通常包括需求分析、系统设计、编码实现、测试、部署与维护等阶段。",
      "metadata": {
        "source": "lecture01.pdf",
        "section": "软件开发周期"
      }
    }
  ]
}
```

## Test Evidence

Recommended test files:

```text
data/raw/sample_pdf.pdf
data/raw/sample_docx.docx
data/raw/sample_txt.txt
```

Recommended test command:

```bash
pip install pypdf python-docx
python scripts/test_document_processing.py data/raw/sample_pdf.pdf data/raw/sample_docx.docx data/raw/sample_txt.txt
```

Expected terminal output format:

```text
========== Member B Document Processing Test ==========
chunk_size=650, chunk_overlap=100
output_dir=uploads/processed
[OK] data/raw/sample_pdf.pdf -> uploads/processed/doc_sample_pdf_xxxxxxxxxx.json
     document_id=doc_sample_pdf_xxxxxxxxxx file_type=pdf chunks=X
     first_chunk=chunk_doc_sample_pdf_xxxxxxxxxx_0001 page=1 preview=...
[OK] data/raw/sample_docx.docx -> uploads/processed/doc_sample_docx_xxxxxxxxxx.json
     document_id=doc_sample_docx_xxxxxxxxxx file_type=docx chunks=Y
     first_chunk=chunk_doc_sample_docx_xxxxxxxxxx_0001 page=None preview=...
[OK] data/raw/sample_txt.txt -> uploads/processed/doc_sample_txt_xxxxxxxxxx.json
     document_id=doc_sample_txt_xxxxxxxxxx file_type=txt chunks=Z
     first_chunk=chunk_doc_sample_txt_xxxxxxxxxx_0001 page=None preview=...
---------------- Summary ----------------
success_files=3
failed_files=0
total_chunks=X+Y+Z
```

Actual generated JSON path:

```text
uploads/processed/{document_id}.json
```

## Handoff To C

When B finishes processing, notify A/C with:

```text
processed file path: uploads/processed/{document_id}.json
Document example: see JSON document field
Chunk[] example: see JSON chunks field
supported file types: PDF, DOCX, TXT
test evidence: terminal output and processed JSON
known limitations: no OCR; DOCX page number unavailable; XLSX not included in Stage 1
```

## Known Limitations

- Scanned or image-only PDFs require OCR and are not supported in Stage 1.
- DOCX does not expose reliable page numbers, so `page` is `null`.
- TXT has no page numbers, so `page` is `null`.
- Automatic header/footer removal is not enabled to avoid accidentally deleting course content.
- XLSX is optional and not implemented in this submission.

## Contract Statement

Contract changed: no.

This submission does not modify `Document` or `Chunk` fields. It only implements output according to `docs/module_contracts.md`.

## Acceptance

Pass conditions covered by this implementation:

- PDF, DOCX, and TXT parsing entrypoints exist.
- Text cleaning and chunking entrypoints exist.
- Output is valid `Chunk[]`, not a plain string list.
- Source information is preserved through `filename`, `page`, `chunk_index`, `metadata.source`, and `metadata.section`.
- Processed JSON is saved under `uploads/processed/`.
- This document records parser behavior, cleaning rules, chunk parameters, output path, JSON example, test command, and known limitations.
## Local Test Evidence

Date: 2026-06-10
Owner: B
Branch: feature/data-processing

### Test Command

python scripts/test_document_processing.py data/raw --output uploads/processed

### Test Result

========== Member B Document Processing Test ==========
chunk_size=650, chunk_overlap=100
output_dir=uploads/processed
[OK] data\raw\member_b_sample.txt -> uploads\processed\doc_member_b_sample_ea284764af.json
     document_id=doc_member_b_sample_ea284764af file_type=txt chunks=2
     first_chunk=chunk_doc_member_b_sample_ea284764af_0001 page=None preview=云计算与大数据课程项目
---------------- Summary ----------------
success_files=1
failed_files=0
total_chunks=2

### Output Contract Check

The generated JSON contains document and chunks fields, including document_id, filename, file_type, status, chunk_count, chunk_id, page, chunk_index, content, metadata.source and metadata.section.

This confirms that B's module can parse TXT input, clean and split text, and save contract-shaped Document + Chunk[] output to uploads/processed/{document_id}.json.
