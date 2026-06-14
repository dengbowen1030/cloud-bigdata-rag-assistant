import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export function toSuccessEnvelope(data, message = "") {
  return {
    success: true,
    data,
    message,
    error_code: null,
  };
}

export function toFailureEnvelope(message, error_code = "CLIENT_REQUEST_FAILED") {
  return {
    success: false,
    data: null,
    message,
    error_code,
  };
}

export function normalizeResponse(rawResponse) {
  const payload = rawResponse?.data ?? rawResponse;

  if (
    payload &&
    typeof payload.success === "boolean" &&
    Object.prototype.hasOwnProperty.call(payload, "data") &&
    Object.prototype.hasOwnProperty.call(payload, "message") &&
    Object.prototype.hasOwnProperty.call(payload, "error_code")
  ) {
    return payload;
  }

  return toFailureEnvelope("后端响应格式不符合统一响应契约", "CLIENT_RESPONSE_SHAPE_INVALID");
}

export async function request(config) {
  try {
    const response = await http.request(config);
    return normalizeResponse(response);
  } catch (error) {
    const payload = error?.response?.data;
    if (payload) {
      return normalizeResponse(payload);
    }
    return toFailureEnvelope(error?.message || "请求失败", "CLIENT_NETWORK_ERROR");
  }
}

export function mockResolve(data, message = "", delay = 250) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(toSuccessEnvelope(data, message)), delay);
  });
}
