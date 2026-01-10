// ============================================================
// 품질 점수 시스템 - AI 자체 평가 + 재작성 로직
// 최소 점수 미달 시 자동 재작성
// ============================================================

import { callGemini } from '@/lib/gemini';

export interface QualityScore {
  overall: number;          // 종합 점수 (0-100)
  breakdown: {
    readability: number;    // 가독성 (0-100)
    expertise: number;      // 전문성 (0-100)
    engagement: number;     // 독자 참여도 (0-100)
    seoOptimization: number; // SEO 최적화 (0-100)
    originality: number;    // 독창성 (0-100)
    humanLikeness: number;  // 인간다움 (0-100)
    valueProvided: number;  // 실용적 가치 (0-100)
    emotionalHook: number;  // 감정적 호소력 (0-100)
  };
  feedback: string[];       // 개선 피드백
  passedMinimum: boolean;   // 최소 점수 통과 여부
}

// 최소 품질 점수 (이 점수 미달 시 재작성)
export const MINIMUM_QUALITY_SCORE = 75;

// 품질 점수 평가 프롬프트
const QUALITY_EVALUATION_PROMPT = `당신은 10년 경력의 파워블로거이자 콘텐츠 품질 전문가입니다.
300명 이상의 성공한 파워블로거들의 글 패턴을 학습했습니다.

다음 블로그 글을 엄격하게 평가해주세요.
실제 파워블로거 수준의 글인지, 네이버 검색 상위 노출이 가능한지 판단합니다.

## 평가 기준 (각 항목 0-100점)

1. **가독성 (readability)**: 문장 길이, 단락 구성, 줄바꿈, 소제목 활용
2. **전문성 (expertise)**: 정확한 정보, 깊이 있는 분석, 신뢰할 수 있는 내용
3. **독자 참여도 (engagement)**: 질문 유도, 공감 요소, 댓글/공유 유발
4. **SEO 최적화 (seoOptimization)**: 키워드 배치, 메타 설명, 제목 매력도
5. **독창성 (originality)**: 새로운 관점, 차별화된 정보, 복붙 느낌 없음
6. **인간다움 (humanLikeness)**: AI 느낌 없음, 자연스러운 문체, 개인 경험
7. **실용적 가치 (valueProvided)**: 독자가 얻어갈 정보, 행동 가능한 팁
8. **감정적 호소력 (emotionalHook)**: 스토리텔링, 공감, 감정 연결

## 평가할 글

제목: {TITLE}

본문:
{CONTENT}

## 응답 형식 (JSON만 출력)
{
  "overall": 종합점수,
  "breakdown": {
    "readability": 점수,
    "expertise": 점수,
    "engagement": 점수,
    "seoOptimization": 점수,
    "originality": 점수,
    "humanLikeness": 점수,
    "valueProvided": 점수,
    "emotionalHook": 점수
  },
  "feedback": ["개선점1", "개선점2", "개선점3"],
  "criticalIssues": ["치명적 문제점 (있다면)"]
}`;

// 글 품질 평가
export async function evaluateQuality(
  title: string,
  content: string
): Promise<QualityScore> {
  const prompt = QUALITY_EVALUATION_PROMPT
    .replace('{TITLE}', title)
    .replace('{CONTENT}', content.substring(0, 8000)); // 토큰 제한

  try {
    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // 종합 점수 계산 (가중 평균)
      const weights = {
        readability: 0.12,
        expertise: 0.15,
        engagement: 0.13,
        seoOptimization: 0.15,
        originality: 0.12,
        humanLikeness: 0.13,
        valueProvided: 0.12,
        emotionalHook: 0.08,
      };

      const breakdown = parsed.breakdown || {};
      let weightedSum = 0;
      let totalWeight = 0;

      for (const [key, weight] of Object.entries(weights)) {
        const score = breakdown[key] || 50;
        weightedSum += score * weight;
        totalWeight += weight;
      }

      const overall = Math.round(weightedSum / totalWeight);

      return {
        overall: parsed.overall || overall,
        breakdown: {
          readability: breakdown.readability || 50,
          expertise: breakdown.expertise || 50,
          engagement: breakdown.engagement || 50,
          seoOptimization: breakdown.seoOptimization || 50,
          originality: breakdown.originality || 50,
          humanLikeness: breakdown.humanLikeness || 50,
          valueProvided: breakdown.valueProvided || 50,
          emotionalHook: breakdown.emotionalHook || 50,
        },
        feedback: parsed.feedback || [],
        passedMinimum: (parsed.overall || overall) >= MINIMUM_QUALITY_SCORE,
      };
    }
  } catch (error) {
    console.error('Quality evaluation error:', error);
  }

  // 폴백: 기본 점수
  return {
    overall: 60,
    breakdown: {
      readability: 60,
      expertise: 60,
      engagement: 60,
      seoOptimization: 60,
      originality: 60,
      humanLikeness: 60,
      valueProvided: 60,
      emotionalHook: 60,
    },
    feedback: ['평가 실패 - 재시도 필요'],
    passedMinimum: false,
  };
}

// 피드백 기반 글 개선
export async function improveContent(
  title: string,
  content: string,
  feedback: string[]
): Promise<{ title: string; content: string }> {
  const prompt = `당신은 파워블로거 글 개선 전문가입니다.

다음 피드백을 바탕으로 글을 개선해주세요.

## 개선 피드백
${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## 원본 제목
${title}

## 원본 본문
${content}

## 개선 요구사항
1. 피드백의 모든 문제점을 해결
2. 더 자연스럽고 인간적인 문체로
3. 파워블로거 수준의 퀄리티로
4. SEO 최적화 유지
5. 독자 참여도 높이기

## 응답 형식 (JSON)
{
  "title": "개선된 제목",
  "content": "개선된 HTML 본문"
}`;

  try {
    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || title,
        content: parsed.content || content,
      };
    }
  } catch (error) {
    console.error('Content improvement error:', error);
  }

  return { title, content };
}

// 품질 점수 로그 출력
export function logQualityScore(score: QualityScore): void {
  console.log('\n═══════════════════════════════════════');
  console.log('📊 품질 점수 평가 결과');
  console.log('═══════════════════════════════════════');
  console.log(`종합 점수: ${score.overall}/100 ${score.passedMinimum ? '✅ 통과' : '❌ 미달'}`);
  console.log('\n세부 항목:');
  console.log(`  가독성: ${score.breakdown.readability}`);
  console.log(`  전문성: ${score.breakdown.expertise}`);
  console.log(`  참여도: ${score.breakdown.engagement}`);
  console.log(`  SEO: ${score.breakdown.seoOptimization}`);
  console.log(`  독창성: ${score.breakdown.originality}`);
  console.log(`  인간다움: ${score.breakdown.humanLikeness}`);
  console.log(`  실용성: ${score.breakdown.valueProvided}`);
  console.log(`  감성: ${score.breakdown.emotionalHook}`);

  if (score.feedback.length > 0) {
    console.log('\n개선 피드백:');
    score.feedback.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  }
  console.log('═══════════════════════════════════════\n');
}
