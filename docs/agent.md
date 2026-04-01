
---

## ## LLM 생성 파이프라인 에이전트 설계

### **1. 프롬프트 오케스트레이터 (The Prompt Orchestrator)**
* **역할:** 사용자 입력, Redis의 과거 맥락, 시스템 페르소나를 결합하여 Gemini API에 보낼 최적의 **Full Prompt**를 조립합니다. 입력을 정제(Cleaning)하고 모델이 이해하기 쉬운 구조로 구조화합니다.
* **파일명:** `agent.orchestrator.ts`

### **2. 컨텍스트 리트리버 (The Context Retriever)**
* **역할:** Redis 연결을 전담합니다. 단순히 전체 대화를 가져오는 것이 아니라, 대화가 길어질 경우 **Semantic Search(의미 기반 검색)**나 최신 대화 위주의 **Sliding Window** 기법을 사용하여 토큰을 절약하고 필요한 맥락만 추출합니다.
* **파일명:** `agent.retriever.ts`

### **3. 세이프티 가드레일 (The Safety Guardrail)**
* **역할:** 생성 전/후 검수를 담당합니다. 
    * **Pre-process:** 입력에 부적절한 내용이 있는지 검사.
    * **Post-process:** Gemini가 생성한 답변이 심리상담 가이드라인을 벗어나거나 위험한 조언을 하는지 최종 필터링합니다.
* **파일명:** `agent.guardrail.ts`

### **4. 응답 포매터 및 파서 (The Response Formatter/Parser)**
* **역할:** Gemini의 가공되지 않은 텍스트 응답을 앱 UI에 맞게 구조화합니다. 감정 수치, 추천 활동, 상담 텍스트 등을 JSON 형태로 파싱하거나, 스트리밍 데이터를 클라이언트가 읽기 좋게 변환합니다.
* **파일명:** `agent.parser.ts`

---

## ## 파일 기반 에이전트 구조 (Structure)

```text
src/
└── services/
    └── generation/
        ├── agent.orchestrator.ts  // 프롬프트 조립 및 실행 총괄
        ├── agent.retriever.ts     // Redis 데이터 로드 및 컨텍스트 관리
        ├── agent.guardrail.ts     // 입력/출력 유효성 및 안전 검사
        └── agent.parser.ts        // 응답 데이터 포매팅 및 JSON 파싱
```

## ## 생성 과정 워크플로우 (Pipeline Flow)

1.  **`agent.retriever.ts`**: Redis에서 현재 세션 ID에 해당하는 이전 기록을 가져옵니다.
2.  **`agent.guardrail.ts`**: (Step 1) 사용자 입력의 유해성을 선제적 검사합니다.
3.  **`agent.orchestrator.ts`**: 가져온 기록과 입력을 조합해 Gemini API를 호출합니다.
4.  **`agent.guardrail.ts`**: (Step 2) 생성된 결과물이 상담 윤리에 적합한지 확인합니다.
5.  **`agent.parser.ts`**: 최종 결과를 UI에 뿌려주기 좋은 JSON/Stream 형태로 변환하여 반환합니다.

---
