import { isDocument, validateArrayEnvelope, validateDataEnvelope } from "./contractGuards";
import { mockDocuments } from "./mockData";
import { mockResolve, request, toSuccessEnvelope, USE_MOCK } from "./client";

function getFileExtension(filename = "") {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "unknown";
}

export async function uploadDocument(file) {
  const response = USE_MOCK
    ? await mockResolve(
        {
          document_id: `doc_mock_${Date.now()}`,
          filename: file?.name || "unknown",
          file_type: getFileExtension(file?.name),
          file_size: file?.size || 0,
          status: "uploaded",
          chunk_count: 0,
          created_at: new Date().toISOString().slice(0, 19),
        },
        "mock upload success",
      )
    : await request({
        method: "post",
        url: "/upload",
        data: (() => {
          const formData = new FormData();
          formData.append("file", file);
          return formData;
        })(),
        headers: { "Content-Type": "multipart/form-data" },
      });

  return validateDataEnvelope(response, isDocument, "Document");
}

export async function getDocuments() {
  const response = USE_MOCK
    ? await mockResolve(mockDocuments)
    : await request({
        method: "get",
        url: "/documents",
      });

  return validateArrayEnvelope(response, isDocument, "Document");
}

export async function rebuildDocument(documentId) {
  const response = USE_MOCK
    ? await mockResolve({
        document_id: documentId,
        chunk_count: 12,
        status: "processed",
      })
    : await request({
        method: "post",
        url: `/documents/${documentId}/rebuild`,
      });

  return validateDataEnvelope(
    response,
    (value) =>
      value &&
      typeof value.document_id === "string" &&
      typeof value.chunk_count === "number" &&
      typeof value.status === "string",
    "RebuildResult",
  );
}

export async function deleteDocument(documentId) {
  return USE_MOCK
    ? mockResolve({ document_id: documentId })
    : request({
        method: "delete",
        url: `/documents/${documentId}`,
      });
}

export function appendDocumentToList(documents, document) {
  return toSuccessEnvelope([document, ...documents]);
}
