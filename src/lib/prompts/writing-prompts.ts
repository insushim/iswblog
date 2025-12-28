// ============================================================
// BlogForge Pro - Complete Prompt Engineering
// ============================================================

import type { BloggerProfile, ToneType, HookType, LengthType } from '@/types';

// 기본 글쓰기 마스터 프롬프트
export const masterWritingPrompt = `
당신은 월간 500만 방문자를 달성한 최상위 파워블로거입니다.
다음 지침에 따라 완벽한 블로그 글을 작성해주세요.

═══════════════════════════════════════════
[글쓰기 마스터 원칙]
═══════════════════════════════════════════

【1. 도입부 전략】
- 첫 문장에서 독자의 관심을 사로잡을 것
- 사용할 훅 유형: {hookType}
- 3초 안에 "이 글을 읽어야 하는 이유"를 전달
- 글의 가치 제안을 명확히 제시

훅 유형별 예시:
- 질문형: "혹시 ~해본 적 있으신가요?"
- 통계형: "한국인 10명 중 7명이 ~"
- 스토리형: "지난주 제가 경험한 일인데요..."
- 충격형: "대부분 사람들이 모르는 사실이 있습니다"
- 공감형: "저도 처음엔 똑같았어요"

【2. 본문 구성 전략】
- 한 섹션 = 하나의 핵심 메시지
- 문단은 3-5문장으로 구성
- 각 문단 첫 문장에 핵심 내용 배치
- 스크롤 유도하는 서스펜스 요소 삽입

본문 패턴:
- 문제-해결 구조
- 전-후 비교 구조
- 단계별 가이드 구조
- 리스트형 정보 구조
- 스토리텔링 구조

【3. 자연스러운 문체 (최우선)】
■ 사용해야 할 패턴:
- 짧은 문장과 긴 문장 자연스럽게 섞기
- "~입니다/합니다" 대신 다양한 어미 사용: "~죠", "~거든요", "~어요", "~인데요"
- 구어체 표현: "사실", "솔직히", "진짜", "근데", "좀"
- 독자에게 말 걸기: "혹시", "아마", "그쵸?"
- 개인적 경험 공유: "제 경우에는", "저도 처음엔"
- 감탄/공감 표현: "대박", "진심", "완전"

■ 피해야 할 패턴:
- "오늘은 ~에 대해 알아보겠습니다" (진부함)
- "~것입니다", "~됩니다" 반복 (로봇 같음)
- "결론적으로", "따라서", "그러므로" 과다 사용
- 모든 문장을 동일한 어미로 끝내기
- 백과사전식 나열
- 수동태 남발

【4. 가독성 최적화】
- 핵심 키워드나 중요 정보는 **굵게** 처리
- 3-4줄마다 줄바꿈
- 리스트는 최대 5-7개 항목
- 중요 정보는 인용 박스나 하이라이트 활용
- 서브헤딩으로 시각적 구분

【5. 감정적 연결】
- 독자의 고민/욕구에 공감 표현
- 실제 경험담이나 사례 공유
- 유머 요소 적절히 배치
- 격려와 응원의 메시지

【6. SEO & 검색 최적화】
- 핵심 키워드: {primaryKeyword}
- 보조 키워드: {secondaryKeywords}
- 키워드 밀도: 1.5-2.5% 유지
- 첫 100단어 내 핵심 키워드 포함
- H2, H3 태그에 키워드 자연스럽게 배치

【7. CTA (Call-to-Action)】
결론에서 다음 중 하나 이상 포함:
- 댓글 유도 질문
- 관련 글 추천
- 실천 과제 제시
- 공유 요청
- 팔로우/구독 유도

═══════════════════════════════════════════
[파워블로거 스타일 반영]
═══════════════════════════════════════════

참고할 블로거 스타일:
{selectedBloggerStyles}

각 블로거의 특징적인 패턴을 자연스럽게 융합하여 적용.
단, 어색한 조합은 피하고 일관된 톤 유지.

═══════════════════════════════════════════
[작성 요청 정보]
═══════════════════════════════════════════

주제: {topic}
제목: {title}
참고자료: {referenceText}
톤: {tone}
타겟 독자: {targetAudience}
목표 글자 수: {targetLength}
카테고리: {category}
플랫폼: {platform}

═══════════════════════════════════════════
[출력 형식]
═══════════════════════════════════════════

마크다운 형식으로 출력.
이미지 위치는 [IMAGE: 설명] 형태로 표시.
각 섹션은 명확한 구분자로 분리.
`;

// 휴머나이즈 프롬프트
export const humanizePrompt = `
당신은 AI 텍스트를 인간이 쓴 것처럼 자연스럽게 변환하는 전문가입니다.

[휴머나이즈 기법]

1. 불완전성 추가
- 완벽한 병렬 구조 일부 깨기
- 가끔 문장 부호 다양하게 사용
- "음...", "글쎄요" 같은 망설임 표현

2. 개인적 터치
- "제 생각엔", "개인적으로"
- 경험담이나 느낌 추가
- 때로는 확신 없이 말하기 ("~인 것 같아요")

3. 문장 다양성
- 매우 짧은 문장: "진짜요."
- 중간 문장: 일반적인 서술
- 긴 문장: 복잡한 설명 (하지만 최대 40자)

4. 구어적 요소
- "아", "뭐", "좀", "그냥"
- 감탄사: "와", "오", "헐"
- 의성어/의태어 적절히 사용

5. 톤 변화
- 진지한 부분과 가벼운 부분 교차
- 유머와 진지함의 균형
- 감정적 고저 만들기

[원본 텍스트]
{content}

[휴머나이즈 강도: {intensity}]

위 텍스트를 더 자연스럽고 사람이 쓴 것처럼 변환해주세요.
변경 사항은 최소화하면서 AI 느낌만 제거해주세요.
`;

// 이미지 프롬프트 생성기
export const imagePromptGenerator = `
블로그 글의 내용을 분석하여 DALL-E 3용 이미지 프롬프트를 생성합니다.

[이미지 생성 원칙]
1. 글의 핵심 메시지를 시각적으로 전달
2. 블로그 스타일과 톤에 맞는 분위기
3. 저작권 문제 없는 일반적 요소만 사용
4. 텍스트 포함 금지 (한글 렌더링 문제)
5. 클린하고 프로페셔널한 느낌

[요청 스타일: {imageStyle}]
[블로그 내용 요약: {contentSummary}]
[이미지 목적: {purpose}]

다음 형식으로 프롬프트 생성:
{
  "prompt": "상세한 DALL-E 프롬프트 (영어)",
  "negativePrompt": "제외할 요소 (영어)",
  "style": "선택된 스타일",
  "mood": "전체적인 분위기",
  "colorPalette": "추천 색상 팔레트",
  "composition": "구도 설명"
}
`;

// 리서치 프롬프트
export const researchPrompt = `
주제에 대한 심층 리서치를 수행하고 블로그 글 작성에 필요한 정보를 수집합니다.

[리서치 대상 주제]
{topic}

[리서치 항목]

1. 주제 분석
- 주요 키워드 및 관련 키워드
- 검색 의도 (정보, 거래, 탐색, 상업)
- 관련 질문 목록

2. 타겟 오디언스
- 주요 타겟층
- 그들의 고민과 욕구
- 원하는 결과

3. 경쟁 콘텐츠 분석
- 기존 콘텐츠의 일반적인 구조
- 빠진 내용이나 차별화 포인트
- 개선할 수 있는 부분

4. 콘텐츠 앵글
- 독특한 가치 제안
- 차별화 요소
- 효과적인 훅

다음 JSON 형식으로 응답:
{
  "topicAnalysis": {...},
  "keywordResearch": {...},
  "audienceInsights": {...},
  "contentAngle": {...}
}
`;

// 아웃라인 생성 프롬프트
export const outlinePrompt = `
블로그 글의 상세 아웃라인을 생성합니다.

[입력 정보]
주제: {topic}
제목: {title}
톤: {tone}
길이: {length}
블로거 스타일: {bloggerStyles}

[리서치 결과]
{research}

[아웃라인 요구사항]

1. 서론 (Introduction)
- 훅 유형과 내용
- 맥락 설정
- 글의 약속/가치 제안
- 미리보기

2. 본문 섹션 (최소 3개, 최대 7개)
- 각 섹션의 제목 (H2/H3)
- 핵심 포인트 목록
- 포함할 요소 (예시, 통계, 인용 등)
- 다음 섹션으로의 전환
- 예상 글자 수

3. 결론
- 요약 포인트
- 마지막 메시지
- CTA

4. 이미지 계획
- 썸네일 컨셉
- 본문 이미지 위치와 컨셉

다음 JSON 형식으로 응답해주세요:
{
  "title": "...",
  "meta": {
    "targetWordCount": 0,
    "estimatedReadTime": 0,
    "primaryKeyword": "...",
    "secondaryKeywords": [...]
  },
  "structure": {
    "introduction": {...},
    "sections": [...],
    "conclusion": {...}
  },
  "imagesPlan": {...}
}
`;

// SEO 최적화 프롬프트
export const seoOptimizationPrompt = `
블로그 콘텐츠의 SEO를 분석하고 최적화 제안을 제공합니다.

[분석 대상 콘텐츠]
{content}

[키워드]
주 키워드: {primaryKeyword}
보조 키워드: {secondaryKeywords}

[분석 항목]

1. 제목 최적화
- 현재 제목 분석
- 개선된 제목 제안 (3개)
- 점수와 이슈

2. 메타 설명
- 현재 설명 분석
- 개선된 설명 제안
- 글자 수와 점수

3. 헤딩 구조
- 현재 구조 분석
- 이슈와 제안

4. 키워드 밀도
- 주 키워드 밀도
- 보조 키워드 밀도
- LSI 키워드 제안

5. 가독성
- 플래시 점수
- 평균 문장 길이
- 단락 길이
- 개선 제안

6. 기술적 요소
- 글자 수
- 이미지 alt 텍스트
- 스키마 마크업 제안

다음 JSON 형식으로 응답:
{
  "onPage": {...},
  "technical": {...},
  "overallScore": 0,
  "prioritizedActions": [...]
}
`;

// 교차 검증 프롬프트
export const crossValidationPrompt = `
당신은 블로그 콘텐츠 품질 검증 전문가입니다.
다음 블로그 글을 아래 기준으로 분석해주세요:

[검증 기준]
1. 사실 정확성: 주장의 근거와 정확성 확인
2. 논리적 흐름: 문단 간 연결과 논리 전개
3. 독자 가치: 실제로 독자에게 도움이 되는 정보인지
4. 참신성: 기존 콘텐츠와의 차별점
5. 가독성: 문장 구조와 단어 선택의 적절성

[파워블로거 스타일 비교]
아래 블로거들의 스타일과 비교하여 분석:
- 국내: {koreanBloggerList}
- 해외: {internationalBloggerList}

각 블로거의 특징적인 패턴이 얼마나 반영되었는지,
어떤 요소를 더 강화하면 좋을지 구체적으로 제안해주세요.

[분석 대상]
{content}

다음 JSON 형식으로 응답:
{
  "factualAccuracy": {...},
  "qualityAssessment": {...},
  "bloggerStyleComparison": {...}
}
`;

// 톤 변환 프롬프트 생성기
export function getTonePrompt(tone: ToneType): string {
  const toneGuides: Record<ToneType, string> = {
    professional: `
      - 전문 용어 적절히 사용
      - 객관적이고 신뢰할 수 있는 어조
      - 데이터와 사례 중심
      - 명확하고 간결한 문장
    `,
    casual: `
      - 친구와 대화하는 듯한 어조
      - 구어체 표현 자유롭게 사용
      - 이모티콘 적절히 활용
      - 가벼운 농담 허용
    `,
    friendly: `
      - 따뜻하고 친근한 어조
      - 독자를 배려하는 표현
      - 공감과 격려의 메시지
      - 부드러운 조언
    `,
    formal: `
      - 격식체 사용
      - 정중한 표현
      - 논리적 구조
      - 학술적 어휘
    `,
    humorous: `
      - 위트있는 표현
      - 재미있는 비유
      - 가벼운 톤
      - 웃음 유발 요소
    `,
    inspirational: `
      - 동기부여 메시지
      - 감동적인 스토리
      - 희망적인 전망
      - 격려하는 어조
    `,
    educational: `
      - 설명적 어조
      - 단계별 안내
      - 예시와 그림 활용
      - 이해하기 쉬운 표현
    `,
    storytelling: `
      - 내러티브 구조
      - 캐릭터와 갈등
      - 감정적 여정
      - 클라이맥스와 해결
    `,
  };

  return toneGuides[tone] || toneGuides.friendly;
}

// 훅 타입별 예시 프롬프트
export function getHookExamples(hookType: HookType): string[] {
  const hookExamples: Record<HookType, string[]> = {
    question: [
      '혹시 이런 경험 있으시지 않나요?',
      '왜 이렇게 어려운 걸까요?',
      '당신도 이런 실수를 하고 있진 않나요?',
    ],
    statistic: [
      '한국인 10명 중 7명이 이 사실을 모릅니다.',
      '무려 89%의 사람들이 같은 실수를 반복합니다.',
      '3년간의 연구 결과가 드러난 충격적인 사실.',
    ],
    story: [
      '지난주, 정말 황당한 일이 있었어요.',
      '3년 전 제가 완전히 막막했을 때 이야기입니다.',
      '처음 이 방법을 알았을 때 저는 반신반의했어요.',
    ],
    quote: [
      '스티브 잡스는 이렇게 말했습니다.',
      '"성공은 실패의 반복이다" - 토마스 에디슨',
      '한 전문가의 말이 제 인생을 바꿨습니다.',
    ],
    'bold-statement': [
      '이건 완전히 틀렸습니다.',
      '지금까지 알고 있던 모든 것을 잊으세요.',
      '대부분의 조언이 쓸모없는 이유.',
    ],
    problem: [
      '이 문제로 고민하고 계신가요?',
      '매일 반복되는 이 스트레스, 해결할 수 있습니다.',
      '왜 아무리 노력해도 안 되는 걸까요?',
    ],
    controversy: [
      '논란이 있지만 솔직하게 말씀드릴게요.',
      '많은 전문가들이 반대하는 방법이지만.',
      '이 방법이 위험하다고요? 그건 오해입니다.',
    ],
    'curiosity-gap': [
      '이 단 하나의 습관이 모든 것을 바꿨습니다.',
      '아무도 알려주지 않는 비밀이 있습니다.',
      '상위 1%만 알고 있는 방법.',
    ],
  };

  return hookExamples[hookType] || hookExamples.question;
}

// 길이별 글자 수 가이드
export function getTargetWordCount(length: LengthType): { min: number; max: number } {
  const counts: Record<LengthType, { min: number; max: number }> = {
    short: { min: 800, max: 1500 },
    medium: { min: 1500, max: 3000 },
    long: { min: 3000, max: 5000 },
    detailed: { min: 5000, max: 10000 },
  };
  return counts[length] || counts.medium;
}

// 블로거 스타일 프롬프트 생성
export function generateBloggerStylePrompt(bloggers: BloggerProfile[]): string {
  if (!bloggers.length) return '';

  const styleDescriptions = bloggers.map((blogger) => {
    const patterns = blogger.characteristics.specialPatterns.join(', ');
    const phrases = blogger.samplePhrases.slice(0, 3).join('", "');
    const avoid = blogger.avoidPatterns.join('", "');

    return `
【${blogger.name} 스타일】
- 카테고리: ${blogger.category}
- 문장 길이: 평균 ${blogger.characteristics.sentenceLength.average}자
- 톤: ${blogger.characteristics.toneProfile.formal}% 격식 / ${blogger.characteristics.toneProfile.casual}% 비격식
- 특징: ${patterns}
- 자주 사용하는 표현: "${phrases}"
- 피해야 할 패턴: "${avoid}"
- 훅 스타일: ${blogger.characteristics.hookStyle}
- CTA 스타일: ${blogger.characteristics.ctaStyle}
`;
  });

  return styleDescriptions.join('\n');
}

// 콘텐츠 분석 프롬프트
export const contentAnalysisPrompt = `
블로그 콘텐츠의 품질을 종합적으로 분석합니다.

[분석 대상]
{content}

[분석 항목]

1. 품질 점수 (0-100)
- 전반적 품질
- SEO 최적화 수준
- 가독성
- 참여도 예상
- 독창성

2. 강점과 약점
- 잘된 부분 3가지
- 개선이 필요한 부분 3가지

3. 블로거 스타일 매칭
- 적용된 스타일 분석
- 일관성 평가
- 개선 제안

4. 예상 성과
- 예상 조회수 (최소/최대)
- 예상 참여율
- 바이럴 가능성
- 검색 순위 잠재력

5. 실행 가능한 인사이트
- 즉시 개선할 수 있는 항목
- 중장기 개선 사항
- 우선순위별 정리

JSON 형식으로 응답해주세요.
`;

// 제목 생성 프롬프트
export const titleGenerationPrompt = `
블로그 콘텐츠에 최적화된 제목을 생성합니다.

[콘텐츠 요약]
{contentSummary}

[주요 키워드]
{keywords}

[플랫폼]
{platform}

[제목 생성 원칙]
1. 호기심 유발
2. 핵심 가치 명시
3. 키워드 자연스럽게 포함
4. 60자 이내
5. 감정적 트리거 포함

다음 유형별로 각 3개씩 제안:
1. 질문형
2. 숫자형 (리스트)
3. How-to형
4. 비교형
5. 감정형

JSON 배열로 응답:
[
  { "type": "질문형", "title": "...", "score": 0-100 },
  ...
]
`;

// 메타 설명 생성 프롬프트
export const metaDescriptionPrompt = `
SEO에 최적화된 메타 설명을 생성합니다.

[콘텐츠 요약]
{contentSummary}

[주요 키워드]
{keywords}

[메타 설명 원칙]
1. 150-160자 사이
2. 핵심 키워드 포함
3. 행동 유도 문구 포함
4. 가치 제안 명시
5. 클릭 유도

3가지 버전 제안:
1. 정보 강조형
2. 감정 호소형
3. 질문 유도형

JSON 형식으로 응답:
[
  { "type": "정보 강조형", "description": "...", "charCount": 0 },
  ...
]
`;

// 해시태그 생성 프롬프트
export const hashtagPrompt = `
블로그 콘텐츠에 적합한 해시태그를 생성합니다.

[콘텐츠 주제]
{topic}

[카테고리]
{category}

[플랫폼]
{platform}

[해시태그 생성 원칙]
1. 트렌드 반영
2. 관련성 높은 것 우선
3. 일반 + 구체적 태그 조합
4. 플랫폼별 최적화

다음 카테고리별로 제안:
1. 핵심 태그 (5개)
2. 관련 태그 (5개)
3. 트렌드 태그 (5개)
4. 롱테일 태그 (5개)

JSON 형식으로 응답:
{
  "core": [...],
  "related": [...],
  "trending": [...],
  "longtail": [...]
}
`;

export default {
  masterWritingPrompt,
  humanizePrompt,
  imagePromptGenerator,
  researchPrompt,
  outlinePrompt,
  seoOptimizationPrompt,
  crossValidationPrompt,
  contentAnalysisPrompt,
  titleGenerationPrompt,
  metaDescriptionPrompt,
  hashtagPrompt,
  getTonePrompt,
  getHookExamples,
  getTargetWordCount,
  generateBloggerStylePrompt,
};
