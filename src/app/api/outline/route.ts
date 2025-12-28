import { NextRequest, NextResponse } from 'next/server';
import { outlinePrompt } from '@/lib/prompts/writing-prompts';

// ============================================================
// Outline API Route
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, title, tone, length, keywords, platform, bloggerStyles } = body;

    if (!topic || !title) {
      return NextResponse.json(
        { error: '주제와 제목을 입력해주세요.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return mock outline for development
      return NextResponse.json(generateMockOutline(topic, title, length));
    }

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
            content: outlinePrompt,
          },
          {
            role: 'user',
            content: JSON.stringify({
              topic,
              title,
              tone,
              length,
              keywords,
              platform,
              bloggerStyles,
            }),
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

    const outline = parseOutlineResponse(content, topic, title);

    return NextResponse.json(outline);
  } catch (error) {
    console.error('Outline API error:', error);
    return NextResponse.json(
      { error: '아웃라인 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function parseOutlineResponse(content: string, topic: string, title: string) {
  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(content);
  } catch {
    // Parse sections from text
    const sections = [];
    const lines = content.split('\n');
    let currentSection: { title: string; keyPoints: string[]; level: number } | null = null;

    for (const line of lines) {
      const h2Match = line.match(/^##\s+(.+)/);
      const h3Match = line.match(/^###\s+(.+)/);
      const bulletMatch = line.match(/^[-*]\s+(.+)/);

      if (h2Match) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: h2Match[1],
          keyPoints: [],
          level: 2,
        };
      } else if (h3Match && currentSection) {
        sections.push(currentSection);
        currentSection = {
          title: h3Match[1],
          keyPoints: [],
          level: 3,
        };
      } else if (bulletMatch && currentSection) {
        currentSection.keyPoints.push(bulletMatch[1]);
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return {
      topic,
      title,
      sections: sections.map((s, i) => ({
        id: `section-${i + 1}`,
        title: s.title,
        level: s.level,
        keyPoints: s.keyPoints,
        estimatedLength: 500,
        order: i,
      })),
      estimatedTotalLength: sections.length * 500,
    };
  }
}

function generateMockOutline(topic: string, title: string, length: string) {
  const sectionCount = length === 'short' ? 4 : length === 'medium' ? 6 : length === 'long' ? 8 : 10;
  const lengthPerSection = length === 'short' ? 300 : length === 'medium' ? 450 : length === 'long' ? 550 : 650;

  const baseSections = [
    { title: '도입부', keyPoints: ['주제 소개', '독자의 관심 유도', '글의 목적 제시'] },
    { title: `${topic}이란?`, keyPoints: ['핵심 개념 설명', '기본 정의', '중요성'] },
    { title: '주요 특징', keyPoints: ['특징 1', '특징 2', '특징 3'] },
    { title: '활용 방법', keyPoints: ['단계별 가이드', '실용적 팁', '주의사항'] },
    { title: '장단점 분석', keyPoints: ['장점', '단점', '비교 분석'] },
    { title: '실제 사례', keyPoints: ['성공 사례', '실패 사례', '교훈'] },
    { title: '자주 하는 실수', keyPoints: ['실수 1', '실수 2', '해결책'] },
    { title: '전문가 팁', keyPoints: ['팁 1', '팁 2', '팁 3'] },
    { title: '향후 전망', keyPoints: ['트렌드', '예측', '준비 방법'] },
    { title: '결론', keyPoints: ['핵심 요약', '행동 촉구', '마무리'] },
  ];

  const sections = baseSections.slice(0, sectionCount).map((s, i) => ({
    id: `section-${i + 1}`,
    title: s.title,
    level: i === 0 || i === sectionCount - 1 ? 1 : 2,
    keyPoints: s.keyPoints,
    estimatedLength: lengthPerSection,
    order: i,
  }));

  return {
    topic,
    title,
    sections,
    estimatedTotalLength: sections.reduce((sum, s) => sum + s.estimatedLength, 0),
  };
}
