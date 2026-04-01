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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass" 
        style={{ maxWidth: '800px', width: '100%', padding: '60px 40px', textAlign: 'center' }}
      >
        <div style={{ marginBottom: '40px' }}>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            style={{ display: 'inline-block', padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '20px' }}
          >
            <Heart size={48} color="var(--primary)" fill="var(--primary)" />
          </motion.div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
            마음브릿지 <span style={{ color: 'var(--primary)' }}>MindBridge</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-dark)', opacity: 0.8, lineHeight: 1.6 }}>
            지친 당신의 마음을 위한 따뜻한 공감과 통찰.<br />
            AI 심리상담사와 함께하는 안전하고 포근한 대화를 시작해보세요.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '50px' }}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ color: 'var(--accent)', marginBottom: '10px' }}><Sparkles size={32} style={{ margin: '0 auto' }} /></div>
            <h3 style={{ marginBottom: '8px' }}>지능형 공감</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>단순한 매크로 답변이 아닌 당신의 감정을 읽는 대화</p>
          </div>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '10px' }}><ShieldCheck size={32} style={{ margin: '0 auto' }} /></div>
            <h3 style={{ marginBottom: '8px' }}>안전한 익명성</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>당신의 상담 기록은 철저히 비밀로 유지됩니다</p>
          </div>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ color: 'var(--secondary)', marginBottom: '10px' }}><MessageCircle size={32} style={{ margin: '0 auto' }} /></div>
            <h3 style={{ marginBottom: '8px' }}>24/7 가용성</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>언제 어디서든 당신이 힘들 때 곁에 있습니다</p>
          </div>
        </div>

        <Link href="/chat">
          <button className="btn-primary" style={{ padding: '20px 60px', fontSize: '1.2rem' }}>
            지금 대화 시작하기
          </button>
        </Link>

        <p style={{ marginTop: '30px', fontSize: '0.8rem', opacity: 0.5 }}>
          ※ 마음브릿지는 AI 기반 서비스이며, 전문 의료 상담을 대체할 수 없습니다. 위기 시 전문가의 도움을 받으세요.
        </p>
      </motion.div>
    </main>
  );
}
