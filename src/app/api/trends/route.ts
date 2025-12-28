import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Trends API Route
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const platform = searchParams.get('platform') || 'naver';

    // Return mock trends data
    const trends = generateMockTrends(category, platform);
    const suggestions = generateMockSuggestions(category);

    return NextResponse.json({
      trends,
      suggestions,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json(
      { error: '트렌드 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function generateMockTrends(category: string | null, platform: string) {
  const allTrends = [
    {
      keyword: 'AI 글쓰기',
      category: '테크',
      volume: 125000,
      trend: 'rising' as const,
      score: 95,
      description: 'AI를 활용한 콘텐츠 작성 트렌드',
      relatedKeywords: ['ChatGPT', 'AI 블로그', '자동 글쓰기', 'GPT-4'],
    },
    {
      keyword: '챗GPT 활용법',
      category: '테크',
      volume: 98000,
      trend: 'rising' as const,
      score: 92,
      description: 'ChatGPT 실전 활용 가이드',
      relatedKeywords: ['프롬프트', 'AI 도구', '생산성'],
    },
    {
      keyword: '2024 건강 트렌드',
      category: '건강',
      volume: 85000,
      trend: 'stable' as const,
      score: 88,
      description: '올해 주목받는 건강 관리법',
      relatedKeywords: ['다이어트', '운동', '영양제', '수면'],
    },
    {
      keyword: '부업 추천',
      category: '재테크',
      volume: 76000,
      trend: 'rising' as const,
      score: 85,
      description: '직장인 부업 아이디어',
      relatedKeywords: ['투잡', '프리랜서', '스마트스토어', '쿠팡파트너스'],
    },
    {
      keyword: '여행지 추천',
      category: '여행',
      volume: 68000,
      trend: 'stable' as const,
      score: 82,
      description: '국내외 인기 여행지',
      relatedKeywords: ['국내여행', '해외여행', '호캉스', '맛집'],
    },
    {
      keyword: '주식 투자 전략',
      category: '재테크',
      volume: 62000,
      trend: 'falling' as const,
      score: 78,
      description: '주식 시장 분석과 투자 팁',
      relatedKeywords: ['ETF', '배당주', '미국주식', '코스피'],
    },
    {
      keyword: '맛집 탐방',
      category: '라이프',
      volume: 58000,
      trend: 'stable' as const,
      score: 75,
      description: '전국 맛집 정보',
      relatedKeywords: ['서울맛집', '카페', '브런치', '디저트'],
    },
    {
      keyword: '인테리어 팁',
      category: '라이프',
      volume: 52000,
      trend: 'rising' as const,
      score: 72,
      description: '홈 인테리어 아이디어',
      relatedKeywords: ['셀프인테리어', '가구', '수납', '조명'],
    },
    {
      keyword: '육아 정보',
      category: '가족',
      volume: 48000,
      trend: 'stable' as const,
      score: 70,
      description: '육아 팁과 정보',
      relatedKeywords: ['신생아', '유아식', '놀이', '교육'],
    },
    {
      keyword: '자기계발 도서',
      category: '자기계발',
      volume: 45000,
      trend: 'stable' as const,
      score: 68,
      description: '추천 도서와 독서법',
      relatedKeywords: ['습관', '시간관리', '독서', '공부법'],
    },
    {
      keyword: '코딩 독학',
      category: '테크',
      volume: 42000,
      trend: 'rising' as const,
      score: 65,
      description: '프로그래밍 입문 가이드',
      relatedKeywords: ['파이썬', '자바스크립트', '웹개발', '국비지원'],
    },
    {
      keyword: '캠핑 장비',
      category: '여행',
      volume: 38000,
      trend: 'falling' as const,
      score: 62,
      description: '캠핑 필수 용품 추천',
      relatedKeywords: ['텐트', '차박', '글램핑', '캠핑요리'],
    },
  ];

  // Filter by category if specified
  let filteredTrends = allTrends;
  if (category) {
    filteredTrends = allTrends.filter(t => t.category === category);
  }

  return filteredTrends.sort((a, b) => b.volume - a.volume);
}

function generateMockSuggestions(category: string | null) {
  const suggestions = [
    {
      topic: 'AI 글쓰기',
      title: 'AI로 블로그 글 쓰는 법: 초보자를 위한 완벽 가이드',
      score: 95,
      reasoning: 'AI 도구를 활용하여 효율적으로 블로그 콘텐츠를 작성하는 방법을 알아봅니다.',
      trendData: {
        currentVolume: 15000,
        growthRate: 45,
        competitionLevel: 'low' as const,
        bestPostingTime: '오전 9시',
      },
      relatedKeywords: ['AI 글쓰기', 'ChatGPT', '블로그 작성'],
      suggestedAngles: ['초보자 가이드', '실전 활용법'],
      estimatedTraffic: { daily: 500, weekly: 3500, monthly: 15000 },
      contentGap: 'AI 글쓰기 도구 비교 분석',
      targetAudience: '블로그 운영자, 콘텐츠 크리에이터',
    },
    {
      topic: '건강 관리',
      title: '직장인을 위한 5분 스트레칭: 목, 어깨, 허리 통증 완화',
      score: 88,
      reasoning: '사무실에서 간단히 할 수 있는 스트레칭으로 근골격계 질환을 예방하세요.',
      trendData: {
        currentVolume: 12000,
        growthRate: 25,
        competitionLevel: 'medium' as const,
        bestPostingTime: '오전 8시',
      },
      relatedKeywords: ['스트레칭', '목통증', '허리통증', '사무실운동'],
      suggestedAngles: ['5분 루틴', '영상 가이드'],
      estimatedTraffic: { daily: 400, weekly: 2800, monthly: 12000 },
      contentGap: '자세별 맞춤 스트레칭',
      targetAudience: '직장인, 재택근무자',
    },
    {
      topic: '부업',
      title: '월 100만원 부수입 만들기: 현실적인 부업 5가지',
      score: 92,
      reasoning: '직장을 다니면서도 할 수 있는 검증된 부업 아이디어를 소개합니다.',
      trendData: {
        currentVolume: 18000,
        growthRate: 35,
        competitionLevel: 'high' as const,
        bestPostingTime: '저녁 8시',
      },
      relatedKeywords: ['부업', '부수입', '직장인부업', '투잡'],
      suggestedAngles: ['실제 수익 공개', '시작 방법'],
      estimatedTraffic: { daily: 600, weekly: 4200, monthly: 18000 },
      contentGap: '시간대별 부업 추천',
      targetAudience: '직장인, 주부',
    },
    {
      topic: '여행',
      title: '제주도 3박4일 일정 완벽 가이드: 숨은 명소까지',
      score: 85,
      reasoning: '제주도 여행 코스, 맛집, 숙소까지 모든 것을 정리했습니다.',
      trendData: {
        currentVolume: 25000,
        growthRate: 15,
        competitionLevel: 'high' as const,
        bestPostingTime: '주말 오전',
      },
      relatedKeywords: ['제주도여행', '제주맛집', '제주숙소', '제주일정'],
      suggestedAngles: ['비용 절약 팁', '현지인 추천'],
      estimatedTraffic: { daily: 800, weekly: 5600, monthly: 25000 },
      contentGap: '계절별 제주도 코스',
      targetAudience: '국내 여행객, 커플',
    },
    {
      topic: '자기계발',
      title: '아침 루틴으로 인생 바꾸기: 성공한 사람들의 습관',
      score: 80,
      reasoning: '하루를 성공적으로 시작하는 아침 루틴의 비밀을 공개합니다.',
      trendData: {
        currentVolume: 14000,
        growthRate: 20,
        competitionLevel: 'medium' as const,
        bestPostingTime: '오전 6시',
      },
      relatedKeywords: ['아침루틴', '습관', '자기계발', '미라클모닝'],
      suggestedAngles: ['30일 챌린지', '유명인 루틴'],
      estimatedTraffic: { daily: 450, weekly: 3150, monthly: 14000 },
      contentGap: '직업별 아침 루틴',
      targetAudience: '자기계발에 관심 있는 2030',
    },
    {
      topic: '재테크',
      title: '2024 ETF 투자 완벽 가이드: 초보자도 쉽게',
      score: 78,
      reasoning: 'ETF의 기초부터 포트폴리오 구성까지 상세히 알아봅니다.',
      trendData: {
        currentVolume: 20000,
        growthRate: 30,
        competitionLevel: 'high' as const,
        bestPostingTime: '오전 10시',
      },
      relatedKeywords: ['ETF', '투자', 'S&P500', '인덱스펀드'],
      suggestedAngles: ['초보자 가이드', '추천 ETF'],
      estimatedTraffic: { daily: 650, weekly: 4550, monthly: 20000 },
      contentGap: '소액 투자 전략',
      targetAudience: '투자 초보자, 직장인',
    },
  ];

  if (category) {
    const categoryMapping: Record<string, string[]> = {
      '테크': ['AI 글쓰기'],
      '건강': ['건강 관리'],
      '재테크': ['부업', '재테크'],
      '여행': ['여행'],
      '자기계발': ['자기계발'],
    };

    const matchingTopics = categoryMapping[category] || [];
    return suggestions.filter(s => matchingTopics.includes(s.topic));
  }

  return suggestions;
}
