"""Manual test script for member B document parsing and chunking.

Usage examples:
  python scripts/test_document_processing.py data/raw/sample_pdf.pdf data/raw/sample_docx.docx data/raw/sample_txt.txt
  python scripts/test_document_processing.py uploads/raw --output uploads/processed
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Iterable, List

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from rag.document_loader import DocumentProcessingError
from rag.text_splitter import DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE, process_file

SUPPORTED_SUFFIXES = {".pdf", ".docx", ".txt"}


def iter_files(paths: Iterable[str]) -> List[Path]:
    files: List[Path] = []
    for item in paths:
        path = Path(item)
        if path.is_dir():
            files.extend(p for p in path.rglob("*") if p.suffix.lower() in SUPPORTED_SUFFIXES and p.is_file())
        elif path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES:
            files.append(path)
        else:
            print(f"[SKIP] Unsupported or missing path: {path}")
    return sorted(files)


def main() -> None:
    parser = argparse.ArgumentParser(description="Test B document processing pipeline.")
    parser.add_argument("paths", nargs="+", help="PDF/DOCX/TXT files or directories")
    parser.add_argument("--output", default="uploads/processed", help="Processed JSON output directory")
    parser.add_argument("--chunk-size", type=int, default=DEFAULT_CHUNK_SIZE)
    parser.add_argument("--chunk-overlap", type=int, default=DEFAULT_CHUNK_OVERLAP)
    args = parser.parse_args()

    files = iter_files(args.paths)
    if not files:
        raise SystemExit("No supported files found. Please provide PDF/DOCX/TXT files.")

    total_chunks = 0
    success_count = 0
    failed_count = 0

    print("========== Member B Document Processing Test ==========")
    print(f"chunk_size={args.chunk_size}, chunk_overlap={args.chunk_overlap}")
    print(f"output_dir={args.output}")

    for file_path in files:
        try:
            document, chunks, output_path = process_file(
                file_path=file_path,
                output_dir=args.output,
                chunk_size=args.chunk_size,
                chunk_overlap=args.chunk_overlap,
            )
            total_chunks += len(chunks)
            success_count += 1
            print(f"[OK] {file_path} -> {output_path}")
            print(
                f"     document_id={document['document_id']} "
                f"file_type={document['file_type']} chunks={len(chunks)}"
            )
            print(f"     first_chunk={chunks[0]['chunk_id']} page={chunks[0]['page']} preview={chunks[0]['content'][:80]}")
        except (DocumentProcessingError, ValueError) as exc:
            failed_count += 1
            print(f"[FAILED] {file_path}: {exc}")

    print("---------------- Summary ----------------")
    print(f"success_files={success_count}")
    print(f"failed_files={failed_count}")
    print(f"total_chunks={total_chunks}")


if __name__ == "__main__":
    main()
