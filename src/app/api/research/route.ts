import { NextRequest, NextResponse } from 'next/server';
import { researchPrompt } from '@/lib/prompts/writing-prompts';

// ============================================================
// Research API Route
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, keywords, platform } = body;

    if (!topic) {
      return NextResponse.json(
        { error: '주제를 입력해주세요.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return mock data for development
      return NextResponse.json({
        results: generateMockResearchResults(topic),
        keywords: generateMockKeywords(topic),
        sources: [],
      });
    }

    // Use OpenAI for research
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: researchPrompt,
          },
          {
            role: 'user',
            content: `주제: ${topic}\n키워드: ${keywords?.join(', ') || ''}\n플랫폼: ${platform || 'general'}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('API 요청 실패');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse the response
    const researchData = parseResearchResponse(content, topic);

    return NextResponse.json(researchData);
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: '리서치 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function parseResearchResponse(content: string, topic: string) {
  try {
    // Try to parse as JSON first
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(content);
  } catch {
    // Return structured mock data based on the response
    return {
      results: [
        {
          type: 'article',
          title: `${topic}에 대한 최신 동향`,
          summary: content.slice(0, 200),
          content: content,
          keyPoints: extractKeyPoints(content),
          quotes: [],
          source: '',
          relevanceScore: 0.85,
        },
      ],
      keywords: extractKeywords(content),
      sources: [],
    };
  }
}

function extractKeyPoints(content: string): string[] {
  const points: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
      points.push(line.replace(/^[-•*\d.]\s*/, '').trim());
    }
  }

  return points.slice(0, 5);
}

function extractKeywords(content: string): string[] {
  // Simple keyword extraction
  const words = content.toLowerCase().match(/[가-힣a-z]{2,}/g) || [];
  const frequency: Record<string, number> = {};

  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function generateMockResearchResults(topic: string) {
  return [
    {
      type: 'article',
      title: `${topic}의 현재 트렌드와 미래 전망`,
      summary: `${topic}에 대한 종합적인 분석과 최신 동향을 정리했습니다.`,
      content: `${topic}은 현재 많은 관심을 받고 있는 주제입니다. 최근 연구에 따르면 이 분야는 지속적으로 성장하고 있으며, 다양한 측면에서 주목받고 있습니다.`,
      keyPoints: [
        `${topic}의 핵심 개념 이해`,
        '최신 동향 및 트렌드 분석',
        '실용적인 활용 방법',
        '전문가 의견 및 전망',
      ],
      quotes: [
        `"${topic}은 앞으로 더욱 중요해질 것입니다."`,
      ],
      source: '',
      relevanceScore: 0.9,
    },
    {
      type: 'statistics',
      title: `${topic} 관련 주요 통계`,
      summary: '관련 분야의 최신 통계 데이터입니다.',
      content: '시장 조사에 따르면 해당 분야는 연평균 15% 성장하고 있습니다.',
      keyPoints: ['성장률 15%', '시장 규모 확대', '사용자 증가'],
      quotes: [],
      source: '',
      relevanceScore: 0.85,
    },
  ];
}

function generateMockKeywords(topic: string): string[] {
  return [
    topic,
    `${topic} 방법`,
    `${topic} 추천`,
    `${topic} 비교`,
    `${topic} 후기`,
    `${topic} 2024`,
    `${topic} 초보`,
    `${topic} 팁`,
  ];
}
