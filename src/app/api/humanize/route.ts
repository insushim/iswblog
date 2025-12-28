import { NextRequest, NextResponse } from 'next/server';
import { humanizePrompt } from '@/lib/prompts/writing-prompts';
import { getBloggerById, mergeBloggerStyles } from '@/lib/bloggers';

// ============================================================
// Humanize API Route
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, level, bloggerStyles, tone } = body;

    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠가 없습니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return mock humanized content
      return NextResponse.json({
        humanizedContent: humanizeMock(content, level || 'moderate'),
        humanScore: 85,
        changes: [
          '문장 구조 자연스럽게 변경',
          '구어체 표현 추가',
          '개인적인 경험 예시 추가',
          '감정적 표현 강화',
        ],
      });
    }

    // Get blogger style information
    const bloggerProfiles = bloggerStyles?.map((id: string) => getBloggerById(id)).filter(Boolean) || [];
    const mergedStyle = bloggerProfiles.length > 0 ? mergeBloggerStyles(bloggerProfiles) : null;

    const prompt = humanizePrompt
      .replace('{LEVEL}', level || 'moderate')
      .replace('{BLOGGER_STYLE}', mergedStyle ? JSON.stringify(mergedStyle) : '없음')
      .replace('{TONE}', tone || 'friendly');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: `다음 콘텐츠를 자연스럽게 휴머나이즈해주세요:\n\n${content}`,
          },
        ],
        temperature: 0.9,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error('API 요청 실패');
    }

    const data = await response.json();
    let humanizedContent = data.choices[0]?.message?.content || '';

    // Clean up
    humanizedContent = humanizedContent.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({
      humanizedContent,
      humanScore: calculateHumanScore(humanizedContent),
      changes: detectChanges(content, humanizedContent),
    });
  } catch (error) {
    console.error('Humanize API error:', error);
    return NextResponse.json(
      { error: '휴머나이즈 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function humanizeMock(content: string, level: string): string {
  let result = content;

  // Add conversational elements based on level
  const conversationalPhrases = {
    light: ['사실', '참고로'],
    moderate: ['솔직히 말하면', '제 경험으로는', '흥미롭게도', '여러분도 아시겠지만'],
    strong: ['와, 정말', '사실 저도 처음에는', '믿기 어렵겠지만', '여러분, 이게 바로'],
  };

  const phrases = conversationalPhrases[level as keyof typeof conversationalPhrases] || conversationalPhrases.moderate;

  // Add some personality
  result = result.replace(/<p>/g, () => {
    if (Math.random() > 0.7) {
      return `<p>${phrases[Math.floor(Math.random() * phrases.length)]}, `;
    }
    return '<p>';
  });

  // Add emoji occasionally for strong level
  if (level === 'strong') {
    const emojis = ['😊', '👍', '💡', '✨', '🎯', '📌'];
    result = result.replace(/<\/p>/g, () => {
      if (Math.random() > 0.8) {
        return ` ${emojis[Math.floor(Math.random() * emojis.length)]}</p>`;
      }
      return '</p>';
    });
  }

  return result;
}

function calculateHumanScore(content: string): number {
  let score = 70;

  // Check for conversational elements
  const conversationalPatterns = [
    /제가|저는|제 생각에/g,
    /여러분|독자분/g,
    /솔직히|사실/g,
    /어떠셨나요|궁금하시죠/g,
    /ㅎㅎ|ㅋㅋ|😊|👍/g,
  ];

  for (const pattern of conversationalPatterns) {
    if (pattern.test(content)) {
      score += 5;
    }
  }

  // Check sentence variety
  const sentences = content.replace(/<[^>]+>/g, '').split(/[.!?。]+/).filter(s => s.trim());
  const lengths = sentences.map(s => s.length);
  const variance = calculateVariance(lengths);

  if (variance > 200) {
    score += 10; // Good sentence length variety
  }

  // Penalize repetitive patterns
  const words = content.toLowerCase().match(/[가-힣a-z]+/g) || [];
  const uniqueRatio = new Set(words).size / words.length;

  if (uniqueRatio < 0.5) {
    score -= 10; // Too repetitive
  }

  return Math.min(100, Math.max(0, score));
}

function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  return numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
}

function detectChanges(original: string, humanized: string): string[] {
  const changes: string[] = [];

  const originalText = original.replace(/<[^>]+>/g, '');
  const humanizedText = humanized.replace(/<[^>]+>/g, '');

  // Check for added personal pronouns
  if ((humanizedText.match(/제가|저는|제/g) || []).length > (originalText.match(/제가|저는|제/g) || []).length) {
    changes.push('개인적인 표현 추가');
  }

  // Check for conversational elements
  if ((humanizedText.match(/여러분|독자/g) || []).length > (originalText.match(/여러분|독자/g) || []).length) {
    changes.push('독자에게 말을 거는 표현 추가');
  }

  // Check for questions
  if ((humanizedText.match(/\?/g) || []).length > (originalText.match(/\?/g) || []).length) {
    changes.push('질문형 문장 추가');
  }

  // Check for emoji
  if (/[😊👍💡✨🎯📌🙏❤️]/.test(humanizedText) && !/[😊👍💡✨🎯📌🙏❤️]/.test(originalText)) {
    changes.push('이모지 추가');
  }

  // Length change
  if (humanizedText.length > originalText.length * 1.1) {
    changes.push('추가 설명 및 예시 보강');
  }

  if (changes.length === 0) {
    changes.push('문장 구조 자연스럽게 변경');
  }

  return changes;
}
