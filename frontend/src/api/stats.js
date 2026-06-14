import { isStats, validateDataEnvelope } from "./contractGuards";
import { mockStats } from "./mockData";
import { mockResolve, request, USE_MOCK } from "./client";

export async function getStats() {
  const response = USE_MOCK
    ? await mockResolve(mockStats)
    : await request({
        method: "get",
        url: "/stats",
      });

  return validateDataEnvelope(response, isStats, "Stats");
}
