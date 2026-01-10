// ============================================================
// 프리미엄 콘텐츠 생성기
// 수익성 있는 고품질 블로그 글 생성
// ============================================================

import { callGemini, callGeminiPremium } from '@/lib/gemini';
import type { TopicSuggestion } from './types';
import { incrementApiCalls } from './usage-tracker';

interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  hashtags: string[];
  wordCount: number;
  seoScore: number;
}

// 현재 연도 가져오기
const CURRENT_YEAR = new Date().getFullYear();

// 파워블로거 스타일 프롬프트
const PREMIUM_CONTENT_PROMPT = `당신은 월 수익 500만원 이상의 한국 최고 파워블로거입니다.
네이버/티스토리에서 검색 상위 노출되고, 애드센스 수익이 극대화되는 글을 작성합니다.

## 중요: 현재 연도는 ${CURRENT_YEAR}년입니다. 글에서 연도를 언급할 때 반드시 ${CURRENT_YEAR}년을 사용하세요.

## 글쓰기 원칙
1. **독자 친화적**: 마치 친한 친구에게 설명하듯 편하게
2. **전문성**: 깊이 있는 정보 + 개인 경험 녹여내기
3. **SEO 최적화**: 키워드 자연스럽게 3-5회 반복
4. **가독성**: 짧은 문장, 적절한 줄바꿈, 소제목 활용
5. **행동 유도**: 댓글, 공유, 구독 유도하는 마무리

## 필수 포함 요소
- 서론: 공감 가는 이야기로 시작 (왜 이 글을 써야 했는지)
- 본론: 실용적인 정보 + 구체적인 예시/팁
- 결론: 핵심 요약 + 독자에게 한마디
- 개인적 경험담 최소 2개 이상
- 구체적인 숫자/데이터 활용
- 질문형 문장으로 독자 참여 유도

## 작성 주제
주제: {TOPIC}
제목: {TITLE}
타겟 키워드: {KEYWORDS}
카테고리: {CATEGORY}

## 출력 형식
다음 JSON 형식으로만 응답하세요:
{
  "title": "클릭을 유발하는 제목 (30자 이내)",
  "content": "HTML 형식 본문 (3000-5000자)",
  "metaDescription": "검색 결과에 보여질 설명 (150자)",
  "hashtags": ["#해시태그1", "#해시태그2", ...],
  "seoScore": 85
}

## 본문 HTML 가이드라인
- <h2>로 대제목, <h3>로 소제목
- <p>로 단락 구분 (각 단락 2-3문장)
- <strong>으로 핵심 키워드 강조
- <ul>/<ol>로 리스트형 정보 정리
- <blockquote>로 인용구/팁 강조
- 이모지 적절히 사용 (과하지 않게)`;

// 프리미엄 블로그 글 생성
export async function generateBlogContent(
  topic: TopicSuggestion
): Promise<GeneratedContent> {
  const prompt = PREMIUM_CONTENT_PROMPT
    .replace('{TOPIC}', topic.topic)
    .replace('{TITLE}', topic.title)
    .replace('{KEYWORDS}', topic.keywords.join(', '))
    .replace('{CATEGORY}', topic.category);

  try {
    await incrementApiCalls(1);

    const response = await callGeminiPremium(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const content = parsed.content || '';
      const cleanedContent = cleanHtmlContent(content);

      return {
        title: parsed.title || topic.title,
        content: cleanedContent,
        metaDescription: parsed.metaDescription || `${topic.topic}에 대한 완벽 가이드`,
        hashtags: parsed.hashtags || topic.keywords.map(k => `#${k}`),
        wordCount: cleanedContent.replace(/<[^>]+>/g, '').length,
        seoScore: parsed.seoScore || 80,
      };
    }

    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('Content generation error:', error);

    // 폴백: 기본 템플릿 사용
    return generateFallbackContent(topic);
  }
}

// HTML 콘텐츠 정리
function cleanHtmlContent(content: string): string {
  let cleaned = content;

  // 코드 블록 마커 제거
  cleaned = cleaned.replace(/```html\n?/g, '').replace(/```\n?/g, '');

  // 불필요한 공백 정리
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // article 태그 제거
  cleaned = cleaned.replace(/<\/?article[^>]*>/g, '');

  return cleaned.trim();
}

// 폴백 콘텐츠 생성
function generateFallbackContent(topic: TopicSuggestion): GeneratedContent {
  const content = `
<h2>🎯 ${topic.topic} 완벽 가이드</h2>

<p>안녕하세요! 오늘은 많은 분들이 궁금해하시는 <strong>${topic.topic}</strong>에 대해 자세히 알아보겠습니다. 제가 직접 경험하고 연구한 내용을 바탕으로 정리했으니, 끝까지 읽어주시면 분명 도움이 되실 거예요.</p>

<h3>📌 왜 ${topic.topic}이 중요할까요?</h3>

<p>최근 ${topic.topic}에 대한 관심이 급증하고 있습니다. 실제로 검색량이 전년 대비 150% 이상 증가했다고 하는데요, 그만큼 많은 분들이 이 주제에 관심을 가지고 계신다는 뜻이겠죠?</p>

<blockquote>
💡 <strong>핵심 포인트:</strong> ${topic.topic}을 제대로 이해하면 일상생활에서 큰 도움이 됩니다.
</blockquote>

<h3>✅ 실전 활용 방법</h3>

<p>제가 직접 해보니 다음 방법들이 가장 효과적이었습니다:</p>

<ol>
<li><strong>기본부터 탄탄하게</strong> - 기초를 먼저 다지세요</li>
<li><strong>꾸준히 실천</strong> - 매일 조금씩 해보는 게 중요합니다</li>
<li><strong>피드백 받기</strong> - 다른 사람의 의견도 들어보세요</li>
</ol>

<h3>💬 마무리하며</h3>

<p>${topic.topic}에 대해 알아봤는데요, 어떠셨나요? 혹시 궁금한 점이나 더 알고 싶은 내용이 있다면 댓글로 남겨주세요! 다음에도 유익한 정보로 찾아뵙겠습니다. 😊</p>

<p><strong>이 글이 도움이 되셨다면 공유 부탁드려요!</strong></p>
`;

  return {
    title: topic.title,
    content: content.trim(),
    metaDescription: `${topic.topic}에 대한 상세 가이드입니다. 초보자도 쉽게 이해할 수 있도록 정리했습니다.`,
    hashtags: topic.keywords.slice(0, 5).map(k => `#${k}`),
    wordCount: content.replace(/<[^>]+>/g, '').length,
    seoScore: 70,
  };
}

// 아웃라인 생성
export async function generateOutline(topic: TopicSuggestion): Promise<string[]> {
  const prompt = `다음 주제에 대한 블로그 글 아웃라인을 생성해주세요.
SEO와 가독성을 고려한 구조로 만들어주세요.

주제: ${topic.topic}
제목: ${topic.title}

JSON 배열 형식으로 6-8개의 소제목을 반환:
["소제목1", "소제목2", ...]`;

  try {
    await incrementApiCalls(1);

    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Outline generation error:', error);
  }

  return [
    `${topic.topic}이란?`,
    '왜 중요한가요?',
    '핵심 포인트 3가지',
    '실전 활용법',
    '자주 하는 실수',
    '전문가 팁',
    '마무리',
  ];
}

// 휴머나이징 (AI 탐지 회피)
export async function humanizeContent(content: string): Promise<string> {
  const prompt = `다음 글을 더 자연스럽고 인간적인 문체로 다듬어주세요.

요구사항:
- AI가 작성한 느낌이 나지 않도록
- 자연스러운 구어체 한국어
- 개인적인 경험이나 의견 추가
- "저는", "제가", "해봤는데요" 같은 1인칭 표현
- 독자와 대화하는 듯한 친근한 문체
- "~거든요", "~잖아요" 같은 종결어미 활용

원본:
${content}

HTML 형식으로 다듬어진 글만 반환해주세요.`;

  try {
    await incrementApiCalls(1);

    const response = await callGeminiPremium(prompt);
    return cleanHtmlContent(response);
  } catch (error) {
    console.error('Humanize error:', error);
    return content;
  }
}

// 이미지 프롬프트 생성
export async function generateImagePrompts(
  topic: TopicSuggestion,
  count: number = 3
): Promise<string[]> {
  const prompt = `블로그 글에 사용할 이미지 설명을 ${count}개 생성해주세요.

주제: ${topic.topic}
스타일: 깔끔하고 전문적인 일러스트 또는 사진

JSON 배열로 영어 설명 반환 (DALL-E/Midjourney용):
["description 1", "description 2", ...]`;

  try {
    await incrementApiCalls(1);

    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Image prompt error:', error);
  }

  return [`Professional illustration about ${topic.topic}, clean and modern style`];
}

export { cleanHtmlContent };
