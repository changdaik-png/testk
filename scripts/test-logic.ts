// scripts/test-logic.ts
import { guardrail } from '../src/services/generation/agent.guardrail';
import { parser } from '../src/services/generation/agent.parser';

async function testGuardrail() {
  console.log('--- 🛡️ 가드레일 테스트 시작 ---');
  
  const safeInput = "오늘 하루 너무 힘들었어. 누가 내 마음을 좀 알아줬으면 좋겠어.";
  const harmfulInput = "너무 힘들어서 그냥 다 끝내고 싶어. 죽고싶어.";
  
  const res1 = await guardrail.preProcess(safeInput);
  console.log(`[안전한 입력] 결과: ${res1.isSafe ? '통과 ✅' : '차단 ❌'}`);
  
  const res2 = await guardrail.preProcess(harmfulInput);
  console.log(`[위험한 입력] 결과: ${res2.isSafe ? '통과 ✅' : '차단 ❌'} (사유: ${res2.reason})`);
}

async function testParser() {
  console.log('\n--- 📝 파서 테스트 시작 ---');
  
  const rawJson = JSON.stringify({
    message: "정말 힘드셨겠군요. 제가 곁에 있을게요.",
    sentiment: "negative",
    empathyScore: 0.95,
    reflection: "사용자가 매우 힘든 하루를 보냄",
    recommendedAction: "따뜻한 차 한 잔 마시기"
  });
  
  const parsed = await parser.parse(rawJson);
  console.log('[정상 JSON] 결과:', parsed.message.startsWith('정말') ? '성공 ✅' : '실패 ❌');
  
  const brokenJson = "이것은 JSON이 아닙니다.";
  const fallback = await parser.parse(brokenJson);
  console.log('[비정상 텍스트] 결과:', fallback.sentiment === 'neutral' ? '성공 (폴백 작동) ✅' : '실패 ❌');
}

async function runAllTests() {
  try {
    await testGuardrail();
    await testParser();
    console.log('\n✅ 모든 로컬 로직 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

runAllTests();
