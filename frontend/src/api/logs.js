import { isQaLog, validateArrayEnvelope } from "./contractGuards";
import { mockQaLogs } from "./mockData";
import { mockResolve, request, USE_MOCK } from "./client";

export async function getLogs() {
  const response = USE_MOCK
    ? await mockResolve(mockQaLogs)
    : await request({
        method: "get",
        url: "/logs",
      });

  return validateArrayEnvelope(response, isQaLog, "QaLog");
}
