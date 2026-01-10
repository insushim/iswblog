import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Trends API Route - 실시간 웹 검색 기반 트렌드 추천
// ============================================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-2.0-flash';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const refresh = searchParams.get('refresh') === 'true';

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // API 키 없으면 목업 데이터 반환
      const trends = generateFallbackTrends(category);
      const suggestions = generateFallbackSuggestions(category);
      return NextResponse.json({
        trends,
        suggestions,
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
      });
    }

    // 실시간 웹 검색으로 트렌드 가져오기
    const result = await fetchLiveTrends(apiKey, category);

    return NextResponse.json({
      ...result,
      lastUpdated: new Date().toISOString(),
      source: 'live',
    });
  } catch (error) {
    console.error('Trends API error:', error);
    // 에러 시 폴백 데이터 반환
    const category = new URL(request.url).searchParams.get('category') || '';
    return NextResponse.json({
      trends: generateFallbackTrends(category),
      suggestions: generateFallbackSuggestions(category),
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
    });
  }
}

async function fetchLiveTrends(apiKey: string, category: string) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월`;

  const categoryPrompt = category ? `특히 "${category}" 분야에 집중해서` : '';

  const prompt = `당신은 한국 블로그 트렌드 분석 전문가입니다.
${dateStr} 현재 네이버 블로그, 티스토리에서 인기 있는 블로그 주제를 분석해주세요.
${categoryPrompt}

실제로 사람들이 많이 검색하고 관심 가지는 주제를 추천해주세요.
최신 트렌드, 시즌 이슈, 사회적 관심사를 반영해주세요.

반드시 아래 JSON 형식으로만 응답해주세요:
{
  "trends": [
    {
      "keyword": "트렌드 키워드",
      "category": "카테고리",
      "volume": 예상 월간 검색량(숫자),
      "trend": "rising" 또는 "stable" 또는 "falling",
      "score": 추천점수(0-100),
      "description": "간단한 설명",
      "relatedKeywords": ["관련키워드1", "관련키워드2"]
    }
  ],
  "suggestions": [
    {
      "topic": "주제",
      "title": "추천 블로그 제목 (클릭을 유발하는)",
      "score": 추천점수(0-100),
      "reasoning": "이 주제를 추천하는 이유 (2-3문장)",
      "trendData": {
        "currentVolume": 예상검색량,
        "growthRate": 성장률(숫자),
        "competitionLevel": "low" 또는 "medium" 또는 "high",
        "bestPostingTime": "추천 포스팅 시간"
      },
      "relatedKeywords": ["키워드1", "키워드2", "키워드3"],
      "targetAudience": "타겟 독자층"
    }
  ]
}

trends는 8-10개, suggestions는 5-6개를 제공해주세요.
${dateStr} 기준 실제 인기 있는 주제로 작성해주세요.`;

  try {
    const response = await fetch(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
          tools: [{ google_search: {} }],
        }),
      }
    );

    if (!response.ok) {
      // Google Search 실패 시 일반 요청
      return await fetchTrendsWithoutSearch(apiKey, category, dateStr);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts
      ?.filter((p: { text?: string }) => p.text)
      ?.map((p: { text: string }) => p.text)
      ?.join('') || '';

    return parseTrendsResponse(text, category);
  } catch (error) {
    console.error('Live trends fetch error:', error);
    return await fetchTrendsWithoutSearch(apiKey, category, dateStr);
  }
}

async function fetchTrendsWithoutSearch(apiKey: string, category: string, dateStr: string) {
  const categoryPrompt = category ? `"${category}" 분야의` : '';

  const prompt = `${dateStr} 현재 한국에서 인기 있는 ${categoryPrompt} 블로그 주제를 추천해주세요.

반드시 JSON 형식으로 응답:
{
  "trends": [
    {"keyword": "키워드", "category": "카테고리", "volume": 숫자, "trend": "rising/stable/falling", "score": 0-100, "description": "설명", "relatedKeywords": ["관련1", "관련2"]}
  ],
  "suggestions": [
    {"topic": "주제", "title": "블로그 제목", "score": 0-100, "reasoning": "추천 이유", "trendData": {"currentVolume": 숫자, "growthRate": 숫자, "competitionLevel": "low/medium/high", "bestPostingTime": "시간"}, "relatedKeywords": ["키워드"], "targetAudience": "타겟"}
  ]
}

trends 8개, suggestions 5개 제공. 실제 인기 주제로 작성.`;

  const response = await fetch(
    `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return parseTrendsResponse(text, category);
}

function parseTrendsResponse(content: string, category: string) {
  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return {
        trends: parsed.trends || generateFallbackTrends(category),
        suggestions: parsed.suggestions || generateFallbackSuggestions(category),
      };
    }
    throw new Error('JSON not found');
  } catch {
    return {
      trends: generateFallbackTrends(category),
      suggestions: generateFallbackSuggestions(category),
    };
  }
}

function generateFallbackTrends(category: string) {
  const allTrends = [
    { keyword: 'AI 활용법', category: '테크', volume: 125000, trend: 'rising' as const, score: 95, description: 'AI 도구 실전 활용 가이드', relatedKeywords: ['ChatGPT', 'Claude', 'AI 글쓰기'] },
    { keyword: '2025 트렌드', category: '라이프', volume: 98000, trend: 'rising' as const, score: 92, description: '올해 주목할 트렌드', relatedKeywords: ['신년', '목표', '계획'] },
    { keyword: '다이어트 식단', category: '건강', volume: 85000, trend: 'stable' as const, score: 88, description: '건강한 다이어트 방법', relatedKeywords: ['식단관리', '헬스', '단백질'] },
    { keyword: '재테크 초보', category: '재테크', volume: 76000, trend: 'rising' as const, score: 85, description: '투자 입문 가이드', relatedKeywords: ['주식', 'ETF', '적금'] },
    { keyword: '국내여행 추천', category: '여행', volume: 68000, trend: 'stable' as const, score: 82, description: '숨은 국내 명소', relatedKeywords: ['당일치기', '주말여행', '맛집'] },
    { keyword: '부업 아이디어', category: '재테크', volume: 62000, trend: 'rising' as const, score: 80, description: '직장인 부수입 방법', relatedKeywords: ['투잡', 'N잡', '프리랜서'] },
    { keyword: '홈카페 레시피', category: '라이프', volume: 58000, trend: 'stable' as const, score: 75, description: '집에서 즐기는 카페 음료', relatedKeywords: ['커피', '라떼', '디저트'] },
    { keyword: '자기계발 도서', category: '자기계발', volume: 52000, trend: 'stable' as const, score: 72, description: '추천 도서 리뷰', relatedKeywords: ['독서', '습관', '성장'] },
  ];

  if (category) {
    return allTrends.filter(t => t.category === category || t.keyword.includes(category));
  }
  return allTrends;
}

function generateFallbackSuggestions(category: string) {
  const suggestions = [
    {
      topic: 'AI 글쓰기',
      title: 'ChatGPT로 블로그 글 10배 빠르게 쓰는 법 (2025 최신)',
      score: 95,
      reasoning: 'AI 도구를 활용하여 효율적으로 블로그 콘텐츠를 작성하는 방법입니다. 검색량이 급상승 중이며 경쟁이 낮아 상위 노출 가능성이 높습니다.',
      trendData: { currentVolume: 15000, growthRate: 45, competitionLevel: 'low' as const, bestPostingTime: '오전 9시' },
      relatedKeywords: ['AI 글쓰기', 'ChatGPT', '블로그 자동화'],
      targetAudience: '블로그 운영자, 콘텐츠 크리에이터',
    },
    {
      topic: '건강 관리',
      title: '직장인 5분 스트레칭: 목·어깨 통증 완화 루틴',
      score: 88,
      reasoning: '사무실에서 간단히 할 수 있는 스트레칭으로 근골격계 질환을 예방합니다. 직장인 검색 비율이 높은 주제입니다.',
      trendData: { currentVolume: 12000, growthRate: 25, competitionLevel: 'medium' as const, bestPostingTime: '오전 8시' },
      relatedKeywords: ['스트레칭', '목통증', '거북목', '사무실운동'],
      targetAudience: '직장인, 재택근무자',
    },
    {
      topic: '부업',
      title: '2025년 현실적인 부업 TOP 5 (월 50만원 이상)',
      score: 92,
      reasoning: '경기 불황으로 부업에 대한 관심이 높아지고 있습니다. 실제 수익 후기를 포함하면 신뢰도가 높아집니다.',
      trendData: { currentVolume: 18000, growthRate: 35, competitionLevel: 'high' as const, bestPostingTime: '저녁 8시' },
      relatedKeywords: ['부업', '부수입', '직장인부업', 'N잡'],
      targetAudience: '직장인, 주부, 대학생',
    },
    {
      topic: '다이어트',
      title: '단백질 위주 식단으로 한 달 -5kg: 실제 식단 공개',
      score: 85,
      reasoning: '새해 다이어트 시즌에 맞춘 주제입니다. 실제 경험과 구체적인 식단을 공유하면 공감을 얻습니다.',
      trendData: { currentVolume: 20000, growthRate: 20, competitionLevel: 'high' as const, bestPostingTime: '오전 7시' },
      relatedKeywords: ['다이어트', '식단', '단백질', '헬스'],
      targetAudience: '다이어트 관심자, 2030 여성',
    },
    {
      topic: '여행',
      title: '서울 근교 당일치기 여행지 BEST 7 (대중교통 가능)',
      score: 82,
      reasoning: '주말 여행 계획을 세우는 사람들이 많이 검색합니다. 대중교통 접근성을 강조하면 차별화됩니다.',
      trendData: { currentVolume: 16000, growthRate: 15, competitionLevel: 'medium' as const, bestPostingTime: '목요일 저녁' },
      relatedKeywords: ['당일치기', '서울근교', '주말여행', '데이트'],
      targetAudience: '2030 직장인, 커플',
    },
  ];

  if (category) {
    const filtered = suggestions.filter(s =>
      s.topic.includes(category) || s.relatedKeywords.some(k => k.includes(category))
    );
    return filtered.length > 0 ? filtered : suggestions.slice(0, 3);
  }
  return suggestions;
}
