// src/services/generation/agent.guardrail.ts

export interface GuardrailResponse {
  isSafe: boolean;
  reason?: string;
}

export class SafetyGuardrail {
  private harmfulKeywords = [
    '자살', '죽고싶어', '자해', '죽음', '살인', '해치고', '무의미', '끝내고 싶어',
    'suicide', 'self-harm', 'kill myself', 'end it all'
  ];

  async preProcess(input: string): Promise<GuardrailResponse> {
    const cleanInput = input.replace(/\s+/g, '');
    const hasHarmful = this.harmfulKeywords.some(keyword => 
      cleanInput.includes(keyword.replace(/\s+/g, ''))
    );
    
    if (hasHarmful) {
      return {
        isSafe: false,
        reason: "마음이 많이 힘드신 것 같아 걱정됩니다. 하지만 저는 전문적인 위기 상담사는 아니에요. 지금 바로 도움이 필요하시다면 자살예방 상담전화(1393)나 정신건강 상담전화(1577-0199)로 연락해 보시는 건 어떨까요? 당신은 소중한 사람입니다."
      };
    }
    return { isSafe: true };
  }

  async postProcess(response: string): Promise<GuardrailResponse> {
    // 1. 단순 필터링: 상담사가 말하면 안되는 공격적 말투나 오류 방어
    const harmful = ["바보", "멍청이", "틀렸어", "강요"];
    if (harmful.some(h => response.includes(h))) {
      return { isSafe: false, reason: "비공감적 표현이 포함되어 재생성이 필요합니다." };
    }
    return { isSafe: true };
  }
}

export const guardrail = new SafetyGuardrail();
