// src/app/chat/page.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Heart, Smile, Frown, Meh, Activity, Lightbulb, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ────────────────────────────────────────────
// 타입 정의
// ────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  empathyScore?: number;
  reflection?: string;
  recommendedAction?: string;
}

// ────────────────────────────────────────────
// 컴포넌트 유틸리티
// ────────────────────────────────────────────
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// ────────────────────────────────────────────
// 감정 아이콘 컴포넌트
// ────────────────────────────────────────────
function SentimentIcon({ sentiment }: { sentiment: 'positive' | 'negative' | 'neutral' | null }) {
  if (sentiment === 'positive') return <Smile size={48} className="text-emerald-500" />;
  if (sentiment === 'negative') return <Frown size={48} className="text-rose-500" />;
  return <Meh size={48} className="text-slate-400" />;
}

function getSentimentLabel(s: string | null): string {
  if (s === 'positive') return '☀️ 조금씩 맑아짐';
  if (s === 'negative') return '🌧 비가 내리는 중';
  return '🌊 잔잔한 호수';
}

// ────────────────────────────────────────────
// 공감 지수 바 컴포넌트
// ────────────────────────────────────────────
function EmpathyBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  return (
    <div className="mt-2 pt-2 border-t border-white/10">
      <div className="flex justify-between text-[0.7rem] opacity-60 mb-1">
        <span>공감 지수</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// 메인 채팅 페이지
// ────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSentiment, setCurrentSentiment] = useState<'positive' | 'negative' | 'neutral' | null>(null);
  const [showReport, setShowReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const latestAction = messages.findLast(m => m.role === 'model')?.recommendedAction;

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { id: `${Date.now()}`, role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'session-1', message: trimmed }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const modelMsg: Message = {
        id: `${Date.now() + 1}`,
        role: 'model',
        text: data.message ?? '답변을 가져오지 못했어요. 잠시 후 다시 시도해 주세요.',
        sentiment: data.sentiment,
        empathyScore: data.empathyScore,
        reflection: data.reflection,
        recommendedAction: data.recommendedAction,
      };

      setMessages(prev => [...prev, modelMsg]);
      if (data.sentiment) setCurrentSentiment(data.sentiment);
    } catch (err) {
      console.error('Chat API 오류:', err);
      setMessages(prev => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'model', text: '죄송합니다. 현재 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.' },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading]);

  return (
    <main className="chat-container">
      <div className="bg-gradient-mesh" />

      {/* 헤더 */}
      <header className="chat-header glass">
        <div className="flex items-center gap-3">
          <Link href="/" passHref>
            <button aria-label="홈으로 돌아가기" className="flex text-inherit cursor-pointer bg-none border-none">
              <ArrowLeft size={22} />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-[var(--accent)] fill-[var(--accent)]" />
            <span className="font-bold text-lg">마음브릿지 상담소</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 2 && (
            <button 
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <ClipboardList size={16} /> 리포트 보기
            </button>
          )}
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-[var(--primary)] text-sm font-semibold">
            경청 중 ●
          </span>
        </div>
      </header>

      {/* 본문 */}
      <div className="chat-content">

        {/* 사이드바 */}
        <aside className="chat-sidebar glass">
          <section>
            <h2 className="flex items-center gap-1.5 mb-3 text-sm font-bold">
              <Activity size={16} /> 실시간 마음 지표
            </h2>
            <div className="indicator-card">
              <div className="flex justify-center mb-2.5">
                <SentimentIcon sentiment={currentSentiment} />
              </div>
              <p className="text-[0.8rem] opacity-60 mb-1">오늘 당신의 마음은</p>
              <strong className="text-base">{getSentimentLabel(currentSentiment)}</strong>
            </div>
          </section>

          <section className="flex-1">
            <h2 className="flex items-center gap-1.5 mb-3 text-sm font-bold">
              <Lightbulb size={16} /> 오늘의 소소한 활동
            </h2>
            <AnimatePresence mode="wait">
              {latestAction ? (
                <motion.blockquote
                  key={latestAction}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="action-blockquote"
                >
                  "{latestAction}"
                </motion.blockquote>
              ) : (
                <p className="opacity-40 text-sm leading-relaxed">
                  대화가 깊어지면<br />맞춤 활동 조언이 나타납니다.
                </p>
              )}
            </AnimatePresence>
          </section>

          <p className="text-[0.7rem] opacity-30 leading-tight">
            본 서비스는 AI 기반이며 전문 의료 진단을 대체하지 않습니다.
          </p>
        </aside>

        {/* 채팅 영역 */}
        <section className="chat-main">
          <div className="chat-messages glass" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-center">
                <div className="opacity-50">
                  <Heart size={52} className="mx-auto mb-4" />
                  <p className="leading-relaxed">
                    반가워요. 오늘 어떤 일들이 있었나요?<br />
                    당신의 이야기를 조용히 듣겠습니다. 🌿
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("message-wrapper", m.role === 'user' ? "user" : "model")}
                >
                  <div className={cn("message-bubble", m.role === 'user' ? "user" : "model")}>
                    {m.text}
                    {m.role === 'model' && m.empathyScore !== undefined && (
                      <EmpathyBar score={m.empathyScore} />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="message-wrapper model">
                <div className="message-bubble model flex gap-1.5 items-center">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.span
                      key={i}
                      className="block w-2 h-2 rounded-full bg-[var(--primary)]"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 입력창 */}
          <div className="chat-input-area glass">
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              className="input-glass flex-1 border-none bg-transparent text-base"
              placeholder="여기에 편히 말씀해 주세요..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={isLoading}
              autoFocus
            />
            <button
              id="chat-send-btn"
              className="btn-primary p-0 w-[46px] h-[46px] rounded-full flex items-center justify-center shrink-0"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="메시지 보내기"
            >
              <Send size={18} />
            </button>
          </div>
        </section>
      </div>

      {/* 리포트 모달 */}
      <AnimatePresence>
        {showReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass max-w-lg w-full p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" />
              
              <button 
                onClick={() => setShowReport(false)}
                className="absolute top-4 right-4 text-2xl opacity-40 hover:opacity-100 transition-opacity"
              >
                &times;
              </button>

              <div className="text-center mb-8">
                <ClipboardList size={48} className="mx-auto mb-4 text-[var(--primary)]" />
                <h2 className="text-2xl font-bold mb-2">오늘의 마음 분석 리포트</h2>
                <p className="opacity-60 text-sm">함께 나눈 대화를 바탕으로 정리한 오늘의 기록입니다.</p>
              </div>

              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-bold opacity-40 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                    <Activity size={14} /> 오늘의 감정 요약
                  </h3>
                  <div className="flex items-center gap-4">
                    <SentimentIcon sentiment={currentSentiment} />
                    <div>
                      <p className="text-lg font-bold">{getSentimentLabel(currentSentiment)}</p>
                      <p className="text-sm opacity-60">대화 내내 차분하고 솔직한 마음을 보여주셨어요.</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-bold opacity-40 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                    <Lightbulb size={14} /> 따뜻한 한마디
                  </h3>
                  <p className="italic text-[var(--primary)] leading-relaxed font-medium">
                    "{messages.findLast(m => m.role === 'model')?.reflection || "당신의 마음을 소중히 간직할게요."}"
                  </p>
                </div>

                {latestAction && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-[var(--primary)]/20">
                    <h3 className="text-sm font-bold text-[var(--accent)] mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      ✨ 추천 위로 활동
                    </h3>
                    <p className="font-semibold text-lg">{latestAction}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowReport(false)}
                className="btn-primary w-full mt-8 py-4 text-lg"
              >
                리포트 닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
