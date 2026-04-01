// src/services/generation/agent.parser.ts

export interface CounselingResponse {
  message: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  empathyScore: number;
  reflection: string;
  recommendedAction?: string;
}

export class ResponseParser {
  async parse(rawResponse: string): Promise<CounselingResponse> {
    try {
      // JSON 파싱 시도 (LLM에 JSON 가이드라인을 주므로 가능)
      const data = JSON.parse(rawResponse);
      return {
        message: data.message || "죄송합니다, 잠시 제 마음이 어지러워 답변을 정리하지 못했습니다. 다시 말씀해 주시겠어요?",
        sentiment: data.sentiment || "neutral",
        empathyScore: data.empathyScore || 0,
        reflection: data.reflection || "사용자의 감정을 깊이 경청하고 공감합니다.",
        recommendedAction: data.recommendedAction
      };
    } catch (e) {
      console.error("JSON 파싱 오류:", e);
      return {
        message: rawResponse.replace(/```json|```/g, "").trim(),
        sentiment: "neutral",
        empathyScore: 0.5,
        reflection: "경청하고 있습니다."
      };
    }
  }
}

export const parser = new ResponseParser();
