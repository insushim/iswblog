// ============================================================
// 주제 중복 방지 시스템
// 최근 작성된 주제와 겹치지 않도록 관리
// ============================================================

import { callGemini } from '@/lib/gemini';

// 최근 주제 저장소 (메모리 기반 - 서버리스 환경)
// 실제 운영에서는 DB 사용 권장
const recentTopicsStore: {
  topics: Array<{
    topic: string;
    category: string;
    keywords: string[];
    timestamp: number;
  }>;
  maxSize: number;
} = {
  topics: [],
  maxSize: 100, // 최대 100개 저장
};

// 주제 추가
export function addRecentTopic(
  topic: string,
  category: string,
  keywords: string[]
): void {
  recentTopicsStore.topics.unshift({
    topic,
    category,
    keywords,
    timestamp: Date.now(),
  });

  // 최대 크기 초과 시 오래된 것 제거
  if (recentTopicsStore.topics.length > recentTopicsStore.maxSize) {
    recentTopicsStore.topics = recentTopicsStore.topics.slice(0, recentTopicsStore.maxSize);
  }
}

// 최근 주제 목록 가져오기
export function getRecentTopics(
  category?: string,
  limit: number = 20
): string[] {
  let topics = recentTopicsStore.topics;

  if (category) {
    topics = topics.filter(t => t.category === category);
  }

  return topics.slice(0, limit).map(t => t.topic);
}

// 주제 유사도 체크 (AI 기반)
export async function checkTopicSimilarity(
  newTopic: string,
  existingTopics: string[]
): Promise<{
  isDuplicate: boolean;
  similarTopic?: string;
  similarityScore: number;
}> {
  if (existingTopics.length === 0) {
    return { isDuplicate: false, similarityScore: 0 };
  }

  const prompt = `다음 주제가 기존 주제들과 얼마나 유사한지 평가해주세요.

## 새로운 주제
${newTopic}

## 기존 주제들
${existingTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## 평가 기준
- 동일한 내용을 다루는지
- 키워드가 크게 겹치는지
- 독자 입장에서 같은 정보를 얻을 수 있는지

## 응답 형식 (JSON만)
{
  "isDuplicate": true/false (70% 이상 유사하면 true),
  "mostSimilarTopic": "가장 유사한 기존 주제" (있다면),
  "similarityScore": 0-100 (유사도 점수)
}`;

  try {
    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isDuplicate: parsed.isDuplicate || false,
        similarTopic: parsed.mostSimilarTopic,
        similarityScore: parsed.similarityScore || 0,
      };
    }
  } catch (error) {
    console.error('Topic similarity check error:', error);
  }

  return { isDuplicate: false, similarityScore: 0 };
}

// 고유한 주제 생성 (중복 시 재생성)
export async function generateUniqueTopic(
  generateFn: () => Promise<{ topic: string; category: string; keywords: string[] }>,
  maxAttempts: number = 5
): Promise<{ topic: string; category: string; keywords: string[] }> {
  const existingTopics = getRecentTopics();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[주제 생성] 시도 ${attempt}/${maxAttempts}`);

    const generated = await generateFn();

    // 유사도 체크
    const similarity = await checkTopicSimilarity(generated.topic, existingTopics);

    if (!similarity.isDuplicate) {
      console.log(`[주제 생성] 고유 주제 확보: ${generated.topic}`);
      addRecentTopic(generated.topic, generated.category, generated.keywords);
      return generated;
    }

    console.log(
      `[주제 생성] 중복 감지 (${similarity.similarityScore}% 유사): ${similarity.similarTopic}`
    );

    // 다음 시도를 위해 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 최대 시도 후에도 고유 주제 못 찾으면 마지막 생성 결과 반환
  console.log('[주제 생성] 최대 시도 도달, 마지막 생성 결과 사용');
  const lastAttempt = await generateFn();
  addRecentTopic(lastAttempt.topic, lastAttempt.category, lastAttempt.keywords);
  return lastAttempt;
}

// 카테고리 로테이션 (다양한 카테고리 순환)
export function getNextCategory(
  categories: string[],
  recentCategories: string[]
): string {
  // 최근에 사용하지 않은 카테고리 우선
  const unusedCategories = categories.filter(
    c => !recentCategories.slice(0, 3).includes(c)
  );

  if (unusedCategories.length > 0) {
    return unusedCategories[Math.floor(Math.random() * unusedCategories.length)];
  }

  // 모두 사용했으면 랜덤
  return categories[Math.floor(Math.random() * categories.length)];
}

// 오래된 주제 정리 (24시간 이상)
export function cleanupOldTopics(maxAgeHours: number = 168): void {
  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
  recentTopicsStore.topics = recentTopicsStore.topics.filter(
    t => t.timestamp > cutoff
  );
}

// 주제 통계
export function getTopicStats(): {
  totalTopics: number;
  topicsByCategory: Record<string, number>;
  oldestTopic: string | null;
  newestTopic: string | null;
} {
  const topics = recentTopicsStore.topics;

  const byCategory: Record<string, number> = {};
  topics.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
  });

  return {
    totalTopics: topics.length,
    topicsByCategory: byCategory,
    oldestTopic: topics.length > 0 ? topics[topics.length - 1].topic : null,
    newestTopic: topics.length > 0 ? topics[0].topic : null,
  };
}
