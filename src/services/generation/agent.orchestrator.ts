// src/services/generation/agent.orchestrator.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { retriever, ChatMessage } from "./agent.retriever";
import { guardrail } from "./agent.guardrail";
import { parser, CounselingResponse } from "./agent.parser";

// API 키가 없으면 동작하지 않으므로 주의 (기본값 설정은 샘플)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
// Gemini 1.5/2 모델 사용
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json"
  }
});

export class PromptOrchestrator {
  private SYSTEM_PROMPT = `
    당신은 마음을 따뜻하게 안아주는 AI 심리상담사 '마음브릿지'입니다.
    사용자에게 깊은 공감을 표하고, 전문적인 상담 지식(비지시적 상담, 반영적 경청, 인지행동치료 등)을 바탕으로 대화하세요.

    [상담 기법 가이드라인]
    1. 비지시적 공감: 사용자의 말을 비판하거나 가르치려 하지 않고, 있는 그대로의 감정을 수용하세요.
    2. 반영적 경청: 사용자가 한 말의 핵심 감정과 내용을 요약하여 다시 들려줌으로써 이해받고 있다는 느낌을 주세요.
    3. 인지 재구조화: 사용자가 스스로 부정적인 생각의 패턴을 인식할 수 있도록 부드러운 질문을 던지세요.
    4. 작은 행동 활성화: 대화 말미에 오늘 당장 실천할 수 있는 아주 사소하고 따뜻한 위로 활동을 하나만 추천하세요.

    [응답 규칙]
    - 반드시 한국어로 답변하세요.
    - 친절하고 따뜻한 존댓말을 사용하세요.
    - 조언보다는 공감을 먼저 충분히 표현하세요.
    - 답변은 반드시 아래의 JSON 형식으로만 보내야 합니다.
    - JSON 구조 예시:
    {
      "message": "사용자에게 전할 따뜻하고 공감적인 상담 텍스트",
      "sentiment": "positive | negative | neutral (현재 사용자의 감정 상태)",
      "empathyScore": 0.0 ~ 1.0 (상담사의 공감 수준),
      "reflection": "사용자의 이야기를 요약한 한 문장",
      "recommendedAction": "오늘 바로 해볼 수 있는 작은 행동"
    }
  `;

  async execute(sessionId: string, userInput: string): Promise<CounselingResponse> {
    // 1. Pre-process (Safety)
    const safetyCheck = await guardrail.preProcess(userInput);
    if (!safetyCheck.isSafe) {
      return { 
        message: safetyCheck.reason!, 
        sentiment: 'negative', 
        empathyScore: 0, 
        reflection: "위험 감지" 
      };
    }

    // 2. Retrieve history (Context)
    const history = await retriever.getOptimizedContext(sessionId);
    
    // 3. Assemble prompt and Generate
    const contents: any[] = [
      { role: "user", parts: [{ text: this.SYSTEM_PROMPT }] },
      ...history.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.parts[0].text }]
      })),
      { role: "user", parts: [{ text: userInput }] }
    ];

    try {
      const result = await model.generateContent({ contents });
      const rawResponse = result.response.text();
      
      // 4. Post-process (Safety Check Output)
      const postSafetyCheck = await guardrail.postProcess(rawResponse);
      if (!postSafetyCheck.isSafe) {
        return { 
          message: "말씀하신 내용을 잘 전하고 싶어 제 생각을 가다듬고 있습니다. 잠시 뒤 다시 들려 드릴게요.", 
          sentiment: 'neutral', 
          empathyScore: 0.5, 
          reflection: "재처리 중" 
        };
      }

      // 5. Parse output
      const finalResponse = await parser.parse(rawResponse);
      
      // 6. Save history for the future
      await retriever.addMessage(sessionId, { role: "user", parts: [{ text: userInput }] });
      await retriever.addMessage(sessionId, { role: "model", parts: [{ text: rawResponse }] });

      return finalResponse;
    } catch (err) {
      console.error("Gemini API 호출 오류:", err);
      return { 
        message: "잠시 기술적인 연결이 불안정합니다. 당신의 마음은 여전히 제가 듣고 싶은 소중한 곳에 있습니다. 잠시 후 다시 말을 건네 주시겠어요?", 
        sentiment: 'neutral', 
        empathyScore: 0.5, 
        reflection: "연결 오류" 
      };
    }
  }
}

export const orchestrator = new PromptOrchestrator();
