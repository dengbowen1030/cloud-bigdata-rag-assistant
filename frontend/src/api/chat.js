import { isChatAnswer, validateDataEnvelope } from "./contractGuards";
import { mockChatAnswer, mockNoSourceChatAnswer } from "./mockData";
import { mockResolve, request, USE_MOCK } from "./client";

export async function queryChat({ question, top_k = 5 }) {
  const safeQuestion = String(question || "").trim();
  const safeTopK = Math.min(10, Math.max(1, Number(top_k || 5)));

  const response = USE_MOCK
    ? await mockResolve(
        safeQuestion.includes("未上传") || safeQuestion.includes("没有依据") || safeQuestion.includes("无来源")
          ? { ...mockNoSourceChatAnswer, question: safeQuestion, created_at: new Date().toISOString().slice(0, 19) }
          : { ...mockChatAnswer, question: safeQuestion, created_at: new Date().toISOString().slice(0, 19) },
      )
    : await request({
        method: "post",
        url: "/chat/query",
        data: { question: safeQuestion, top_k: safeTopK },
      });

  return validateDataEnvelope(response, isChatAnswer, "ChatAnswer");
}
