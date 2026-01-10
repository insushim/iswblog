// ============================================================
// AI 주제 자동 생성기
// 트렌드와 카테고리를 기반으로 주제를 자동 선정
// ============================================================

import { callGemini } from '@/lib/gemini';
import type { TopicSuggestion } from './types';

// 주제 카테고리 및 키워드
const TOPIC_CATEGORIES = {
  tech: {
    name: '기술/IT',
    keywords: ['AI', '프로그래밍', '앱', '소프트웨어', '클라우드', '보안', '데이터', '자동화'],
    subTopics: ['ChatGPT 활용법', 'AI 도구 추천', '코딩 팁', '개발 트렌드', '테크 뉴스'],
  },
  lifestyle: {
    name: '라이프스타일',
    keywords: ['일상', '취미', '자기계발', '생산성', '미니멀리즘', '힐링'],
    subTopics: ['아침 루틴', '독서 습관', '시간 관리', '스트레스 해소', '취미 추천'],
  },
  health: {
    name: '건강/운동',
    keywords: ['운동', '다이어트', '영양', '멘탈', '수면', '웰빙'],
    subTopics: ['홈트레이닝', '건강 식단', '다이어트 팁', '스트레칭', '수면 개선'],
  },
  finance: {
    name: '재테크/경제',
    keywords: ['투자', '저축', '부업', '재테크', '경제', '주식', '부동산'],
    subTopics: ['월급 관리', '투자 입문', '부업 아이디어', '절약 팁', '경제 트렌드'],
  },
  food: {
    name: '음식/요리',
    keywords: ['레시피', '맛집', '요리', '베이킹', '카페', '음식 리뷰'],
    subTopics: ['간단 레시피', '자취 요리', '건강 식단', '디저트 만들기', '맛집 탐방'],
  },
  travel: {
    name: '여행/문화',
    keywords: ['여행', '국내여행', '해외여행', '문화', '축제', '관광'],
    subTopics: ['여행 코스', '숨은 명소', '여행 준비물', '문화 체험', '포토스팟'],
  },
  beauty: {
    name: '뷰티/패션',
    keywords: ['화장품', '스킨케어', '메이크업', '패션', '스타일', '트렌드'],
    subTopics: ['스킨케어 루틴', '메이크업 팁', '패션 코디', '뷰티템 추천', '시즌 트렌드'],
  },
  education: {
    name: '교육/학습',
    keywords: ['공부', '영어', '자격증', '학습법', '온라인강의', '스터디'],
    subTopics: ['공부법 추천', '영어 학습', '자격증 준비', '집중력 향상', '온라인 강의 리뷰'],
  },
};

// 현재 시즌/트렌드 키워드
function getSeasonalKeywords(): string[] {
  const month = new Date().getMonth() + 1;
  const seasonKeywords: Record<number, string[]> = {
    1: ['새해 목표', '겨울 여행', '신년 계획', '다이어트'],
    2: ['발렌타인', '봄 준비', '취업 시즌'],
    3: ['벚꽃', '봄 패션', '입학', '졸업'],
    4: ['봄나들이', '황사', '피크닉'],
    5: ['가정의 달', '어버이날', '초여름'],
    6: ['장마', '여름 준비', '휴가 계획'],
    7: ['여름 휴가', '물놀이', '더위 극복'],
    8: ['휴가', '워케이션', '여름 끝자락'],
    9: ['가을', '추석', '새 학기'],
    10: ['가을 여행', '단풍', '할로윈'],
    11: ['수능', '블랙프라이데이', '초겨울'],
    12: ['크리스마스', '연말', '송년회', '새해 준비'],
  };
  return seasonKeywords[month] || [];
}

// 랜덤 카테고리 선택
function getRandomCategory(): keyof typeof TOPIC_CATEGORIES {
  const categories = Object.keys(TOPIC_CATEGORIES) as (keyof typeof TOPIC_CATEGORIES)[];
  return categories[Math.floor(Math.random() * categories.length)];
}

// 현재 연도
const CURRENT_YEAR = new Date().getFullYear();

// AI를 사용해 주제 생성
export async function generateTopicSuggestion(
  preferredCategories?: string[]
): Promise<TopicSuggestion> {
  const categoryKey = preferredCategories?.length
    ? (preferredCategories[Math.floor(Math.random() * preferredCategories.length)] as keyof typeof TOPIC_CATEGORIES)
    : getRandomCategory();

  const category = TOPIC_CATEGORIES[categoryKey] || TOPIC_CATEGORIES.lifestyle;
  const seasonalKeywords = getSeasonalKeywords();

  const prompt = `당신은 한국 블로그 트렌드 전문가입니다.
다음 정보를 바탕으로 지금 작성하면 좋을 블로그 주제를 하나 제안해주세요.

**중요: 현재 연도는 ${CURRENT_YEAR}년입니다. 연도를 언급할 때 반드시 ${CURRENT_YEAR}년을 사용하세요.**

카테고리: ${category.name}
관련 키워드: ${category.keywords.join(', ')}
시즌 키워드: ${seasonalKeywords.join(', ')}
참고 주제: ${category.subTopics.join(', ')}

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "topic": "구체적인 주제 (예: ${CURRENT_YEAR}년 최신 AI 글쓰기 도구 비교)",
  "title": "SEO 최적화된 블로그 제목",
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "trendScore": 85
}

조건:
- 주제는 독자에게 실질적인 가치를 제공해야 함
- 제목은 클릭을 유도하면서도 내용을 정확히 반영해야 함
- 키워드는 검색에 최적화되어야 함
- trendScore는 50-100 사이의 예상 트렌드 점수`;

  try {
    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        topic: parsed.topic,
        title: parsed.title,
        category: category.name,
        keywords: parsed.keywords || [],
        trendScore: parsed.trendScore || 75,
      };
    }
  } catch (error) {
    console.error('Topic generation error:', error);
  }

  // 폴백: 미리 정의된 주제 사용
  const subTopic = category.subTopics[Math.floor(Math.random() * category.subTopics.length)];
  const seasonal = seasonalKeywords[0] || '';

  return {
    topic: seasonal ? `${seasonal} ${subTopic}` : subTopic,
    title: `${seasonal ? `[${seasonal}] ` : ''}${subTopic} 완벽 가이드`,
    category: category.name,
    keywords: [...category.keywords.slice(0, 3), ...seasonalKeywords.slice(0, 2)],
    trendScore: 70,
  };
}

// 여러 주제 생성
export async function generateMultipleTopics(count: number = 5): Promise<TopicSuggestion[]> {
  const topics: TopicSuggestion[] = [];
  const categories = Object.keys(TOPIC_CATEGORIES);

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const topic = await generateTopicSuggestion([category]);
    topics.push(topic);
  }

  return topics;
}

export { TOPIC_CATEGORIES, getSeasonalKeywords };
