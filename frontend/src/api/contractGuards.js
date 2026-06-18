import { toFailureEnvelope } from "./client";

const DOCUMENT_STATUSES = new Set(["uploaded", "processing", "processed", "failed"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function isDocument(value) {
  return (
    isPlainObject(value) &&
    hasString(value.document_id) &&
    hasString(value.filename) &&
    hasString(value.file_type) &&
    hasNumber(value.file_size) &&
    DOCUMENT_STATUSES.has(value.status) &&
    hasNumber(value.chunk_count) &&
    hasString(value.created_at)
  );
}

export function isSource(value) {
  return (
    isPlainObject(value) &&
    hasString(value.filename) &&
    Object.prototype.hasOwnProperty.call(value, "page") &&
    hasNumber(value.chunk_index) &&
    hasNumber(value.score) &&
    hasString(value.preview)
  );
}

export function isChatAnswer(value) {
  return (
    isPlainObject(value) &&
    hasString(value.question) &&
    hasString(value.answer) &&
    Array.isArray(value.sources) &&
    value.sources.every(isSource) &&
    hasString(value.model) &&
    hasString(value.created_at)
  );
}

export function isQaLog(value) {
  return (
    isPlainObject(value) &&
    hasString(value.log_id) &&
    hasString(value.question) &&
    hasString(value.answer) &&
    hasNumber(value.source_count) &&
    hasString(value.model) &&
    hasString(value.created_at)
  );
}

export function isStats(value) {
  return (
    isPlainObject(value) &&
    hasNumber(value.document_count) &&
    hasNumber(value.chunk_count) &&
    hasNumber(value.question_count) &&
    (value.latest_question_time === null || hasString(value.latest_question_time))
  );
}

export function validateDataEnvelope(response, validator, contractName) {
  if (!response?.success) return response;
  const ok = validator(response.data);
  if (ok) return response;
  return toFailureEnvelope(`${contractName} 数据不符合 docs/module_contracts.md 契约`, "CLIENT_CONTRACT_VALIDATION_FAILED");
}

export function validateArrayEnvelope(response, itemValidator, contractName) {
  if (!response?.success) return response;
  const ok = Array.isArray(response.data) && response.data.every(itemValidator);
  if (ok) return response;
  return toFailureEnvelope(`${contractName}[] 数据不符合 docs/module_contracts.md 契约`, "CLIENT_CONTRACT_VALIDATION_FAILED");
}
