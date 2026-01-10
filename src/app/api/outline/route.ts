import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

// ============================================================
// Outline API Route - 아웃라인 생성
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, title, tone, length, keywords, platform, referenceText } = body;

    console.log('[Outline API] Request:', { topic, title, tone, length });

    if (!topic) {
      return NextResponse.json(
        { error: '주제를 입력해주세요.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log('[Outline API] No API key, using mock data');
      return NextResponse.json(generateMockOutline(topic, title || topic, length || 'medium'));
    }

    const systemPrompt = `당신은 전문 블로그 콘텐츠 아웃라인 설계자입니다.
주어진 주제에 대해 SEO 최적화된 블로그 글의 아웃라인을 생성해주세요.

반드시 아래 JSON 형식으로만 응답해주세요:
{
  "title": "블로그 제목",
  "meta": {
    "targetWordCount": 예상글자수(숫자),
    "estimatedReadTime": 예상읽기시간(분),
    "primaryKeyword": "주요키워드",
    "secondaryKeywords": ["부키워드1", "부키워드2"]
  },
  "structure": {
    "introduction": {
      "hook": "question",
      "hookContent": "도입부 첫 문장",
      "context": "배경 설명",
      "thesis": "핵심 주장",
      "preview": ["미리보기1", "미리보기2"],
      "estimatedWords": 200
    },
    "sections": [
      {
        "id": "section-1",
        "order": 0,
        "type": "main",
        "heading": "섹션 제목",
        "headingLevel": 2,
        "keyPoints": ["핵심포인트1", "핵심포인트2", "핵심포인트3"],
        "supportingElements": ["example", "statistic"],
        "transitionTo": "다음 섹션으로의 연결",
        "estimatedWords": 400,
        "keywordsToInclude": ["키워드1"]
      }
    ],
    "conclusion": {
      "summaryPoints": ["요약1", "요약2"],
      "finalThought": "마무리 생각",
      "callToAction": "행동 촉구",
      "estimatedWords": 150
    }
  }
}

섹션은 5-7개를 생성하세요.`;

    const userPrompt = `다음 정보를 바탕으로 블로그 아웃라인을 생성해주세요:

주제: ${topic}
제목: ${title || '(자동 생성)'}
어조: ${tone || 'friendly'}
길이: ${length || 'medium'}
키워드: ${keywords?.join(', ') || '없음'}
플랫폼: ${platform || 'naver'}
${referenceText ? `참고자료: ${referenceText.slice(0, 500)}` : ''}

한국어로 작성해주세요.`;

    console.log('[Outline API] Calling Gemini...');
    const content = await callGemini(userPrompt, systemPrompt);
    console.log('[Outline API] Gemini response received');

    const outline = parseOutlineResponse(content, topic, title);
    console.log('[Outline API] Parsed outline:', outline.title);

    return NextResponse.json(outline);
  } catch (error) {
    console.error('[Outline API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `아웃라인 생성 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function parseOutlineResponse(content: string, topic: string, title?: string) {
  try {
    // JSON 블록 추출
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Outline 타입에 맞게 반환
      return {
        title: parsed.title || title || topic,
        meta: parsed.meta || {
          targetWordCount: 2000,
          estimatedReadTime: 5,
          primaryKeyword: topic,
          secondaryKeywords: [],
        },
        structure: {
          introduction: parsed.structure?.introduction || {
            hook: 'question',
            hookContent: '',
            context: '',
            thesis: '',
            preview: [],
            estimatedWords: 200,
          },
          sections: (parsed.structure?.sections || parsed.sections || []).map((s: Record<string, unknown>, i: number) => ({
            id: s.id || `section-${i + 1}`,
            order: s.order ?? i,
            type: s.type || 'main',
            heading: s.heading || s.title || `섹션 ${i + 1}`,
            headingLevel: s.headingLevel || 2,
            keyPoints: s.keyPoints || s.points || [],
            supportingElements: s.supportingElements || [],
            transitionTo: s.transitionTo || '',
            estimatedWords: s.estimatedWords || 400,
            keywordsToInclude: s.keywordsToInclude || [],
          })),
          conclusion: parsed.structure?.conclusion || {
            summaryPoints: [],
            finalThought: '',
            callToAction: '',
            estimatedWords: 150,
          },
        },
      };
    }

    throw new Error('JSON 파싱 실패');
  } catch (parseError) {
    console.error('[Outline API] Parse error:', parseError);
    // 파싱 실패 시 기본 구조 반환
    return generateMockOutline(topic, title || topic, 'medium');
  }
}

function generateMockOutline(topic: string, title: string, length: string) {
  const sectionCount = length === 'short' ? 4 : length === 'medium' ? 6 : 8;

  const baseSections = [
    { heading: `${topic}이란 무엇인가?`, keyPoints: ['핵심 개념 설명', '기본 정의와 중요성', '왜 알아야 하는가'] },
    { heading: '주요 특징과 장점', keyPoints: ['특징 1: 상세 설명', '특징 2: 상세 설명', '특징 3: 상세 설명'] },
    { heading: '시작하는 방법', keyPoints: ['1단계: 준비하기', '2단계: 실행하기', '3단계: 확인하기'] },
    { heading: '실제 활용 사례', keyPoints: ['사례 1: 성공 케이스', '사례 2: 응용 방법', '사례 3: 결과 분석'] },
    { heading: '주의사항과 팁', keyPoints: ['흔한 실수 피하기', '전문가 팁', '효과 극대화 방법'] },
    { heading: '자주 묻는 질문', keyPoints: ['Q1: 기본 질문', 'Q2: 심화 질문', 'Q3: 실용적 질문'] },
    { heading: '향후 전망', keyPoints: ['현재 트렌드', '미래 예측', '준비 방법'] },
    { heading: '마무리', keyPoints: ['핵심 요약', '다음 단계', '추가 리소스'] },
  ];

  const sections = baseSections.slice(0, sectionCount).map((s, i) => ({
    id: `section-${i + 1}`,
    order: i,
    type: 'main' as const,
    heading: s.heading,
    headingLevel: 2 as const,
    keyPoints: s.keyPoints,
    supportingElements: ['example'] as ('example' | 'statistic')[],
    transitionTo: '',
    estimatedWords: 400,
    keywordsToInclude: [topic],
  }));

  return {
    title: title || `${topic}: 완벽 가이드`,
    meta: {
      targetWordCount: sections.length * 400 + 350,
      estimatedReadTime: Math.ceil((sections.length * 400 + 350) / 400),
      primaryKeyword: topic,
      secondaryKeywords: [],
    },
    structure: {
      introduction: {
        hook: 'question' as const,
        hookContent: `${topic}에 대해 알고 싶으신가요?`,
        context: `${topic}은 많은 사람들이 관심을 가지는 주제입니다.`,
        thesis: `이 글에서는 ${topic}에 대해 상세히 알아보겠습니다.`,
        preview: sections.slice(0, 3).map(s => s.heading),
        estimatedWords: 200,
      },
      sections,
      conclusion: {
        summaryPoints: [`${topic}의 핵심 내용을 정리했습니다.`, '실제 적용해보세요.'],
        finalThought: `${topic}을 통해 더 나은 결과를 얻으시길 바랍니다.`,
        callToAction: '궁금한 점이 있다면 댓글로 남겨주세요!',
        estimatedWords: 150,
      },
    },
  };
}
