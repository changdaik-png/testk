# 🧠 SKILL: 마음브릿지 (MindBridge) AI 심리상담 앱 재현 가이드

> 이 문서 하나만 있으면 마음브릿지 앱을 처음부터 완전히 똑같이 만들 수 있습니다.
> **스택:** Next.js 16 · TypeScript · Gemini API · Vanilla CSS (Glassmorphism) · Vercel 배포

---

## 📋 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택 및 의존성](#2-기술-스택-및-의존성)
3. [프로젝트 초기화](#3-프로젝트-초기화)
4. [폴더 구조](#4-폴더-구조)
5. [디자인 시스템 (globals.css)](#5-디자인-시스템-globalscss)
6. [AI 파이프라인 구현 (4개 에이전트)](#6-ai-파이프라인-구현)
7. [API 라우트 구현](#7-api-라우트-구현)
8. [홈 페이지 구현](#8-홈-페이지-구현)
9. [채팅 페이지 구현](#9-채팅-페이지-구현)
10. [환경변수 설정 (Vercel)](#10-환경변수-설정-vercel)
11. [GitHub 및 Vercel 배포](#11-github-및-vercel-배포)
12. [주요 트러블슈팅](#12-주요-트러블슈팅)

---

## 1. 프로젝트 개요

**마음브릿지(MindBridge)**는 Google Gemini API를 활용한 AI 심리상담 웹앱입니다.

| 항목 | 내용 |
|:---|:---|
| 핵심 기능 | 공감 중심 AI 대화, 실시간 감정 분석, 위기 감지 가드레일 |
| 디자인 | 다크모드 Glassmorphism, Framer Motion 애니메이션 |
| AI 모델 | `gemini-2.5-flash` |
| 배포 환경 | Vercel (서버리스 함수) |

---

## 2. 기술 스택 및 의존성

### `package.json` 의존성 전체 목록

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.38.0",
    "lucide-react": "^1.7.0",
    "next": "16.2.2",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "tailwind-merge": "^3.5.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## 3. 프로젝트 초기화

```bash
# 1. Next.js 프로젝트 생성 (pnpm 사용)
pnpm dlx create-next-app@latest mindbridge --typescript --no-tailwind --app --src-dir

# 2. 프로젝트 폴더 이동
cd mindbridge

# 3. 필수 패키지 설치
pnpm add @google/generative-ai framer-motion lucide-react clsx tailwind-merge zod
pnpm add -D tailwindcss @tailwindcss/postcss
```

---

## 4. 폴더 구조

```text
mindbridge/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          ← Gemini API 호출 서버 라우트
│   │   ├── chat/
│   │   │   └── page.tsx              ← 채팅 UI 페이지
│   │   ├── globals.css               ← 전체 디자인 시스템
│   │   ├── layout.tsx
│   │   └── page.tsx                  ← 홈(랜딩) 페이지
│   └── services/
│       └── generation/
│           ├── agent.orchestrator.ts ← AI 파이프라인 총괄
│           ├── agent.retriever.ts    ← 대화 맥락 관리
│           ├── agent.guardrail.ts    ← 안전 필터링
│           └── agent.parser.ts       ← 응답 JSON 파싱
├── docs/                             ← 기획 문서 폴더
├── .env.local                        ← 로컬 API 키 (gitignore됨)
└── .gitignore
```

---

## 5. 디자인 시스템 (globals.css)

**`src/app/globals.css`** 전체 내용:

```css
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@100..900&display=swap');

:root {
  --primary: #818cf8;
  --primary-glow: rgba(129, 140, 248, 0.5);
  --secondary: #6366f1;
  --accent: #f472b6;
  --bg-light: #f8fafc;
  --bg-dark: #0f172a;
  --text-dark: #1e293b;
  --text-light: #f1f5f9;
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  --font-main: 'Pretendard', sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --glass-bg: rgba(15, 23, 42, 0.7);
    --glass-border: rgba(255, 255, 255, 0.1);
    --bg-light: #0f172a;
    --text-dark: #f1f5f9;
  }
}

* { box-sizing: border-box; padding: 0; margin: 0; }
html, body { font-family: var(--font-main); background: var(--bg-light); color: var(--text-dark); }
a { color: inherit; text-decoration: none; }

/* Glassmorphism */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 20px;
}

/* 배경 그라디언트 */
.bg-gradient-mesh {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
  background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
}
@media (prefers-color-scheme: dark) {
  .bg-gradient-mesh {
    background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f172a 100%);
  }
}

/* 버튼 */
.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.3s ease; box-shadow: 0 4px 14px 0 var(--primary-glow);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px 0 var(--primary-glow); }

/* 채팅 레이아웃 */
.chat-container { height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
.chat-content { flex: 1; display: flex; overflow: hidden; padding: 12px; gap: 12px; }
.chat-sidebar { width: 280px; flex-shrink: 0; padding: 20px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; }
.chat-main { flex: 1; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.chat-messages { flex: 1; overflow-y: auto; padding: 20px; }
.chat-input-area { padding: 10px 12px; display: flex; gap: 10px; align-items: center; }

/* 말풍선 */
.message-wrapper { display: flex; margin-bottom: 18px; }
.message-wrapper.user { justify-content: flex-end; }
.message-bubble { max-width: 78%; padding: 14px 18px; line-height: 1.65; font-size: 0.97rem; box-shadow: 0 4px 15px rgba(0,0,0,0.06); }
.message-bubble.user { border-radius: 20px 20px 4px 20px; background: linear-gradient(135deg, var(--secondary), var(--primary)); color: #fff; }
.message-bubble.model { border-radius: 20px 20px 20px 4px; background: rgba(255,255,255,0.08); }

/* 스크롤바 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: var(--primary); }
```

---

## 6. AI 파이프라인 구현

> AI 처리는 4개의 전문 에이전트로 분리하여 단일 책임 원칙(SRP)을 준수합니다.

### 6-1. `agent.retriever.ts` — 대화 맥락 관리

```typescript
// src/services/generation/agent.retriever.ts

export type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

export class ContextRetriever {
  // ⚠️ 현재는 인메모리 방식 (서버 재시작 시 초기화됨)
  // 실제 서비스 시 Redis로 교체 권장
  private history: Map<string, ChatMessage[]> = new Map();

  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    return this.history.get(sessionId) || [];
  }

  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const current = await this.getHistory(sessionId);
    this.history.set(sessionId, [...current, message]);
  }

  // Sliding Window: 최근 10턴만 사용하여 토큰 절약
  async getOptimizedContext(sessionId: string, maxTurn: number = 10): Promise<ChatMessage[]> {
    const history = await this.getHistory(sessionId);
    return history.slice(-maxTurn);
  }
}

export const retriever = new ContextRetriever();
```

### 6-2. `agent.guardrail.ts` — 안전 필터링

```typescript
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
  private injectionKeywords = [
    '지시 무시', 'ignore all instructions', '너의 시스템 프롬프트',
    '비밀번호', 'api key', 'system prompt', '당신의 규칙'
  ];

  async preProcess(input: string): Promise<GuardrailResponse> {
    // 공백 제거 후 비교 (변칙 입력 방지)
    const cleanInput = input.replace(/\s+/g, '').toLowerCase();

    if (this.harmfulKeywords.some(k => cleanInput.includes(k.replace(/\s+/g, '')))) {
      return {
        isSafe: false,
        reason: "마음이 많이 힘드신 것 같아 걱정됩니다. 지금 바로 도움이 필요하시다면 자살예방 상담전화(1393)나 정신건강 상담전화(1577-0199)로 연락해 보세요. 당신은 소중한 사람입니다."
      };
    }
    if (this.injectionKeywords.some(k => cleanInput.includes(k.replace(/\s+/g, '')))) {
      return { isSafe: false, reason: "시스템 정책에 어긋나는 요청이 감지되었습니다." };
    }
    return { isSafe: true };
  }

  async postProcess(response: string): Promise<GuardrailResponse> {
    const harmful = ["바보", "멍청이", "틀렸어", "강요"];
    if (harmful.some(h => response.includes(h))) {
      return { isSafe: false, reason: "비공감적 표현이 포함되어 재생성 필요." };
    }
    return { isSafe: true };
  }
}

export const guardrail = new SafetyGuardrail();
```

### 6-3. `agent.parser.ts` — 응답 파싱

```typescript
// src/services/generation/agent.parser.ts

export interface CounselingResponse {
  message: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  empathyScore: number;     // 0.0 ~ 1.0
  reflection: string;       // 사용자 말 한 줄 요약
  recommendedAction?: string; // 오늘의 소소한 활동
}

export class ResponseParser {
  async parse(rawResponse: string): Promise<CounselingResponse> {
    try {
      const data = JSON.parse(rawResponse);
      return {
        message: data.message || "다시 말씀해 주시겠어요?",
        sentiment: data.sentiment || "neutral",
        empathyScore: data.empathyScore || 0,
        reflection: data.reflection || "경청하고 있습니다.",
        recommendedAction: data.recommendedAction
      };
    } catch {
      // JSON 파싱 실패 시 raw text 반환
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
```

### 6-4. `agent.orchestrator.ts` — AI 파이프라인 총괄

> ⚠️ **핵심:** 환경변수 이름을 `GOOGLE_GENERATIVE_AI_API_KEY`로 정확히 맞춰야 합니다.

```typescript
// src/services/generation/agent.orchestrator.ts

import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { retriever } from "./agent.retriever";
import { guardrail } from "./agent.guardrail";
import { parser, CounselingResponse } from "./agent.parser";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

// ✅ 반드시 이 모델명 사용 (2.5-flash)
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

export class PromptOrchestrator {
  private SYSTEM_PROMPT = `
    당신은 마음을 따뜻하게 안아주는 AI 심리상담사 '마음브릿지'입니다.
    사용자에게 깊은 공감을 표하고, 전문적인 상담 지식을 바탕으로 대화하세요.

    [상담 기법]
    1. 비지시적 공감: 있는 그대로의 감정을 수용하세요.
    2. 반영적 경청: 핵심 감정을 요약해 들려주세요.
    3. 인지 재구조화: 부정적 생각 패턴을 부드럽게 환기시키세요.
    4. 행동 활성화: 오늘 실천할 작은 활동 하나를 추천하세요.

    [응답 규칙]
    - 반드시 한국어, 친절한 존댓말로 답변하세요.
    - 반드시 아래 JSON 형식으로만 응답하세요:
    {
      "message": "공감적인 상담 텍스트",
      "sentiment": "positive | negative | neutral",
      "empathyScore": 0.0 ~ 1.0,
      "reflection": "사용자 이야기 한 줄 요약",
      "recommendedAction": "오늘 바로 해볼 작은 행동"
    }
  `;

  async execute(sessionId: string, userInput: string): Promise<CounselingResponse> {
    // Step 1: 입력 안전 검사
    const preCheck = await guardrail.preProcess(userInput);
    if (!preCheck.isSafe) {
      return { message: preCheck.reason!, sentiment: 'negative', empathyScore: 0, reflection: "위험 감지" };
    }

    // Step 2: 이전 대화 맥락 로드
    const history = await retriever.getOptimizedContext(sessionId);

    // Step 3: 프롬프트 조립 + Gemini API 호출
    const contents: Content[] = [
      { role: "user", parts: [{ text: this.SYSTEM_PROMPT }] },
      ...history.map(msg => ({ role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.parts[0].text }] })),
      { role: "user", parts: [{ text: userInput }] }
    ];

    try {
      const result = await model.generateContent({ contents });
      const rawResponse = result.response.text();

      // Step 4: 출력 안전 검사
      const postCheck = await guardrail.postProcess(rawResponse);
      if (!postCheck.isSafe) {
        return { message: "잠시 생각을 가다듬고 있습니다. 다시 말씀해 주세요.", sentiment: 'neutral', empathyScore: 0.5, reflection: "재처리 중" };
      }

      // Step 5: 응답 파싱 + 대화 기록 저장
      const finalResponse = await parser.parse(rawResponse);
      await retriever.addMessage(sessionId, { role: "user", parts: [{ text: userInput }] });
      await retriever.addMessage(sessionId, { role: "model", parts: [{ text: rawResponse }] });

      return finalResponse;
    } catch (err) {
      console.error("Gemini API 호출 오류:", err);
      return { message: "잠시 기술적인 연결이 불안정합니다. 잠시 후 다시 말을 건네 주시겠어요?", sentiment: 'neutral', empathyScore: 0.5, reflection: "연결 오류" };
    }
  }
}

export const orchestrator = new PromptOrchestrator();
```

---

## 7. API 라우트 구현

```typescript
// src/app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { orchestrator } from "@/services/generation/agent.orchestrator";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    const response = await orchestrator.execute(sessionId || "default-session", message);
    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

---

## 8. 홈 페이지 구현

```typescript
// src/app/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="bg-gradient-mesh" />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="glass"
        style={{ maxWidth: '800px', width: '100%', padding: '60px 40px', textAlign: 'center' }}
      >
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          style={{ display: 'inline-block', padding: '16px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', marginBottom: '20px' }}>
          <Heart size={48} color="var(--primary)" fill="var(--primary)" />
        </motion.div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>
          마음브릿지 <span style={{ color: 'var(--primary)' }}>MindBridge</span>
        </h1>
        <p style={{ color: 'var(--text-dark)', opacity: 0.8, marginTop: '16px' }}>
          AI 심리상담사와 함께하는 안전하고 포근한 대화
        </p>

        {/* 기능 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '40px 0' }}>
          <div><Sparkles size={32} color="var(--accent)" /><h3>지능형 공감</h3></div>
          <div><ShieldCheck size={32} color="var(--primary)" /><h3>안전한 익명성</h3></div>
          <div><MessageCircle size={32} color="var(--secondary)" /><h3>24/7 가용성</h3></div>
        </div>

        <Link href="/chat">
          <button className="btn-primary" style={{ padding: '20px 60px', fontSize: '1.2rem' }}>
            지금 대화 시작하기
          </button>
        </Link>
        <p style={{ marginTop: '30px', fontSize: '0.8rem', opacity: 0.5 }}>
          ※ 마음브릿지는 AI 기반 서비스이며, 전문 의료 상담을 대체할 수 없습니다.
        </p>
      </motion.div>
    </main>
  );
}
```

---

## 9. 채팅 페이지 구현 (핵심 로직)

```typescript
// src/app/chat/page.tsx (핵심 구조만 — 실제 파일 참고)
'use client';

// 상태 관리
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [sessionId] = useState(() => `session_${Date.now()}`);

// 메시지 전송 함수
const sendMessage = async () => {
  if (!input.trim()) return;

  // 사용자 메시지 추가
  setMessages(prev => [...prev, { role: 'user', content: input }]);
  setInput('');

  // API 호출
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message: input })
  });

  const data = await res.json();

  // AI 응답 추가
  setMessages(prev => [...prev, {
    role: 'model',
    content: data.message,
    empathyScore: data.empathyScore,
    reflection: data.reflection,
    recommendedAction: data.recommendedAction
  }]);
};
```

---

## 10. 환경변수 설정 (Vercel)

> ⚠️ **가장 중요한 체크포인트** — 변수 이름이 코드와 정확히 일치해야 합니다!

### Vercel 대시보드 설정 순서

1. `https://vercel.com` → 프로젝트 클릭
2. `Settings` 탭 → `Environment Variables` 메뉴
3. 아래 변수 추가:

| 변수명 (Name) | 값 (Value) | 환경 |
|:---|:---|:---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | `AIza...` (Google AI Studio에서 발급) | Production, Preview, Development 모두 체크 |

4. 저장 후 **반드시 재배포(Redeploy)** 를 해야 적용됩니다!

### 로컬 개발용 `.env.local` (gitignore 보호됨)

```bash
# .env.local (루트 디렉토리에 생성)
GOOGLE_GENERATIVE_AI_API_KEY=AIza여기에_실제_키_입력
```

### API 키 발급 방법

1. [Google AI Studio](https://aistudio.google.com) 접속
2. `Get API Key` 버튼 클릭
3. 발급된 키를 Vercel 환경변수에 붙여넣기

---

## 11. GitHub 및 Vercel 배포

```bash
# 1. Git 초기화 (처음 한 번만)
git init
git remote add origin https://github.com/[계정명]/[저장소명].git
git branch -M main

# 2. 첫 커밋 및 푸시
git add .
git commit -m "feat: 마음브릿지 초기 버전"
git push -u origin main

# 3. 이후 수정사항 푸시
git add -u                   # 수정된 파일만
git commit -m "fix: 내용"
git push origin main
```

### Vercel 자동 배포 연결

1. [vercel.com](https://vercel.com) → `Add New Project`
2. GitHub 저장소 연결
3. **Framework: Next.js** 자동 감지됨
4. 환경변수 입력 후 `Deploy` 클릭
5. 이후 `main` 브랜치에 푸시하면 자동 배포됨

---

## 12. 주요 트러블슈팅

| 증상 | 원인 | 해결 방법 |
|:---|:---|:---|
| 채팅 시 "기술적 연결 불안정" 메시지 | API 호출 실패 (catch 블록 실행) | 아래 체크리스트 확인 |
| AI 응답이 없음 | 환경변수 미설정 또는 이름 불일치 | Vercel 환경변수 `GOOGLE_GENERATIVE_AI_API_KEY` 확인 |
| 배포 후에도 오류 | 재배포 미실행 | Vercel → Deployments → `Redeploy` |
| 모델 오류 | 잘못된 모델 이름 | `gemini-2.5-flash` 정확히 입력 |
| 대화 맥락 초기화 | 인메모리 방식의 서버리스 한계 | Redis 도입 또는 세션 유지 로직 강화 |

### API 오류 진단 체크리스트

```
□ Vercel 환경변수 이름: GOOGLE_GENERATIVE_AI_API_KEY (오타 없이)
□ 환경변수 저장 후 Redeploy 실행 여부
□ Google AI Studio에서 API 키가 활성화 상태인지 확인
□ 모델명: gemini-2.5-flash (하이픈 위치 정확히)
□ Vercel 로그 확인: Deployments → 해당 배포 → Functions 탭
```

---

## 💡 향후 개선 포인트

- **Redis 도입:** `agent.retriever.ts`를 인메모리 → Redis로 교체하여 대화 영속성 확보
- **감정 추이 차트:** Recharts 등으로 대화 전반의 감정 변화 시각화
- **스트리밍 응답:** `generateContentStream()`으로 UX 개선
- **로그인/세션:** 사용자별 상담 내역 보관 기능

---

*이 문서는 마음브릿지(MindBridge) v1.0 기준으로 작성되었습니다. | 2026-04-01*
