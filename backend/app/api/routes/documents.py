from pathlib import Path

from fastapi import APIRouter, File, UploadFile

from app.api.schemas import ApiResponse
from app.services.document_service import (
    create_uploaded_document,
    delete_document,
    list_documents,
    rebuild_document,
)
from app.utils.responses import failure_response, success_response

router = APIRouter(tags=["documents"])

ALLOWED_UPLOAD_SUFFIXES = {".pdf", ".docx", ".txt", ".xlsx"}


@router.post("/upload", response_model=ApiResponse)
async def upload_document(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_UPLOAD_SUFFIXES:
        return failure_response(
            "Unsupported file type. Allowed types: PDF, DOCX, TXT, XLSX.",
            "UPLOAD_FILE_TYPE_UNSUPPORTED",
        )

    content = await file.read()
    if not content:
        return failure_response("Uploaded file is empty.", "UPLOAD_FILE_EMPTY")

    document = create_uploaded_document(file.filename or "unknown", len(content), suffix[1:])
    return success_response(document)


@router.get("/documents", response_model=ApiResponse)
def get_documents():
    return success_response(list_documents())


@router.delete("/documents/{document_id}", response_model=ApiResponse)
def remove_document(document_id: str):
    deleted = delete_document(document_id)
    if not deleted:
        return failure_response("Document not found.", "DOCUMENT_NOT_FOUND")
    return success_response({"document_id": document_id, "deleted": True})


@router.post("/documents/{document_id}/rebuild", response_model=ApiResponse)
def rebuild_document_index(document_id: str):
    rebuilt = rebuild_document(document_id)
    if rebuilt is None:
        return failure_response("Document not found.", "DOCUMENT_NOT_FOUND")
    return success_response(rebuilt)
