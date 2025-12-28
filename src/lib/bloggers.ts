// ============================================================
// Blogger Data Loader and Utilities
// ============================================================

import type { BloggerProfile } from '@/types';
import koreanBloggersData from '@/../data/korean-power-bloggers.json';
import internationalBloggersData from '@/../data/international-bloggers.json';

// 한국 블로거 데이터
export const koreanBloggers: BloggerProfile[] = koreanBloggersData.koreanBloggers as BloggerProfile[];

// 해외 블로거 데이터
export const internationalBloggers: BloggerProfile[] = internationalBloggersData.internationalBloggers as BloggerProfile[];

// 모든 블로거 데이터
export const allBloggers: BloggerProfile[] = [...koreanBloggers, ...internationalBloggers];

/**
 * ID로 블로거 찾기
 */
export function getBloggerById(id: string): BloggerProfile | undefined {
  return allBloggers.find((blogger) => blogger.id === id);
}

/**
 * 여러 ID로 블로거 목록 가져오기
 */
export function getBloggersByIds(ids: string[]): BloggerProfile[] {
  return allBloggers.filter((blogger) => ids.includes(blogger.id));
}

/**
 * 카테고리별 블로거 필터링
 */
export function getBloggersByCategory(category: string): BloggerProfile[] {
  return allBloggers.filter(
    (blogger) => blogger.category.toLowerCase().includes(category.toLowerCase())
  );
}

/**
 * 플랫폼별 블로거 필터링
 */
export function getBloggersByPlatform(platform: string): BloggerProfile[] {
  return allBloggers.filter(
    (blogger) => blogger.platform.toLowerCase() === platform.toLowerCase()
  );
}

/**
 * 한국 블로거 중 카테고리로 필터링
 */
export function getKoreanBloggersByCategory(category: string): BloggerProfile[] {
  return koreanBloggers.filter(
    (blogger) => blogger.category.toLowerCase().includes(category.toLowerCase())
  );
}

/**
 * 해외 블로거 중 카테고리로 필터링
 */
export function getInternationalBloggersByCategory(category: string): BloggerProfile[] {
  return internationalBloggers.filter(
    (blogger) => blogger.category.toLowerCase().includes(category.toLowerCase())
  );
}

/**
 * 방문자 수 기준 상위 블로거
 */
export function getTopBloggersByVisitors(limit: number = 10): BloggerProfile[] {
  return [...allBloggers]
    .sort((a, b) => b.monthlyVisitors - a.monthlyVisitors)
    .slice(0, limit);
}

/**
 * 카테고리 목록 가져오기
 */
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  allBloggers.forEach((blogger) => {
    blogger.category.split('/').forEach((cat) => categories.add(cat.trim()));
  });
  return Array.from(categories).sort();
}

/**
 * 블로거 스타일 요약 생성
 */
export function getBloggerStyleSummary(blogger: BloggerProfile): string {
  const { characteristics, writingPatterns } = blogger;

  const toneDesc = characteristics.toneProfile.casual > 50
    ? '친근하고 캐주얼한'
    : '전문적이고 격식있는';

  const emojiDesc = {
    none: '이모지 사용 없음',
    minimal: '최소한의 이모지 사용',
    moderate: '적절한 이모지 사용',
    heavy: '활발한 이모지 사용',
  }[characteristics.emojiUsage];

  const hookDesc = {
    question: '질문으로 시작',
    statistic: '통계로 주목 끌기',
    story: '스토리텔링으로 시작',
    quote: '인용구 활용',
    'bold-statement': '강렬한 주장으로 시작',
    problem: '문제 제기로 시작',
    controversy: '논쟁적 화두로 시작',
    'curiosity-gap': '호기심 유발로 시작',
  }[characteristics.hookStyle];

  return `${toneDesc} 톤, ${emojiDesc}, ${hookDesc}하는 스타일. 평균 문장 ${characteristics.sentenceLength.average}자, 문단 ${characteristics.paragraphLength.average}문장.`;
}

/**
 * 블로거 비교 분석
 */
export function compareBloggers(bloggerIds: string[]): {
  similarities: string[];
  differences: string[];
  combined: string[];
} {
  const bloggers = getBloggersByIds(bloggerIds);

  if (bloggers.length < 2) {
    return { similarities: [], differences: [], combined: [] };
  }

  const similarities: string[] = [];
  const differences: string[] = [];
  const combined: string[] = [];

  // 톤 프로필 비교
  const tones = bloggers.map((b) => b.characteristics.toneProfile);
  const avgFormal = tones.reduce((sum, t) => sum + t.formal, 0) / tones.length;

  if (Math.max(...tones.map((t) => t.formal)) - Math.min(...tones.map((t) => t.formal)) < 20) {
    similarities.push(`톤이 비슷함 (평균 격식도 ${avgFormal.toFixed(0)}%)`);
  } else {
    differences.push('톤이 다양함 (격식체 혼합)');
    combined.push('다양한 톤을 상황에 맞게 활용');
  }

  // 문장 길이 비교
  const avgSentenceLength = bloggers.reduce(
    (sum, b) => sum + b.characteristics.sentenceLength.average,
    0
  ) / bloggers.length;
  combined.push(`평균 문장 길이 ${avgSentenceLength.toFixed(0)}자 권장`);

  // 특수 패턴 수집
  const allPatterns = new Set<string>();
  bloggers.forEach((b) => {
    b.characteristics.specialPatterns.forEach((p) => allPatterns.add(p));
  });
  combined.push(...Array.from(allPatterns).slice(0, 5));

  // 샘플 문구 수집
  const allPhrases = new Set<string>();
  bloggers.forEach((b) => {
    b.samplePhrases.slice(0, 3).forEach((p) => allPhrases.add(p));
  });

  return { similarities, differences, combined };
}

/**
 * 추천 블로거 조합 생성
 */
export function getRecommendedBloggerCombinations(category: string): {
  combination: BloggerProfile[];
  reason: string;
}[] {
  const recommendations: { combination: BloggerProfile[]; reason: string }[] = [];

  // 같은 카테고리의 한국 + 해외 블로거 조합
  const koreanMatch = koreanBloggers.find(
    (b) => b.category.toLowerCase().includes(category.toLowerCase())
  );
  const internationalMatch = internationalBloggers.find(
    (b) => b.category.toLowerCase().includes(category.toLowerCase())
  );

  if (koreanMatch && internationalMatch) {
    recommendations.push({
      combination: [koreanMatch, internationalMatch],
      reason: '한국 감성 + 글로벌 스타일 융합',
    });
  }

  // 다른 톤의 블로거 조합
  const casualBlogger = allBloggers.find(
    (b) => b.characteristics.toneProfile.casual > 70
  );
  const formalBlogger = allBloggers.find(
    (b) => b.characteristics.toneProfile.formal > 60
  );

  if (casualBlogger && formalBlogger) {
    recommendations.push({
      combination: [casualBlogger, formalBlogger],
      reason: '친근함 + 전문성의 균형',
    });
  }

  // 스토리텔링 + 데이터 기반 블로거 조합
  const storyBlogger = allBloggers.find(
    (b) => b.characteristics.hookStyle === 'story'
  );
  const dataBlogger = allBloggers.find(
    (b) => b.characteristics.hookStyle === 'statistic'
  );

  if (storyBlogger && dataBlogger) {
    recommendations.push({
      combination: [storyBlogger, dataBlogger],
      reason: '스토리텔링 + 데이터 기반 콘텐츠',
    });
  }

  return recommendations;
}

/**
 * 블로거 스타일을 프롬프트로 변환
 */
export function bloggerToPromptStyle(blogger: BloggerProfile): string {
  const { characteristics, writingPatterns, samplePhrases, avoidPatterns } = blogger;

  return `
[${blogger.name} 스타일 가이드]

문체:
- 톤: ${characteristics.toneProfile.casual}% 캐주얼, ${characteristics.toneProfile.formal}% 격식
- 평균 문장 길이: ${characteristics.sentenceLength.average}자
- 문단 길이: ${characteristics.paragraphLength.average}-${characteristics.paragraphLength.max}문장

구조:
- 도입부: ${writingPatterns.introduction.style} (${writingPatterns.introduction.length} 길이)
- 본문: ${writingPatterns.body.structure} 구조
- 결론: ${writingPatterns.conclusion.style}

특징적 패턴:
${characteristics.specialPatterns.map((p) => `- ${p}`).join('\n')}

자주 사용하는 표현:
${samplePhrases.map((p) => `- "${p}"`).join('\n')}

피해야 할 표현:
${avoidPatterns.map((p) => `- "${p}"`).join('\n')}

이모지 사용: ${characteristics.emojiUsage}
이미지 비율: ${(characteristics.imageRatio * 100).toFixed(0)}%
`;
}

/**
 * 여러 블로거 스타일 병합
 */
export function mergeBloggerStyles(bloggerIds: string[]): {
  toneProfile: { formal: number; casual: number };
  sentenceLength: number;
  paragraphLength: number;
  patterns: string[];
  phrases: string[];
  avoidPatterns: string[];
  emojiUsage: string;
} {
  const bloggers = getBloggersByIds(bloggerIds);

  if (bloggers.length === 0) {
    return {
      toneProfile: { formal: 50, casual: 50 },
      sentenceLength: 25,
      paragraphLength: 4,
      patterns: [],
      phrases: [],
      avoidPatterns: [],
      emojiUsage: 'moderate',
    };
  }

  const avgFormal = bloggers.reduce((sum, b) => sum + b.characteristics.toneProfile.formal, 0) / bloggers.length;
  const avgSentence = bloggers.reduce((sum, b) => sum + b.characteristics.sentenceLength.average, 0) / bloggers.length;
  const avgParagraph = bloggers.reduce((sum, b) => sum + b.characteristics.paragraphLength.average, 0) / bloggers.length;

  const allPatterns = new Set<string>();
  const allPhrases = new Set<string>();
  const allAvoid = new Set<string>();

  bloggers.forEach((b) => {
    b.characteristics.specialPatterns.forEach((p) => allPatterns.add(p));
    b.samplePhrases.forEach((p) => allPhrases.add(p));
    b.avoidPatterns.forEach((p) => allAvoid.add(p));
  });

  // 이모지 사용 결정 (다수결)
  const emojiCounts: Record<string, number> = {};
  bloggers.forEach((b) => {
    const usage = b.characteristics.emojiUsage;
    emojiCounts[usage] = (emojiCounts[usage] || 0) + 1;
  });
  const emojiUsage = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1])[0][0];

  return {
    toneProfile: { formal: Math.round(avgFormal), casual: Math.round(100 - avgFormal) },
    sentenceLength: Math.round(avgSentence),
    paragraphLength: Math.round(avgParagraph),
    patterns: Array.from(allPatterns),
    phrases: Array.from(allPhrases),
    avoidPatterns: Array.from(allAvoid),
    emojiUsage,
  };
}

export default {
  koreanBloggers,
  internationalBloggers,
  allBloggers,
  getBloggerById,
  getBloggersByIds,
  getBloggersByCategory,
  getBloggersByPlatform,
  getKoreanBloggersByCategory,
  getInternationalBloggersByCategory,
  getTopBloggersByVisitors,
  getAllCategories,
  getBloggerStyleSummary,
  compareBloggers,
  getRecommendedBloggerCombinations,
  bloggerToPromptStyle,
  mergeBloggerStyles,
};
