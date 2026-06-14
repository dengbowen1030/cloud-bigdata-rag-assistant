import { isChatAnswer, validateDataEnvelope } from "./contractGuards";
import { mockChatAnswer, mockNoSourceChatAnswer } from "./mockData";
import { mockResolve, request, USE_MOCK } from "./client";

export async function queryChat({ question, top_k = 5 }) {
  const response = USE_MOCK
    ? await mockResolve(
        (() => {
          const normalizedQuestion = question.trim();
          return normalizedQuestion.includes("无来源") || normalizedQuestion.includes("没有依据") || normalizedQuestion.includes("未上传")
            ? { ...mockNoSourceChatAnswer, question: normalizedQuestion, created_at: new Date().toISOString().slice(0, 19) }
            : { ...mockChatAnswer, question: normalizedQuestion, created_at: new Date().toISOString().slice(0, 19) };
        })(),
      )
    : await request({
        method: "post",
        url: "/chat/query",
        data: { question, top_k },
      });

  return validateDataEnvelope(response, isChatAnswer, "ChatAnswer");
}
