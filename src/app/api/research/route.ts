import { NextRequest, NextResponse } from 'next/server';
import { researchPrompt } from '@/lib/prompts/writing-prompts';
import { callGemini } from '@/lib/gemini';

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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return mock data for development
      return NextResponse.json({
        topicAnalysis: generateMockTopicAnalysis(topic),
        keywordResearch: generateMockKeywordResearch(topic),
        audienceInsights: generateMockAudienceInsights(),
        contentAngle: generateMockContentAngle(topic),
      });
    }

    const userPrompt = `주제: ${topic}\n키워드: ${keywords?.join(', ') || ''}\n플랫폼: ${platform || 'general'}`;

    const content = await callGemini(userPrompt, researchPrompt);

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
    // Return structured data based on the response
    return {
      topicAnalysis: {
        mainTopic: topic,
        subTopics: extractKeyPoints(content).slice(0, 3),
        searchIntent: 'informational',
        competitorAnalysis: {
          averageWordCount: 2000,
          commonStructure: ['서론', '본론', '결론'],
          missingAngles: ['실제 사례', '전문가 인터뷰'],
        },
      },
      keywordResearch: {
        primaryKeyword: topic,
        secondaryKeywords: extractKeywords(content).slice(0, 5),
        longTailKeywords: [`${topic} 방법`, `${topic} 추천`, `${topic} 비교`],
        questionKeywords: [`${topic}이란?`, `${topic} 어떻게?`],
      },
      audienceInsights: {
        demographics: ['20-40대', '직장인', '관심있는 일반인'],
        painPoints: ['정보 부족', '시간 부족', '비용 문제'],
        desiredOutcomes: ['문제 해결', '지식 습득', '실용적 팁'],
      },
      contentAngle: {
        uniqueValue: content.slice(0, 100),
        differentiator: '실제 경험 기반 정보 제공',
        hook: `${topic}에 대해 알아야 할 모든 것`,
      },
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

function generateMockTopicAnalysis(topic: string) {
  return {
    mainTopic: topic,
    subTopics: [`${topic} 기초`, `${topic} 활용`, `${topic} 트렌드`],
    searchIntent: 'informational',
    competitorAnalysis: {
      averageWordCount: 2500,
      commonStructure: ['개요', '상세 설명', '실용 팁', '결론'],
      missingAngles: ['최신 동향', '실제 사례'],
    },
  };
}

function generateMockKeywordResearch(topic: string) {
  return {
    primaryKeyword: topic,
    secondaryKeywords: [`${topic} 방법`, `${topic} 추천`, `${topic} 비교`],
    longTailKeywords: [`${topic} 초보자 가이드`, `${topic} 2024 트렌드`],
    questionKeywords: [`${topic}이란 무엇인가?`, `${topic} 어떻게 시작하나요?`],
  };
}

function generateMockAudienceInsights() {
  return {
    demographics: ['20-40대', '직장인', '학생'],
    painPoints: ['정보 부족', '어디서 시작할지 모름'],
    desiredOutcomes: ['실용적 정보 획득', '문제 해결'],
  };
}

function generateMockContentAngle(topic: string) {
  return {
    uniqueValue: `${topic}에 대한 종합 가이드`,
    differentiator: '실제 경험 기반 정보',
    hook: `${topic}, 이것만 알면 됩니다`,
  };
}
