import { NextRequest, NextResponse } from 'next/server';
import { crossValidationPrompt } from '@/lib/prompts/writing-prompts';

// ============================================================
// Content Grading API Route
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, topic } = body;

    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠가 없습니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return mock grade for development
      return NextResponse.json({
        grade: generateMockGrade(content),
      });
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
          { role: 'system', content: crossValidationPrompt },
          {
            role: 'user',
            content: `다음 블로그 글을 평가해주세요:\n\n제목: ${title || '제목 없음'}\n주제: ${topic || '주제 없음'}\n\n내용:\n${content}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error('API 요청 실패');
    }

    const data = await response.json();
    const gradeContent = data.choices[0]?.message?.content;

    const grade = parseGradeResponse(gradeContent, content);

    return NextResponse.json({ grade });
  } catch (error) {
    console.error('Grade API error:', error);
    return NextResponse.json(
      { error: '콘텐츠 평가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function parseGradeResponse(responseContent: string, originalContent: string) {
  try {
    const jsonMatch = responseContent.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(responseContent);
  } catch {
    return generateMockGrade(originalContent);
  }
}

function generateMockGrade(content: string) {
  const plainText = content.replace(/<[^>]+>/g, '');
  const wordCount = plainText.length;

  // Calculate various scores based on content analysis
  const headingsCount = (content.match(/<h[1-6][^>]*>/g) || []).length;
  const paragraphsCount = (content.match(/<p[^>]*>/g) || []).length;
  const listsCount = (content.match(/<[ou]l[^>]*>/g) || []).length;

  // Check for conversational elements
  const hasQuestions = (plainText.match(/\?/g) || []).length > 0;
  const hasPersonalPronouns = /제가|저는|여러분/.test(plainText);
  const hasEmojis = /[😊👍💡✨🎯📌🙏❤️]/.test(plainText);

  // Calculate scores
  let originality = 75;
  let readability = 70;
  let engagement = 65;
  let seoScore = 60;
  let humanScore = 70;

  // Adjust based on content structure
  if (headingsCount >= 3) {
    readability += 10;
    seoScore += 10;
  }
  if (paragraphsCount >= 5) {
    readability += 5;
  }
  if (listsCount > 0) {
    readability += 5;
    engagement += 5;
  }

  // Adjust based on engagement factors
  if (hasQuestions) {
    engagement += 10;
    humanScore += 5;
  }
  if (hasPersonalPronouns) {
    humanScore += 10;
    engagement += 5;
  }
  if (hasEmojis) {
    humanScore += 5;
  }

  // Length adjustments
  if (wordCount >= 2000) {
    seoScore += 10;
    originality += 5;
  }
  if (wordCount >= 3000) {
    seoScore += 5;
    originality += 5;
  }

  // Cap scores at 100
  originality = Math.min(100, originality);
  readability = Math.min(100, readability);
  engagement = Math.min(100, engagement);
  seoScore = Math.min(100, seoScore);
  humanScore = Math.min(100, humanScore);

  // Calculate overall score
  const overall = Math.round(
    originality * 0.2 +
    readability * 0.25 +
    engagement * 0.25 +
    seoScore * 0.15 +
    humanScore * 0.15
  );

  // Generate feedback
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  if (headingsCount >= 3) {
    strengths.push('잘 구조화된 제목 체계');
  } else {
    weaknesses.push('제목 구조가 부족합니다');
    suggestions.push('H2, H3 제목을 추가하여 구조를 개선하세요');
  }

  if (wordCount >= 1500) {
    strengths.push('충분한 콘텐츠 길이');
  } else {
    weaknesses.push('콘텐츠가 다소 짧습니다');
    suggestions.push('더 상세한 설명과 예시를 추가하세요');
  }

  if (hasQuestions) {
    strengths.push('독자 참여를 유도하는 질문 포함');
  } else {
    suggestions.push('독자에게 질문을 던져 참여를 유도하세요');
  }

  if (hasPersonalPronouns) {
    strengths.push('개인적이고 친근한 톤');
  } else {
    weaknesses.push('글이 다소 딱딱할 수 있습니다');
    suggestions.push('개인적인 경험이나 의견을 추가하세요');
  }

  if (listsCount > 0) {
    strengths.push('리스트를 활용한 가독성 향상');
  } else {
    suggestions.push('핵심 포인트를 리스트로 정리하세요');
  }

  return {
    overall,
    originality,
    readability,
    engagement,
    seoScore,
    humanScore,
    strengths,
    weaknesses,
    suggestions,
  };
}
